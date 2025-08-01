// src/middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');

// Este middleware protege las rutas.
// Verifica si existe una cookie con el token y si el token es válido.
const protectRoute = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        // Si no hay token, el usuario no está autenticado.
        return res.status(401).json({ message: 'No autenticado, no hay token.' });
    }

    // Verificamos que el token sea válido
    jwt.verify(token, 'tu_secreto_super_seguro', (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Token no válido.' });
        }
        
        // El token es válido. Adjuntamos el ID del usuario al objeto request
        // por si lo necesitamos más adelante.
        req.userId = decoded.id;
        
        // Le decimos a Express que continúe a la siguiente función (el controlador getProjects).
        next(); 
    });
};

module.exports = { protectRoute };
