
const MaterialRequest = require("../models/MaterialRequest");

exports.getAllRequests = async (req, res) => {
  try {
    const requests = await MaterialRequest.find().sort({ requestedDate: -1 });
    res.json(requests);
  } catch (err) {
    console.error("Error fetching requests:", err);
    res.status(500).json({ error: "Failed to fetch material requests" });
  }
};

exports.createRequest = async (req, res) => {
  try {
    const newRequest = new MaterialRequest(req.body);
    await newRequest.save();
    res.json(newRequest);
  } catch (err) {
    console.error("Error creating request:", err);
    res.status(500).json({ error: "Failed to create material request" });
  }
};
exports.deleteRequest = async (req, res) => {
  try {
    await MaterialRequest.findByIdAndDelete(req.params.id);
    res.json({ message: "Request deleted" });
  } catch (err) {
    console.error("Error deleting request:", err);
    res.status(500).json({ error: "Failed to delete request" });
  }
};

exports.updateRequest = async (req, res) => {
  try {
    const updated = await MaterialRequest.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    console.error("Error updating request:", err);
    res.status(500).json({ error: "Failed to update material request" });
  }
};


