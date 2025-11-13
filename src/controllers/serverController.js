// controllers/testDeployController.js
const testDeploy = async (req, res) => {
  try {
    res.json({
      status: '✅ OK',
      message: 'Backend funcionando',
      dia: 'Miercoles 13 de Noviembre de 2025',
      hora: new Date().toLocaleTimeString(),
      responsable: 'David Dominguez'
    });

  } catch (error) {
    res.status(500).json({ 
      status: '❌ ERROR',
      message: error.message
    });
  }
};

module.exports = {
  testDeploy
};