const Material = require("../models/Material");
const generateCustomId = require("../utils/generateCustomId");

const createMaterial = async (req, res) => {
  try {
    const newId = await generateCustomId(Material, "M");
    const material = new Material({ ...req.body, materialId: newId });
    await material.save();
    res.status(201).json(material);
  } catch (err) {
    console.error("Error creating material:", err);
    res.status(500).json({ error: "Failed to create material" });
  }
};

function determineStockStatus(currentStock, reorderLevel) {
  if (currentStock === 0) return "Out of Stock";
  if (currentStock < reorderLevel) return "Low Stock";
  return "In Stock";
}

const getAllMaterials = async (req, res) => {
  try {
    const materials = await Material.find().sort({ lastUpdated: -1 });
    res.json(materials);
  } catch (err) {
    console.error("Error fetching materials:", err);
    res.status(500).json({ error: "Failed to fetch materials" });
  }
};

const updateMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentStock, reorderLevel } = req.body;
    const status = determineStockStatus(currentStock, reorderLevel);

    const updated = await Material.findByIdAndUpdate(
      id,
      {
        ...req.body,
        status,
        lastUpdated: new Date(),
      },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    console.error("Error updating material:", err);
    res.status(500).json({ error: "Failed to update material" });
  }
};

const getMaterialById = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) return res.status(404).json({ error: "Material not found" });
    res.json(material);
  } catch (err) {
    console.error("Error fetching material by ID:", err);
    res.status(500).json({ error: "Failed to fetch material" });
  }
};

module.exports = {
  createMaterial,
  getAllMaterials,
  updateMaterial,
  getMaterialById,
};
