import express from "express";

// This will help us connect to the database
import db from "../db/connection.js";

// This helps convert the id from string to ObjectId for the _id.
import { ObjectId } from "mongodb";

// router is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /record.
const router = express.Router();

// This section will help you get a list of all the records, with an optional search query.
router.get("/", async (req, res) => {
  let collection = await db.collection("records");
  
  // Extract query parameters from request
  const searchQuery = req.query.q;
  let query = {};

  // If there's a search query, filter by name or position
  if (searchQuery) {
    query = {
      $or: [
        { name: { $regex: searchQuery, $options: "i" } }, // Case-insensitive search by name
        { position: { $regex: searchQuery, $options: "i" } } // Case-insensitive search by position
      ]
    };
  }

  // Fetch and return records based on the query
  let results = await collection.find(query).toArray();
  res.send(results).status(200);
});

// This section will help you get a single record by id
router.get("/:id", async (req, res) => {
  let collection = await db.collection("records");
  let query = { _id: new ObjectId(req.params.id) };
  let result = await collection.findOne(query);

  if (!result) res.send("Not found").status(404);
  else res.send(result).status(200);
});

// This section will help you create a new record.
router.post("/", async (req, res) => {
  try {
    let newDocument = {
      name: req.body.name,
      position: req.body.position,
      level: req.body.level,
    };
    let collection = await db.collection("records");
    let result = await collection.insertOne(newDocument);
    res.send(result).status(204);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error adding record");
  }
});

// This section will help you update a record by id.
router.patch("/:id", async (req, res) => {
  try {
    const query = { _id: new ObjectId(req.params.id) };
    const updates = {
      $set: {
        name: req.body.name,
        position: req.body.position,
        level: req.body.level,
      },
    };

    let collection = await db.collection("records");
    let result = await collection.updateOne(query, updates);
    res.send(result).status(200);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating record");
  }
});

// This section will help you delete a record by id.
router.delete("/:id", async (req, res) => {
  try {
    const query = { _id: new ObjectId(req.params.id) };

    const collection = db.collection("records");
    let result = await collection.deleteOne(query);

    res.send(result).status(200);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting record");
  }
});

// New route to delete multiple records by ids
router.post("/deleteMany", async (req, res) => {
  try {
    const { ids } = req.body; // Get the array of ids from the request body

    if (!ids || ids.length === 0) {
      return res.status(400).send("No IDs provided");
    }

    const objectIds = ids.map((id) => new ObjectId(id)); // Convert each id to ObjectId

    const collection = db.collection("records");
    const result = await collection.deleteMany({ _id: { $in: objectIds } });
    console.log(result);

    if (result.deletedCount === 0) {
      return res.status(404).send("No records found to delete");
    }

    res.status(200).send({ message: `Deleted ${result.deletedCount} records` });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting records");
  }
});

export default router;
// team11
