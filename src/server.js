require('dotenv').config();

const app = require('./app');

const port = process.env.SERVER_PORT_TEST;
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});