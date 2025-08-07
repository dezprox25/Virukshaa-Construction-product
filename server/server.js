const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const attendanceRoutes = require("./routes/attendanceRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const projectRoutes = require("./routes/projectRoutes");
const materialRoutes = require("./routes/materialRoutes");
const materialRequestRoutes = require("./routes/materialRequestRoutes");
const dailyLogsRoutes = require("./routes/dailyLogsRoutes");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/attendance", attendanceRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/materials", materialRoutes);
app.use("/api/material-requests", materialRequestRoutes);
app.use("/api/daily-logs", dailyLogsRoutes);

mongoose.connect("mongodb://127.0.0.1:27017/attendanceDB")
  .then(() => {
    app.listen(5000, () => {
      console.log("Server running on http://localhost:5000");
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err.message);
  });
