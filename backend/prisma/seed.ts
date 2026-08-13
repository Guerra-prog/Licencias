import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // =============================================
  // 1. GRADOS DE ESPECIALIZACIÓN
  // =============================================
  const gradeBasico = await prisma.specializationGrade.upsert({
    where: { name: 'Básico' },
    update: {},
    create: {
      name: 'Básico',
      description: 'Nivel de entrada. Fundamentos esenciales para iniciar en el área.',
      order: 1,
      color: '#10b981',
    },
  });

  const gradeIntermedio = await prisma.specializationGrade.upsert({
    where: { name: 'Intermedio' },
    update: {},
    create: {
      name: 'Intermedio',
      description: 'Conocimientos sólidos y aplicación práctica de conceptos avanzados.',
      order: 2,
      color: '#6366f1',
    },
  });

  const gradeAvanzado = await prisma.specializationGrade.upsert({
    where: { name: 'Avanzado' },
    update: {},
    create: {
      name: 'Avanzado',
      description: 'Dominio técnico profundo y gestión de proyectos complejos.',
      order: 3,
      color: '#f59e0b',
    },
  });

  const gradeExperto = await prisma.specializationGrade.upsert({
    where: { name: 'Experto' },
    update: {},
    create: {
      name: 'Experto',
      description: 'Máximo nivel de especialización. Liderazgo estratégico y consultoría.',
      order: 4,
      color: '#ef4444',
    },
  });

  console.log('✅ Grados creados');

  // =============================================
  // 2. LICENCIAS
  // =============================================
  const licBasica = await prisma.license.upsert({
    where: { id: 'lic-basica-001' },
    update: {},
    create: {
      id: 'lic-basica-001',
      name: 'Certificación Profesional Básica',
      description:
        'Licencia de nivel básico que acredita el conocimiento de fundamentos esenciales. Ideal para quienes inician su carrera profesional.',
      price: 49.99,
      durationDays: 365,
      gradeId: gradeBasico.id,
      benefits: [
        'Acceso a materiales de formación básica',
        'Insignia digital verificable',
        'Soporte por email 48h',
        'Validez de 1 año',
        'Certificado descargable en PDF',
      ],
      syllabus:
        '## Módulo 1: Fundamentos\n- Conceptos básicos y terminología\n- Marco de referencia profesional\n\n## Módulo 2: Aplicación\n- Casos prácticos básicos\n- Herramientas fundamentales',
      requirements: 'Sin requisitos previos',
      imageUrl: null,
      active: true,
    },
  });

  const licIntermedia = await prisma.license.upsert({
    where: { id: 'lic-intermedia-001' },
    update: {},
    create: {
      id: 'lic-intermedia-001',
      name: 'Certificación Profesional Intermedia',
      description:
        'Licencia intermedia que certifica habilidades prácticas y conocimientos técnicos en el área de especialización.',
      price: 129.99,
      durationDays: 365,
      gradeId: gradeIntermedio.id,
      prerequisiteId: licBasica.id,
      benefits: [
        'Todos los beneficios del nivel Básico',
        'Acceso a proyectos prácticos intermedios',
        'Soporte prioritario 24h',
        'Networking con comunidad de profesionales',
        'Validez de 1 año con renovación especial',
      ],
      syllabus:
        '## Módulo 1: Profundización técnica\n- Metodologías avanzadas\n- Gestión de proyectos\n\n## Módulo 2: Trabajo en equipo\n- Colaboración interdisciplinaria\n- Comunicación efectiva\n\n## Módulo 3: Aplicaciones prácticas\n- Casos de estudio reales\n- Ejercicios supervisados',
      requirements: 'Requiere: Certificación Profesional Básica vigente',
      imageUrl: null,
      active: true,
    },
  });

  const licAvanzada = await prisma.license.upsert({
    where: { id: 'lic-avanzada-001' },
    update: {},
    create: {
      id: 'lic-avanzada-001',
      name: 'Certificación Profesional Avanzada',
      description:
        'Licencia avanzada para profesionales con experiencia sólida. Certifica dominio técnico y capacidad de liderazgo en proyectos complejos.',
      price: 249.99,
      durationDays: 730,
      gradeId: gradeAvanzado.id,
      prerequisiteId: licIntermedia.id,
      benefits: [
        'Todos los beneficios del nivel Intermedio',
        'Acceso a laboratorios avanzados',
        'Mentoría mensual con expertos',
        'Inclusión en directorio de profesionales certificados',
        'Validez de 2 años',
        'Descuento en renovación del 25%',
      ],
      syllabus:
        '## Módulo 1: Arquitectura y diseño\n- Patrones de diseño avanzados\n- Arquitectura de soluciones\n\n## Módulo 2: Liderazgo técnico\n- Gestión de equipos\n- Mentoring y coaching\n\n## Módulo 3: Innovación\n- Tendencias emergentes\n- I+D aplicado\n\n## Módulo 4: Gestión estratégica\n- Planificación a largo plazo\n- Métricas de éxito',
      requirements: 'Requiere: Certificación Profesional Intermedia vigente',
      imageUrl: null,
      active: true,
    },
  });

  await prisma.license.upsert({
    where: { id: 'lic-experta-001' },
    update: {},
    create: {
      id: 'lic-experta-001',
      name: 'Certificación Profesional Experta',
      description:
        'El máximo nivel de certificación. Para líderes y consultores que requieren el más alto grado de reconocimiento en su área de especialización.',
      price: 499.99,
      durationDays: 730,
      gradeId: gradeExperto.id,
      prerequisiteId: licAvanzada.id,
      benefits: [
        'Todos los beneficios del nivel Avanzado',
        'Título de "Experto Certificado" en la plataforma',
        'Acceso a eventos exclusivos y conferencias',
        'Prioridad en oportunidades laborales de la red',
        'Soporte VIP dedicado',
        'Validez de 2 años con renovación gratuita el primer año',
        'Co-autoría en publicaciones de la plataforma',
      ],
      syllabus:
        '## Módulo 1: Consultoría estratégica\n- Metodología de consultoría\n- Gestión de clientes corporativos\n\n## Módulo 2: Investigación aplicada\n- Diseño de investigaciones\n- Publicación de resultados\n\n## Módulo 3: Liderazgo organizacional\n- Transformación digital\n- Change management\n\n## Módulo 4: Ecosistema profesional\n- Construcción de marca personal\n- Expansión internacional',
      requirements: 'Requiere: Certificación Profesional Avanzada vigente',
      imageUrl: null,
      active: true,
    },
  });

  console.log('✅ Licencias creadas');

  // =============================================
  // 3. USUARIOS
  // =============================================
  const adminPass = await bcrypt.hash('Admin123!', 12);
  const userPass = await bcrypt.hash('User123!', 12);

  await prisma.user.upsert({
    where: { email: 'admin@licencias.com' },
    update: {},
    create: {
      email: 'admin@licencias.com',
      password: adminPass,
      name: 'Administrador',
      phone: '+573001234567',
      role: Role.ADMIN,
    },
  });

  await prisma.user.upsert({
    where: { email: 'usuario@licencias.com' },
    update: {},
    create: {
      email: 'usuario@licencias.com',
      password: userPass,
      name: 'Juan Pérez',
      phone: '+573009876543',
      role: Role.USER,
    },
  });

  console.log('✅ Usuarios creados');
  console.log('\n🎉 Seed completado exitosamente!\n');
  console.log('Credenciales de prueba:');
  console.log('  Admin  → admin@licencias.com   / Admin123!');
  console.log('  Usuario → usuario@licencias.com / User123!\n');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
