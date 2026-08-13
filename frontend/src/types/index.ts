// User / Auth types
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'USER' | 'ADMIN';
  createdAt?: string;
}

// Specialization Grade
export interface Grade {
  id: string;
  name: string;
  description?: string;
  order: number;
  color: string;
}

// License
export interface License {
  id: string;
  name: string;
  description: string;
  price: number;
  durationDays: number;
  benefits: string[];
  requirements?: string;
  syllabus?: string;
  active: boolean;
  imageUrl?: string;
  gradeId: string;
  grade: Grade;
  prerequisiteId?: string;
  prerequisite?: Pick<License, 'id' | 'name'>;
}

// Purchase / Order
export interface Purchase {
  id: string;
  userId: string;
  licenseId: string;
  license: License;
  amount: number;
  currency: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  createdAt: string;
  userLicense?: UserLicense;
}

// User License (issued)
export interface UserLicense {
  id: string;
  userId: string;
  licenseId: string;
  license: License;
  purchaseId: string;
  code: string;
  issuedAt: string;
  expiresAt: string;
  pdfUrl?: string;
  status?: 'ACTIVE' | 'EXPIRED';
  daysUntilExpiry?: number;
}

// WhatsApp
export interface WhatsAppConversation {
  id: string;
  phone: string;
  userId?: string;
  user?: Pick<User, 'name' | 'email'>;
  updatedAt: string;
  messages: WhatsAppMessage[];
  _count?: { messages: number };
}

export interface WhatsAppMessage {
  id: string;
  conversationId: string;
  body: string;
  direction: 'INBOUND' | 'OUTBOUND';
  timestamp: string;
}

// Verification
export interface VerifyResult {
  valid: boolean;
  status: 'ACTIVA' | 'VENCIDA';
  isActive: boolean;
  code: string;
  holder: string;
  license: {
    name: string;
    grade: string;
    gradeColor: string;
  };
  issuedAt: string;
  expiresAt: string;
  daysUntilExpiry: number;
}

// Admin Report
export interface SalesReport {
  summary: {
    totalRevenue: number;
    totalPurchases: number;
    activeLicenses: number;
    expiringSoon: number;
  };
  recentPurchases: Purchase[];
  salesByDay: { date: string; count: number; revenue: number }[];
}

// Cart
export interface CartItem {
  license: License;
}
