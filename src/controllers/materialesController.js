// controllers/materialesController.js
const prisma = require('../prismaClient');

// Obtener todos los materiales
const getMaterials = async (req, res) => {
  try {
    const materials = await prisma.materiales.findMany({
      orderBy: { id: 'asc' }
    });
    
    if (materials.length === 0) {
      return res.status(404).json({ message: 'No se encontraron materiales' });
    }
    
    res.json(materials);
  } catch (error) {
    console.error('Error en getMaterials:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// Obtener material por ID
const getMaterialById = async (req, res) => {
  const { id } = req.params;
  
  if (isNaN(id) || !Number.isInteger(Number(id))) {
    return res.status(400).json({ 
      message: 'El ID debe ser un número entero válido',
      received: id
    });
  }

  try {
    const material = await prisma.materiales.findUnique({
      where: { id: parseInt(id) }
    });

    if (!material) {
      return res.status(404).json({ 
        message: `No se encontró un material con el ID ${id}.` 
      });
    }

    res.json(material);
  } catch (error) {
    console.error('Error en getMaterialById:', error);
    res.status(500).json({ message: 'Error del servidor al obtener el material.' });
  }
};

// Crear material(es)
const createMaterial = async (req, res) => {
  try {
    console.log('Request body:', req.body);

    // Bulk creation (array of materials)
    if (req.body.materiales && Array.isArray(req.body.materiales)) {
      console.log('Processing bulk creation...');
      
      const materialsToCreate = req.body.materiales;
      console.log(`Creating ${materialsToCreate.length} materials`);
      
      // Check for duplicates within the batch
      const codigos = materialsToCreate.map(m => m.codigo);
      const uniqueCodigos = [...new Set(codigos)];
      
      if (codigos.length !== uniqueCodigos.length) {
        return res.status(400).json({ 
          message: 'Hay códigos duplicados en la lista de materiales' 
        });
      }

      // Check for existing materials in database
      const existingMaterials = await prisma.materiales.findMany({
        where: { codigo: { in: codigos } }
      });

      if (existingMaterials.length > 0) {
        const existingCodigos = existingMaterials.map(m => m.codigo);
        return res.status(400).json({ 
          message: 'Los siguientes códigos ya existen',
          duplicados: existingCodigos
        });
      }

      // Create all materials
      const createdMaterials = await prisma.materiales.createMany({
        data: materialsToCreate
      });

      console.log(`Successfully created ${createdMaterials.count} materials`);
      
      return res.status(201).json({
        message: `${createdMaterials.count} materiales creados exitosamente`,
        count: createdMaterials.count
      });
    }

    // Single material creation
    const { codigo, material } = req.body;
    
    if (!codigo || !material) {
      return res.status(400).json({ 
        message: 'Los campos codigo y material son requeridos' 
      });
    }

    // Check for duplicate
    const existingMaterial = await prisma.materiales.findFirst({
      where: { codigo }
    });

    if (existingMaterial) {
      return res.status(400).json({ 
        message: 'El código de material ya existe' 
      });
    }

    const newMaterial = await prisma.materiales.create({
      data: { codigo, material }
    });

    console.log('Single material created:', newMaterial);
    res.status(201).json(newMaterial);

  } catch (error) {
    console.error('Error en createMaterial:', error);
    res.status(500).json({ message: 'Error del servidor al crear material(es)' });
  }
};

// Actualizar material
const updateMaterial = async (req, res) => {
  const { id } = req.params;
  const { codigo, material } = req.body;

  if (isNaN(id) || !Number.isInteger(Number(id))) {
    return res.status(400).json({ 
      message: 'El ID debe ser un número entero válido',
      received: id
    });
  }

  if (!codigo || !material) {
    return res.status(400).json({ 
      message: 'Los campos codigo y material son requeridos' 
    });
  }

  try {
    // Check if material exists
    const existingMaterial = await prisma.materiales.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingMaterial) {
      return res.status(404).json({ 
        message: `No se encontró un material con el ID ${id}.` 
      });
    }

    // Check for duplicate codigo (excluding current material)
    const duplicateMaterial = await prisma.materiales.findFirst({
      where: { 
        codigo,
        NOT: { id: parseInt(id) }
      }
    });

    if (duplicateMaterial) {
      return res.status(400).json({ 
        message: 'El código de material ya existe en otro registro' 
      });
    }

    const updatedMaterial = await prisma.materiales.update({
      where: { id: parseInt(id) },
      data: { codigo, material }
    });

    res.json({
      message: 'Material actualizado exitosamente',
      material: updatedMaterial
    });

  } catch (error) {
    console.error('Error en updateMaterial:', error);
    res.status(500).json({ message: 'Error del servidor al actualizar el material.' });
  }
};

// Eliminar material
const deleteMaterial = async (req, res) => {
  const { id } = req.params;

  if (isNaN(id) || !Number.isInteger(Number(id))) {
    return res.status(400).json({ 
      message: 'El ID debe ser un número entero válido',
      received: id
    });
  }

  try {
    // Check if material exists
    const existingMaterial = await prisma.materiales.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingMaterial) {
      return res.status(404).json({ 
        message: `No se encontró un material con el ID ${id}.` 
      });
    }

    // Check if material is being used in projects or bodega
    const materialInUse = await prisma.proyecto_material.findFirst({
      where: { material_id: parseInt(id) }
    });

    if (materialInUse) {
      return res.status(400).json({ 
        message: 'No se puede eliminar el material porque está siendo utilizado en proyectos' 
      });
    }

    // Delete the material
    await prisma.materiales.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      message: 'Material eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error en deleteMaterial:', error);
    res.status(500).json({ message: 'Error del servidor al eliminar el material.' });
  }
};

module.exports = {
  getMaterials,
  getMaterialById, 
  createMaterial,
  updateMaterial,
  deleteMaterial
};
