const app = require('./app');

const port = 4000;
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});