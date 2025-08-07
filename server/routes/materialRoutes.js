const express = require("express");
const router = express.Router();
const {
  createMaterial,
  getAllMaterials,
  updateMaterial,
  getMaterialById,
} = require("../controllers/materialController");

router.post("/add", createMaterial);
router.get("/", getAllMaterials);
router.put("/:id", updateMaterial);
router.get("/:id", getMaterialById);

module.exports = router;
