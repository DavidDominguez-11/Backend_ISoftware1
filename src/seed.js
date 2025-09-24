const prisma = require('./prismaClient');
const bcrypt = require('bcrypt');

async function main() {
  // Roles
  const roles = await prisma.roles.createMany({
    data: [
      { rol: 'Administrador' },
      { rol: 'Operaciones' },
      { rol: 'Logistica' },
      { rol: 'Cliente' }
    ]
  });

  // Usuarios
  const hashedPasswords = [
    '$2b$10$TVp9OMgQT64f1r7A8DYyJeYwoGNZqhK8YV3JFqKR14zBEBxLpylom',
    '$2b$10$EsuwFtqivL7i8dJhYkr1WevNA0fJLLOHgFbV2NFG2DNWus.oBep9e',
    '$2b$10$/OplDk.tAT2.8CfoGptg8.DglB27k3pDnEqHklPZJmG1YRc6q6qkW',
    '$2b$10$zL3yqwRkBQisRrO6cUAkZe81pg5uByJazhhROt4GJzxGC1qQNC1ym',
    '$2b$10$J/XhHQx33GT/ViSjI7nzJ.NjaTBayy.g2lv7JwhGBSN1/RCw2nSUK'
  ];
  await prisma.usuarios.createMany({
    data: [
      { nombre: 'admin', email: 'admin@ejemplo.com', contraseña: hashedPasswords[0] },
      { nombre: 'gerente', email: 'gerente@ejemplo.com', contraseña: hashedPasswords[1] },
      { nombre: 'secretaria', email: 'secretaria@ejemplo.com', contraseña: hashedPasswords[2] },
      { nombre: 'ingeniero', email: 'ingeniero@ejemplo.com', contraseña: hashedPasswords[3] },
      { nombre: 'Usuario de Prueba', email: 'auth_test@validation.com', contraseña: hashedPasswords[4] }
    ]
  });

  // Telefonos
  await prisma.telefonos.createMany({
    data: [
      { usuario_id: 1, telefono: '50212345678' },
      { usuario_id: 2, telefono: '50298765432' },
      { usuario_id: 3, telefono: '50211223344' },
      { usuario_id: 4, telefono: '50299223355' }
    ]
  });

  // Permisos
  const permisos = [
    'ver_dashboard', 'ver_inventario', 'ver_proyectos', 'ver_reportes',
    'crear_material', 'editar_inventario', 'eliminar_material', 'crear_proyecto',
    'editar_proyecto', 'eliminar_proyecto', 'crear_reporte', 'eliminar_reporte',
    'ver_alertas', 'crear_usuario', 'editar_usuario', 'eliminar_usuario'
  ];
  await prisma.permisos.createMany({
    data: permisos.map(permiso => ({ permiso }))
  });

  // Roles_permisos
  // Gerente (rol_id: 1) todos los permisos
  for (let i = 1; i <= permisos.length; i++) {
    await prisma.roles_permisos.create({ data: { rol_id: 1, permiso_id: i } });
  }
  // Operaciones (rol_id: 2)
  const opsPerms = [2, 3, 4, 11, 12, 13, 6];
  for (const pid of opsPerms) {
    await prisma.roles_permisos.create({ data: { rol_id: 2, permiso_id: pid } });
  }
  // Logistica (rol_id: 3)
  await prisma.roles_permisos.create({ data: { rol_id: 3, permiso_id: 13 } });

  // Usuarios_roles
  await prisma.usuarios_roles.createMany({
    data: [
      { usuario_id: 1, rol_id: 1 },
      { usuario_id: 2, rol_id: 1 },
      { usuario_id: 3, rol_id: 2 },
      { usuario_id: 4, rol_id: 3 }
    ]
  });

  // Materiales
  await prisma.materiales.createMany({
    data: [
      { codigo: 'Tubo-001', material: 'Codo 1/2' },
      { codigo: 'Tubo-002', material: 'Macho 2 1/2' },
      { codigo: 'Bomba-001', material: 'Superflo 5.0' },
      { codigo: 'Bomba-002', material: 'Superflo 2.5' },
      { codigo: 'Luz-001', material: 'Globerite Color' },
      { codigo: 'Luz-002', material: 'Globerite Blanco' }
    ]
  });

  // Bodega_materiales
  await prisma.bodega_materiales.createMany({
    data: [
      { material_id: 1, tipo: 'entrada', cantidad: 100, fecha: new Date('2025-06-01'), observaciones: 'Compra inicial de codo 1/2' },
      { material_id: 2, tipo: 'entrada', cantidad: 150, fecha: new Date('2025-06-02'), observaciones: 'Compra inicial de macho 2 1/2' },
      { material_id: 3, tipo: 'entrada', cantidad: 2, fecha: new Date('2025-06-03'), observaciones: 'Compra inicial de Superflo 5.0' },
      { material_id: 4, tipo: 'salida', cantidad: 3, fecha: new Date('2025-06-03'), observaciones: 'Compra inicial de Superflo 2.5' },
      { material_id: 5, tipo: 'entrada', cantidad: 15, fecha: new Date('2025-06-03'), observaciones: 'Compra inicial de Globerite Color' },
      { material_id: 6, tipo: 'salida', cantidad: 15, fecha: new Date('2025-06-03'), observaciones: 'Compra inicial de Globerite Blanco' }
    ]
  });

  // Proyectos
  await prisma.clientes.createMany({
    data: [
      { nombre: 'Cliente 1', telefono: '50211111111' },
      { nombre: 'Cliente 2', telefono: '50222222222' },
      { nombre: 'Cliente 3', telefono: '50233333333' }
    ]
  });
  await prisma.proyectos.createMany({
    data: [
      { nombre: 'La Estacion', estado: 'solicitado', presupuesto: 125000, cliente_id: 1, fecha_inicio: new Date('2025-05-15'), fecha_fin: new Date('2025-06-20'), ubicacion: 'Zona 10, Ciudad de Guatemala', tipo_servicio: 'regulares' },
      { nombre: 'Metroplaza', estado: 'en_progreso', presupuesto: 125000, cliente_id: 2, fecha_inicio: new Date('2025-05-15'), fecha_fin: new Date('2025-06-20'), ubicacion: 'Zona 10, Ciudad de Guatemala', tipo_servicio: 'irregulares' },
      { nombre: 'Megacentro', estado: 'cancelado', presupuesto: 125000, cliente_id: 3, fecha_inicio: new Date('2025-05-15'), fecha_fin: null, ubicacion: 'Zona 10, Ciudad de Guatemala', tipo_servicio: 'remodelaciones' },
      { nombre: 'Interplaza', estado: 'finalizado', presupuesto: 32000, cliente_id: 2, fecha_inicio: new Date('2025-06-01'), fecha_fin: new Date('2025-06-20'), ubicacion: 'Zona 10, Ciudad de Guatemala', tipo_servicio: 'jacuzzis' }
    ]
  });

  // Proyecto_material
  await prisma.proyecto_material.createMany({
    data: [
      { id_proyecto: 1, id_material: 1, ofertada: 50, en_obra: 0, reservado: 10 },
      { id_proyecto: 1, id_material: 2, ofertada: 100, en_obra: 0, reservado: 30 },
      { id_proyecto: 1, id_material: 3, ofertada: 2, en_obra: 0, reservado: 2 },
      { id_proyecto: 2, id_material: 1, ofertada: 20, en_obra: 15, reservado: 5 },
      { id_proyecto: 2, id_material: 2, ofertada: 40, en_obra: 20, reservado: 10 },
      { id_proyecto: 2, id_material: 5, ofertada: 10, en_obra: 8, reservado: 2 },
      { id_proyecto: 4, id_material: 4, ofertada: 3, en_obra: 3, reservado: 0 },
      { id_proyecto: 4, id_material: 6, ofertada: 15, en_obra: 15, reservado: 0 }
    ]
  });

  console.log('Database seeded successfully!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
