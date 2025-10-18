// controllers/clientesController

const pool = require('../config/db');

// Obtener todos los clientes
const getClientes = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM clientes');

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No se encontraron clientes' });
    }

    res.json(result.rows);
  } catch (error) {
    console.error('Error en getClientes:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// Crear un cliente
const createCliente = async (req, res) => {
  try {
    const { id, nombre, telefono } = req.body;

    // Validaciones mínimas
    if (!nombre || !telefono) {
      return res.status(400).json({ message: 'Faltan campos obligatorios: nombre y telefono' });
    }

    let query;
    let values;

    if (id !== undefined && id !== null) {
      // Inserción incluyendo ID (por si la tabla no es SERIAL)
      query = `
        INSERT INTO clientes (id, nombre, telefono)
        VALUES ($1, $2, $3)
        RETURNING *;
      `;
      values = [id, nombre, telefono];
    } else {
      // Inserción dejando que la BD asigne el ID (si es SERIAL)
      query = `
        INSERT INTO clientes (nombre, telefono)
        VALUES ($1, $2)
        RETURNING *;
      `;
      values = [nombre, telefono];
    }

    const result = await pool.query(query, values);
    return res.status(201).json({ message: 'Cliente creado exitosamente', cliente: result.rows[0] });

  } catch (error) {
    console.error('Error en createCliente:', error);
    return res.status(500).json({ message: 'Error del servidor' });
  }
};

const getClientsCount = async (req, res) => {
  try {
    const result = await pool.query('SELECT COUNT(*) AS total_clientes FROM clientes;');

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No se encontraron clientes' });
    }

    res.json(result.rows);
  } catch (error) {
    console.error('Error en getClientsCount:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

module.exports = { getClientes, createCliente, getClientsCount };
