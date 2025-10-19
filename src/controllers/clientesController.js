// controllers/clientesController

const prisma = require('../prismaClient');

// Obtener todos los clientes
const getClientes = async (req, res) => {
  try {
    const clientes = await prisma.clientes.findMany({
      include: {
        proyectos: {
          select: {
            id: true,
            nombre: true,
            estado: true
          }
        }
      },
      orderBy: { id: 'asc' }
    });

    if (clientes.length === 0) {
      return res.status(404).json({ message: 'No se encontraron clientes' });
    }

    res.json(clientes);
  } catch (error) {
    console.error('Error en getClientes:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// Obtener cliente por ID
const getClienteById = async (req, res) => {
  const { id } = req.params;
  
  if (isNaN(id) || !Number.isInteger(Number(id))) {
    return res.status(400).json({ 
      message: 'El ID debe ser un número entero válido',
      received: id
    });
  }

  try {
    const cliente = await prisma.clientes.findUnique({
      where: { id: parseInt(id) },
      include: {
        proyectos: {
          select: {
            id: true,
            nombre: true,
            estado: true,
            presupuesto: true,
            fecha_inicio: true,
            fecha_fin: true
          }
        }
      }
    });

    if (!cliente) {
      return res.status(404).json({ 
        message: `No se encontró un cliente con el ID ${id}.` 
      });
    }

    res.json(cliente);
  } catch (error) {
    console.error('Error en getClienteById:', error);
    res.status(500).json({ message: 'Error del servidor al obtener el cliente.' });
  }
};

// Crear un cliente
const createCliente = async (req, res) => {
  try {
    const { id, nombre, telefono, email, direccion } = req.body;

    // Validaciones mínimas
    if (!nombre) {
      return res.status(400).json({ message: 'El campo nombre es obligatorio' });
    }

    // Preparar datos para crear
    const clienteData = {
      nombre,
      telefono: telefono || null,
      email: email || null,
      direccion: direccion || null
    };

    // Si se proporciona un ID específico, incluirlo (solo si el esquema lo permite)
    if (id !== undefined && id !== null) {
      clienteData.id = parseInt(id);
    }

    const nuevoCliente = await prisma.clientes.create({
      data: clienteData
    });

    return res.status(201).json({ 
      message: 'Cliente creado exitosamente', 
      cliente: nuevoCliente 
    });

  } catch (error) {
    console.error('Error en createCliente:', error);
    
    // Manejar error de ID duplicado si se especifica manualmente
    if (error.code === 'P2002') {
      return res.status(409).json({ 
        message: 'Ya existe un cliente con este ID o información duplicada' 
      });
    }
    
    return res.status(500).json({ message: 'Error del servidor al crear el cliente' });
  }
};

// Actualizar cliente
const updateCliente = async (req, res) => {
  const { id } = req.params;
  const { nombre, telefono, email, direccion } = req.body;

  if (isNaN(id) || !Number.isInteger(Number(id))) {
    return res.status(400).json({ 
      message: 'El ID debe ser un número entero válido',
      received: id
    });
  }

  try {
    // Verificar que el cliente existe
    const clienteExistente = await prisma.clientes.findUnique({
      where: { id: parseInt(id) }
    });

    if (!clienteExistente) {
      return res.status(404).json({ 
        message: `No se encontró un cliente con el ID ${id}.` 
      });
    }

    // Preparar datos de actualización (solo campos no undefined)
    const updateData = {};
    if (nombre !== undefined) updateData.nombre = nombre;
    if (telefono !== undefined) updateData.telefono = telefono;
    if (email !== undefined) updateData.email = email;
    if (direccion !== undefined) updateData.direccion = direccion;

    const clienteActualizado = await prisma.clientes.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    res.json({
      message: 'Cliente actualizado exitosamente',
      cliente: clienteActualizado
    });

  } catch (error) {
    console.error('Error en updateCliente:', error);
    res.status(500).json({ message: 'Error del servidor al actualizar el cliente.' });
  }
};

// Eliminar cliente
const deleteCliente = async (req, res) => {
  const { id } = req.params;

  if (isNaN(id) || !Number.isInteger(Number(id))) {
    return res.status(400).json({ 
      message: 'El ID debe ser un número entero válido',
      received: id
    });
  }

  try {
    // Verificar que el cliente existe
    const clienteExistente = await prisma.clientes.findUnique({
      where: { id: parseInt(id) }
    });

    if (!clienteExistente) {
      return res.status(404).json({ 
        message: `No se encontró un cliente con el ID ${id}.` 
      });
    }

    // Verificar si el cliente tiene proyectos asociados
    const proyectosAsociados = await prisma.proyectos.findMany({
      where: { cliente_id: parseInt(id) }
    });

    if (proyectosAsociados.length > 0) {
      return res.status(400).json({ 
        message: 'No se puede eliminar el cliente porque tiene proyectos asociados' 
      });
    }

    // Eliminar el cliente
    await prisma.clientes.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      message: 'Cliente eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error en deleteCliente:', error);
    res.status(500).json({ message: 'Error del servidor al eliminar el cliente.' });
  }
};

// Obtener conteo de clientes
const getClientsCount = async (req, res) => {
  try {
    const totalClientes = await prisma.clientes.count();

    res.json({
      total_clientes: totalClientes
    });

  } catch (error) {
    console.error('Error en getClientsCount:', error);
    res.status(500).json({ message: 'Error del servidor al contar clientes' });
  }
};

// Obtener clientes con estadísticas de proyectos
const getClientesWithStats = async (req, res) => {
  try {
    const clientes = await prisma.clientes.findMany({
      include: {
        proyectos: {
          select: {
            id: true,
            estado: true,
            presupuesto: true
          }
        }
      },
      orderBy: { nombre: 'asc' }
    });

    // Calcular estadísticas para cada cliente
    const clientesConStats = clientes.map(cliente => {
      const proyectos = cliente.proyectos;
      const totalProyectos = proyectos.length;
      const proyectosActivos = proyectos.filter(p => p.estado === 'en_progreso').length;
      const proyectosFinalizados = proyectos.filter(p => p.estado === 'finalizado').length;
      const presupuestoTotal = proyectos.reduce((sum, p) => sum + (p.presupuesto || 0), 0);

      return {
        id: cliente.id,
        nombre: cliente.nombre,
        telefono: cliente.telefono,
        email: cliente.email,
        direccion: cliente.direccion,
        estadisticas: {
          total_proyectos: totalProyectos,
          proyectos_activos: proyectosActivos,
          proyectos_finalizados: proyectosFinalizados,
          presupuesto_total: presupuestoTotal
        }
      };
    });

    res.json(clientesConStats);

  } catch (error) {
    console.error('Error en getClientesWithStats:', error);
    res.status(500).json({ message: 'Error del servidor al obtener estadísticas de clientes' });
  }
};

// Buscar clientes por nombre o teléfono
const searchClientes = async (req, res) => {
  try {
    const { q } = req.query; // query parameter

    if (!q || q.trim() === '') {
      return res.status(400).json({ message: 'Parámetro de búsqueda requerido' });
    }

    const clientes = await prisma.clientes.findMany({
      where: {
        OR: [
          {
            nombre: {
              contains: q,
              mode: 'insensitive'
            }
          },
          {
            telefono: {
              contains: q
            }
          },
          {
            email: {
              contains: q,
              mode: 'insensitive'
            }
          }
        ]
      },
      include: {
        proyectos: {
          select: {
            id: true,
            nombre: true,
            estado: true
          }
        }
      },
      orderBy: { nombre: 'asc' }
    });

    res.json({
      query: q,
      resultados: clientes.length,
      clientes: clientes
    });

  } catch (error) {
    console.error('Error en searchClientes:', error);
    res.status(500).json({ message: 'Error del servidor al buscar clientes' });
  }
};

module.exports = { 
  getClientes, 
  getClienteById,
  createCliente, 
  updateCliente,
  deleteCliente,
  getClientsCount,
  getClientesWithStats,
  searchClientes
};
