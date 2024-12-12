import { Request, Response } from "express";
import { getDB } from "../db";
import { Collection, ObjectId } from "mongodb";

const signalCollectionName = process.env.SIGNAL_COLLECTION as string;
let signalCollection: Collection;

// Initialize the collection
export const initializeSignalCollection = () => {
  const db = getDB();
  signalCollection = db.collection(signalCollectionName);
};

// Create a new signal (POST)
export const createSignal = async (req: Request, res: Response): Promise<void> => {
  try {
    const { channelId, equityType, equityNameId, tradingType, allocationPercentage, executionTimeEpoc } = req.body;

    if (!channelId || !equityType || !equityNameId || !tradingType || !allocationPercentage || !executionTimeEpoc) {
      res.status(400).json({ error: "All fields are required" });
      return;
    }

    const newSignal = {
      channelId,
      equityType,
      equityNameId,
      tradingType,
      allocationPercentage,
      dateTimeCreated: new Date(),
      executionTimeEpoc,
    };

    await signalCollection.insertOne(newSignal);
    res.status(201).json({ message: "Signal created successfully", signal: newSignal });
  } catch (error) {
    console.error("Error creating signal:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get signals by channelId (GET)
export const getSignalsByChannel = async (req: Request, res: Response): Promise<void> => {
  try {
    const { channelId } = req.query;

    if (!channelId) {
      res.status(400).json({ error: "channelId is required" });
      return;
    }

    const signals = await signalCollection.find({ channelId }).toArray();

    if (!signals.length) {
      res.status(404).json({ message: "No signals found for this channel" });
      return;
    }

    res.status(200).json({ signals });
  } catch (error) {
    console.error("Error fetching signals:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update a signal by ID (PUT)
export const updateSignal = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.body;

    if (!id) {
      res.status(400).json({ error: "id is required to update a signal" });
      return;
    }

    const { channelId, equityType, equityNameId, tradingType, allocationPercentage, executionTimeEpoc } = req.body;

    const result = await signalCollection.updateOne(
      { _id: id },
      { $set: { channelId, equityType, equityNameId, tradingType, allocationPercentage, executionTimeEpoc, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      res.status(404).json({ message: "Signal not found" });
      return;
    }

    res.status(200).json({ message: "Signal updated successfully" });
  } catch (error) {
    console.error("Error updating signal:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete a signal by ID (DELETE)
export const deleteSignal = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.query.id;

    // Validate the `id` and ensure it's a string
    if (!id || typeof id !== "string") {
      res.status(400).json({ error: "id is required and must be a string to delete a signal" });
      return;
    }

    // Convert `id` to ObjectId
    let objectId: ObjectId;
    try {
      objectId = new ObjectId(id);
    } catch (error) {
      res.status(400).json({ error: "Invalid id format. Must be a valid MongoDB ObjectId" });
      return;
    }

    // Attempt to delete the signal
    const result = await signalCollection.deleteOne({ _id: objectId });

    if (result.deletedCount === 0) {
      res.status(404).json({ message: "Signal not found" });
      return;
    }

    res.status(200).json({ message: "Signal deleted successfully" });
  } catch (error) {
    console.error("Error deleting signal:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
