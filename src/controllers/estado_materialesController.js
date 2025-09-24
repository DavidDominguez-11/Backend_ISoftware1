const pool = require('../config/db');

// No Prisma model named estado_materiales in schema. If you have one, replace logic accordingly.

const notImplemented = (req, res) => {
  res.status(501).json({ error: 'Endpoint no implementado. Añade un modelo a Prisma si es necesario.' });
};

module.exports = {
  notImplemented
};