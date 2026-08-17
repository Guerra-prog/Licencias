import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

const licenses = [
  {
    codigo: 'A2',
    nombre: 'A2 – Motocicletas',
    descripcion:
      'Licencia para conducción de motocicletas, motociclos y mototriciclos de cualquier cilindraje.',
    precioCurso: 578000,
    precioMedico: 245000,
    precioLicenciaTransito: 177000,
    precioTotal: 1000000,
    horasTeoria: 25,
    horasTaller: 3,
    horasPractica: 15,
    horasTotal: 43,
    requisitos: 'Ser mayor de 16 años. Documento de identidad. Saber leer y escribir.',
  },
  {
    codigo: 'B1',
    nombre: 'B1 – Vehículo particular',
    descripcion:
      'Licencia para conducción de automóviles, camperos, camionetas y microbuses de servicio particular.',
    precioCurso: 928000,
    precioMedico: 245000,
    precioLicenciaTransito: 177000,
    precioTotal: 1350000,
    horasTeoria: 25,
    horasTaller: 5,
    horasPractica: 20,
    horasTotal: 50,
    requisitos: 'Ser mayor de 18 años. Documento de identidad. Saber leer y escribir.',
  },
  {
    codigo: 'C1',
    nombre: 'C1 – Servicio público y particular',
    descripcion:
      'Licencia para conducción de automóviles, camperos, camionetas y microbuses de servicio público y particular.',
    precioCurso: 1378000,
    precioMedico: 245000,
    precioLicenciaTransito: 177000,
    precioTotal: 1800000,
    horasTeoria: 30,
    horasTaller: 5,
    horasPractica: 30,
    horasTotal: 65,
    requisitos: 'Ser mayor de 18 años. Documento de identidad. Saber leer y escribir.',
  },
  {
    codigo: 'RC1',
    nombre: 'RC1 – Recategorización a C1',
    descripcion:
      'Recategorización de licencia B1 a C1 para conducción de vehículos de servicio público.',
    precioCurso: 928000,
    precioMedico: 245000,
    precioLicenciaTransito: 177000,
    precioTotal: 1350000,
    horasTeoria: 5,
    horasTaller: 0,
    horasPractica: 10,
    horasTotal: 15,
    requisitos: 'Tener licencia B1 vigente registrada en el RUNT. Ser mayor de 18 años.',
  },
  {
    codigo: 'RC2',
    nombre: 'RC2 – Vehículos pesados',
    descripcion:
      'Recategorización para conducción de vehículos pesados (camiones rígidos, busetas y buses).',
    precioCurso: 1578000,
    precioMedico: 245000,
    precioLicenciaTransito: 177000,
    precioTotal: 2000000,
    horasTeoria: 20,
    horasTaller: 10,
    horasPractica: 15,
    horasTotal: 45,
    requisitos: 'Tener licencia C1 vigente registrada en el RUNT. Ser mayor de 18 años.',
  },
];

const combos = [
  {
    nombre: 'Combo A2 + B1',
    descripcion: 'Licencia de motocicleta A2 y vehículo particular B1 en un solo paquete.',
    codigos: ['A2', 'B1'],
    precioCurso: 1506000,
    precioMedico: 335000,
    precioTransito: 354000,
    precioTotal: 2195000,
  },
  {
    nombre: 'Combo A2 + C1',
    descripcion: 'Licencia de motocicleta A2 y servicio público C1 en un solo paquete.',
    codigos: ['A2', 'C1'],
    precioCurso: 1956000,
    precioMedico: 335000,
    precioTransito: 354000,
    precioTotal: 2645000,
  },
  {
    nombre: 'Combo A2 + C2',
    descripcion:
      'Licencia de motocicleta A2 y recategorización a vehículos pesados (C2) en un solo paquete.',
    codigos: ['A2', 'RC2'],
    precioCurso: 2156000,
    precioMedico: 335000,
    precioTransito: 354000,
    precioTotal: 2845000,
  },
];

const services = [
  {
    nombre: 'Pruebas de idoneidad (A2, B1, C1, RC2)',
    descripcion:
      'Evaluación teórica y práctica de idoneidad para las categorías A2, B1, C1 y RC2.',
  },
  {
    nombre: 'Capacitación en seguridad vial',
    descripcion: 'Cursos y talleres de capacitación en seguridad vial para empresas y particulares.',
  },
  {
    nombre: 'Clases de refuerzo',
    descripcion: 'Clases prácticas adicionales de refuerzo para estudiantes que lo requieran.',
  },
];

async function main() {
  console.log('🌱 Iniciando seed...');

  for (const license of licenses) {
    await prisma.license.upsert({
      where: { codigo: license.codigo },
      update: license,
      create: license,
    });
    console.log(`  ✔ Licencia ${license.codigo}`);
  }

  for (const combo of combos) {
    const { codigos, ...data } = combo;
    const comboLicenses = await prisma.license.findMany({
      where: { codigo: { in: codigos } },
    });

    const existing = await prisma.combo.findFirst({ where: { nombre: data.nombre } });
    if (existing) {
      await prisma.combo.update({
        where: { id: existing.id },
        data: {
          ...data,
          licenses: {
            deleteMany: {},
            create: comboLicenses.map((l) => ({ licenseId: l.id })),
          },
        },
      });
    } else {
      await prisma.combo.create({
        data: {
          ...data,
          licenses: {
            create: comboLicenses.map((l) => ({ licenseId: l.id })),
          },
        },
      });
    }
    console.log(`  ✔ ${data.nombre}`);
  }

  for (const service of services) {
    const existing = await prisma.additionalService.findFirst({
      where: { nombre: service.nombre },
    });
    if (existing) {
      await prisma.additionalService.update({ where: { id: existing.id }, data: service });
    } else {
      await prisma.additionalService.create({ data: service });
    }
    console.log(`  ✔ Servicio: ${service.nombre}`);
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (adminEmail && adminPassword) {
    const hashed = await bcrypt.hash(adminPassword, 10);
    await prisma.user.upsert({
      where: { email: adminEmail },
      update: { role: 'admin' },
      create: {
        nombre: 'Administrador CEA AMC',
        email: adminEmail,
        password: hashed,
        role: 'admin',
      },
    });
    console.log(`  ✔ Usuario admin: ${adminEmail}`);
  } else {
    console.warn('  ⚠ ADMIN_EMAIL / ADMIN_PASSWORD no definidos; no se creó usuario admin.');
  }

  console.log('✅ Seed completado.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
