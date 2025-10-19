const prisma = require('../prismaClient');

// Obtener todos los clientes
const getClients = async (req, res) => {
  try {
    const clients = await prisma.clientes.findMany({
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
    
    if (clients.length === 0) {
      return res.status(404).json({ message: 'No se encontraron clientes' });
    }
    
    res.json(clients);
  } catch (error) {
    console.error('Error en getClients:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// Obtener cliente por ID
const getClientById = async (req, res) => {
  const { id } = req.params;
  
  if (isNaN(id) || !Number.isInteger(Number(id))) {
    return res.status(400).json({ 
      message: 'El ID debe ser un número entero válido',
      received: id
    });
  }

  try {
    const client = await prisma.clientes.findUnique({
      where: { id: parseInt(id) },
      include: {
        proyectos: true
      }
    });

    if (!client) {
      return res.status(404).json({ 
        message: `No se encontró un cliente con el ID ${id}.` 
      });
    }

    res.json(client);
  } catch (error) {
    console.error('Error en getClientById:', error);
    res.status(500).json({ message: 'Error del servidor al obtener el cliente.' });
  }
};

// Crear cliente
const createClient = async (req, res) => {
  const { nombre, telefono, email, direccion } = req.body;

  if (!nombre) {
    return res.status(400).json({ 
      message: 'El campo nombre es requerido' 
    });
  }

  try {
    const newClient = await prisma.clientes.create({
      data: {
        nombre,
        telefono,
        email,
        direccion
      }
    });

    res.status(201).json({
      message: 'Cliente creado exitosamente',
      cliente: newClient
    });

  } catch (error) {
    console.error('Error en createClient:', error);
    res.status(500).json({ message: 'Error del servidor al crear el cliente.' });
  }
};

// Actualizar cliente
const updateClient = async (req, res) => {
  const { id } = req.params;
  const { nombre, telefono, email, direccion } = req.body;

  if (isNaN(id) || !Number.isInteger(Number(id))) {
    return res.status(400).json({ 
      message: 'El ID debe ser un número entero válido',
      received: id
    });
  }

  try {
    // Check if client exists
    const existingClient = await prisma.clientes.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingClient) {
      return res.status(404).json({ 
        message: `No se encontró un cliente con el ID ${id}.` 
      });
    }

    // Prepare update data
    const updateData = {};
    if (nombre !== undefined) updateData.nombre = nombre;
    if (telefono !== undefined) updateData.telefono = telefono;
    if (email !== undefined) updateData.email = email;
    if (direccion !== undefined) updateData.direccion = direccion;

    const updatedClient = await prisma.clientes.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    res.json({
      message: 'Cliente actualizado exitosamente',
      cliente: updatedClient
    });

  } catch (error) {
    console.error('Error en updateClient:', error);
    res.status(500).json({ message: 'Error del servidor al actualizar el cliente.' });
  }
};

// Eliminar cliente
const deleteClient = async (req, res) => {
  const { id } = req.params;

  if (isNaN(id) || !Number.isInteger(Number(id))) {
    return res.status(400).json({ 
      message: 'El ID debe ser un número entero válido',
      received: id
    });
  }

  try {
    // Check if client exists
    const existingClient = await prisma.clientes.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingClient) {
      return res.status(404).json({ 
        message: `No se encontró un cliente con el ID ${id}.` 
      });
    }

    // Check if client has projects
    const clientProjects = await prisma.proyectos.findMany({
      where: { cliente_id: parseInt(id) }
    });

    if (clientProjects.length > 0) {
      return res.status(400).json({ 
        message: 'No se puede eliminar el cliente porque tiene proyectos asociados' 
      });
    }

    // Delete the client
    await prisma.clientes.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      message: 'Cliente eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error en deleteClient:', error);
    res.status(500).json({ message: 'Error del servidor al eliminar el cliente.' });
  }
};

module.exports = {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient
};