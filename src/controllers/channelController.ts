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
      status: "ENABLED", // Default to ENABLED
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

// Get all channels with status = ENABLED (GET)
export const getEnabledChannels = async (_req: Request, res: Response): Promise<void> => {
  try {
    const channels = await channelCollection.find({ status: "ENABLED" }).toArray();

    res.status(200).json({ channels });
  } catch (error) {
    console.error("Error fetching enabled channels:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get all channels owned by the current user (GET)
export const getMyChannels = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sub } = req.user as { sub: string };

    if (!sub) {
      res.status(401).json({ error: "Unauthorized: Missing user sub" });
      return;
    }

    const channels = await channelCollection.find({ ownerSub: sub }).toArray();

    res.status(200).json({ channels });
  } catch (error) {
    console.error("Error fetching user's channels:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Enable/Disable a channel (PUT)
export const toggleChannelStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, status } = req.body;
    const { sub } = req.user as { sub: string };

    if (!id || !status || typeof id !== "string" || typeof status !== "string") {
      res.status(400).json({ error: "id and status are required and must be strings" });
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

    if (channel.ownerSub !== sub) {
      res.status(403).json({ error: "Forbidden: Only the owner can update the channel status" });
      return;
    }

    const result = await channelCollection.updateOne(
      { _id: objectId },
      { $set: { status, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      res.status(404).json({ message: "Channel not found" });
      return;
    }

    res.status(200).json({ message: `Channel status updated to ${status}` });
  } catch (error) {
    console.error("Error updating channel status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update a channel by ID (PUT)
export const updateChannel = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.body;
    const { sub } = req.user as { sub: string };

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

    // Find the channel to ensure the user is the owner
    const channel = await channelCollection.findOne({ _id: objectId });

    if (!channel) {
      res.status(404).json({ message: "Channel not found" });
      return;
    }

    if (channel.ownerSub !== sub) {
      res.status(403).json({ error: "Forbidden: Only the owner can update the channel" });
      return;
    }

    // Extract update fields
    const { name, assetType, tradeType, platformType, price, status } = req.body;

    const updateFields: any = {};
    if (name) updateFields.name = name;
    if (assetType) updateFields.assetType = assetType;
    if (tradeType) updateFields.tradeType = tradeType;
    if (platformType) updateFields.platformType = platformType;
    if (price) updateFields.price = price;
    if (status) updateFields.status = status;
    updateFields.updatedAt = new Date();

    // Perform the update
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

export const deleteChannel = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.query;
    const { sub } = req.user as { sub: string };

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

    // Find the channel to ensure the user is the owner
    const channel = await channelCollection.findOne({ _id: objectId });

    if (!channel) {
      res.status(404).json({ message: "Channel not found" });
      return;
    }

    if (channel.ownerSub !== sub) {
      res.status(403).json({ error: "Forbidden: Only the owner can delete the channel" });
      return;
    }

    // Delete the channel
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
