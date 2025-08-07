
const express = require("express");
const router = express.Router();
const materialRequestController = require("../controllers/materialRequestController");

router.get("/", materialRequestController.getAllRequests);
router.post("/", materialRequestController.createRequest);
router.delete("/:id", materialRequestController.deleteRequest);
router.put("/:id", materialRequestController.updateRequest);


module.exports = router;
