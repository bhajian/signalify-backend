import { Request, Response } from "express";
import { getDB } from "../db";
import { Collection, ObjectId } from "mongodb";

const channelCollectionName = process.env.CHANNEL_COLLECTION as string;
let channelCollection: Collection;

// Initialize the channel collection
export const initializeChannelCollection = () => {
  const db = getDB();
  channelCollection = db.collection(channelCollectionName);
};

// Create a new channel (POST)
export const createChannel = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, assetType, tradeType, platformType, ownerSub, price } = req.body;

    if (!name || !assetType || !tradeType || !platformType || !ownerSub || !price) {
      res.status(400).json({ error: "All fields (name, assetType, tradeType, platformType, ownerSub, price) are required" });
      return;
    }

    const newChannel = {
      name,
      assetType,
      tradeType,
      platformType,
      ownerSub,
      price,
      createdAt: new Date(),
    };

    await channelCollection.insertOne(newChannel);
    res.status(201).json({ message: "Channel created successfully", channel: newChannel });
  } catch (error) {
    console.error("Error creating channel:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get all channels or a specific channel by ID (GET)
export const getChannelById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.query;

    if (!id || typeof id !== "string") {
      res.status(400).json({ error: "id is required and must be a string" });
      return;
    }

    let objectId: ObjectId;
    try {
      objectId = new ObjectId(id);
    } catch (error) {
      res.status(400).json({ error: "Invalid id format. Must be a valid MongoDB ObjectId" });
      return;
    }

    const channel = await channelCollection.findOne({ _id: objectId });

    if (!channel) {
      res.status(404).json({ message: "Channel not found" });
      return;
    }

    res.status(200).json({ channel });
  } catch (error) {
    console.error("Error fetching channel:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update a channel by ID (PUT)
export const updateChannel = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.body;

    if (!id || typeof id !== "string") {
      res.status(400).json({ error: "id is required and must be a string to update a channel" });
      return;
    }

    let objectId: ObjectId;
    try {
      objectId = new ObjectId(id);
    } catch (error) {
      res.status(400).json({ error: "Invalid id format. Must be a valid MongoDB ObjectId" });
      return;
    }

    const { name, assetType, tradeType, platformType, ownerSub, price } = req.body;

    const updateFields: any = {};
    if (name) updateFields.name = name;
    if (assetType) updateFields.assetType = assetType;
    if (tradeType) updateFields.tradeType = tradeType;
    if (platformType) updateFields.platformType = platformType;
    if (ownerSub) updateFields.ownerSub = ownerSub;
    if (price) updateFields.price = price;
    updateFields.updatedAt = new Date();

    const result = await channelCollection.updateOne(
      { _id: objectId },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      res.status(404).json({ message: "Channel not found" });
      return;
    }

    res.status(200).json({ message: "Channel updated successfully" });
  } catch (error) {
    console.error("Error updating channel:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete a channel by ID (DELETE)
export const deleteChannel = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.query;

    if (!id || typeof id !== "string") {
      res.status(400).json({ error: "id is required and must be a string to delete a channel" });
      return;
    }

    let objectId: ObjectId;
    try {
      objectId = new ObjectId(id);
    } catch (error) {
      res.status(400).json({ error: "Invalid id format. Must be a valid MongoDB ObjectId" });
      return;
    }

    const result = await channelCollection.deleteOne({ _id: objectId });

    if (result.deletedCount === 0) {
      res.status(404).json({ message: "Channel not found" });
      return;
    }

    res.status(200).json({ message: "Channel deleted successfully" });
  } catch (error) {
    console.error("Error deleting channel:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
