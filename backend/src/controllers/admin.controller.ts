import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { sendWhatsAppMessage } from '../services/whatsapp.service';
import { createError } from '../middleware/errorHandler';

// GET /api/admin/users
export const getUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search, role, blocked } = req.query;
    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { name: { contains: String(search), mode: 'insensitive' } },
        { email: { contains: String(search), mode: 'insensitive' } },
      ];
    }
    if (role) where.role = String(role);
    if (blocked !== undefined) where.blocked = blocked === 'true';

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true, name: true, email: true, phone: true,
        role: true, blocked: true, createdAt: true,
        _count: { select: { userLicenses: true, purchases: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(users);
  } catch (err) {
    next(err);
  }
};

// PUT /api/admin/users/:id
export const updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { role, blocked } = req.body;
    const data: Record<string, unknown> = {};
    if (role !== undefined) data.role = role;
    if (blocked !== undefined) data.blocked = blocked;

    const user = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, name: true, email: true, role: true, blocked: true },
    });

    res.json({ message: 'Usuario actualizado', user });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/reports
export const getSalesReport = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const [
      totalRevenue,
      totalPurchases,
      recentPurchases,
      activeLicenses,
      expiringSoon,
      salesByGrade,
      salesByDay,
    ] = await Promise.all([
      // Revenue total
      prisma.purchase.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true },
      }),
      // Total compras
      prisma.purchase.count({ where: { status: 'COMPLETED' } }),
      // Compras últimos 30 días
      prisma.purchase.findMany({
        where: {
          status: 'COMPLETED',
          createdAt: { gte: thirtyDaysAgo },
        },
        include: {
          license: { include: { grade: true } },
          user: { select: { name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
      // Licencias activas
      prisma.userLicense.count({
        where: { expiresAt: { gte: now } },
      }),
      // Vencen en 7 días
      prisma.userLicense.count({
        where: { expiresAt: { gte: now, lte: sevenDaysFromNow } },
      }),
      // Ventas por grado
      prisma.purchase.groupBy({
        by: ['licenseId'],
        where: { status: 'COMPLETED' },
        _count: true,
        _sum: { amount: true },
      }),
      // Ventas por día (últimos 30 días)
      prisma.$queryRaw`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as count,
          SUM(amount) as revenue
        FROM purchases
        WHERE status = 'COMPLETED' AND created_at >= ${thirtyDaysAgo}
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `,
    ]);

    res.json({
      summary: {
        totalRevenue: totalRevenue._sum.amount || 0,
        totalPurchases,
        activeLicenses,
        expiringSoon,
      },
      recentPurchases,
      salesByGrade,
      salesByDay,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/conversations
export const getConversations = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const conversations = await prisma.whatsAppConversation.findMany({
      include: {
        user: { select: { name: true, email: true } },
        messages: { orderBy: { timestamp: 'desc' }, take: 1 },
        _count: { select: { messages: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
    res.json(conversations);
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/conversations/:id
export const getConversationMessages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const conversation = await prisma.whatsAppConversation.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        messages: { orderBy: { timestamp: 'asc' } },
      },
    });
    if (!conversation) throw createError('Conversación no encontrada', 404);
    res.json(conversation);
  } catch (err) {
    next(err);
  }
};

// POST /api/admin/conversations/:id/reply
export const replyToConversation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    if (!message) throw createError('El mensaje es requerido', 400);

    const conversation = await prisma.whatsAppConversation.findUnique({
      where: { id },
    });
    if (!conversation) throw createError('Conversación no encontrada', 404);

    const sid = await sendWhatsAppMessage(conversation.phone, message);

    await prisma.whatsAppMessage.create({
      data: {
        conversationId: id,
        body: message,
        direction: 'OUTBOUND',
        twilioSid: sid || undefined,
      },
    });

    res.json({ message: 'Mensaje enviado' });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/licenses
export const getAllLicenses = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const licenses = await prisma.license.findMany({
      include: { grade: true },
      orderBy: [{ grade: { order: 'asc' } }, { name: 'asc' }],
    });
    res.json(licenses);
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/expiring-soon
export const getExpiringSoon = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const days = parseInt(String(req.query.days || '30'));
    const now = new Date();
    const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    const expiring = await prisma.userLicense.findMany({
      where: {
        expiresAt: { gte: now, lte: future },
        reminderSent: false,
      },
      include: {
        user: { select: { name: true, email: true, phone: true } },
        license: { select: { name: true } },
      },
    });

    res.json(expiring);
  } catch (err) {
    next(err);
  }
};
