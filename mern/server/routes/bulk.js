const express = require("express");
const router = express.Router();
const Record = require("../models/record"); // Assuming you have a Record model defined

// Bulk insert endpoint
router.post("/bulk", async (req, res) => {
  const records = req.body;

  try {
    // Validate records before insertion
    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ message: "Invalid data" });
    }

    // Insert records in bulk
    await Record.insertMany(records);
    res.status(201).json({ message: "Records inserted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to insert records" });
  }
});

export default router;
