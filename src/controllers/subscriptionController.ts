import { Request, Response } from "express";
import { getDB } from "../db";
import { Collection, ObjectId } from "mongodb";

const subscriptionCollectionName = process.env.SUBSCRIPTION_COLLECTION as string;
let subscriptionCollection: Collection;

// Initialize the collection
export const initializeSubscriptionCollection = () => {
  const db = getDB();
  subscriptionCollection = db.collection(subscriptionCollectionName);
};

// Create a new subscription (POST)
export const createSubscription = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      channelId,
      userSub,
      startDate,
      endDate,
      recurringPayment,
      paymentId,
      telegramMessageEnabled,
      telegramId,
      autoTradeEnabled,
      platformType,
      platformUsername,
      platformPassword,
      platformToken,
      enabled,
    } = req.body;

    if (!channelId || !userSub || !startDate || !endDate || !platformType || !platformUsername) {
      res.status(400).json({ error: "Required fields are missing" });
      return;
    }

    const newSubscription = {
      channelId,
      userSub,
      startDate,
      endDate,
      recurringPayment: !!recurringPayment,
      paymentId,
      telegramMessageEnabled: !!telegramMessageEnabled,
      telegramId,
      autoTradeEnabled: !!autoTradeEnabled,
      platformType,
      platformUsername,
      platformPassword,
      platformToken,
      enabled: enabled !== undefined ? !!enabled : true, // Default to true if not provided
      createdAt: new Date(),
    };

    await subscriptionCollection.insertOne(newSubscription);
    res.status(201).json({ message: "Subscription created successfully", subscription: newSubscription });
  } catch (error) {
    console.error("Error creating subscription:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get subscriptions by userSub (GET)
export const getSubscriptionsByUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userSub } = req.query;

    if (!userSub) {
      res.status(400).json({ error: "userSub is required" });
      return;
    }

    const subscriptions = await subscriptionCollection.find({ userSub }).toArray();

    if (!subscriptions.length) {
      res.status(404).json({ message: "No subscriptions found for this user" });
      return;
    }

    res.status(200).json({ subscriptions });
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update a subscription by ID (PUT)
export const updateSubscription = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.body;

    if (!id) {
      res.status(400).json({ error: "id is required to update a subscription" });
      return;
    }

    const {
      startDate,
      endDate,
      recurringPayment,
      telegramMessageEnabled,
      autoTradeEnabled,
      platformUsername,
      platformPassword,
      platformToken,
      enabled,
    } = req.body;

    const result = await subscriptionCollection.updateOne(
      { _id: id },
      {
        $set: {
          startDate,
          endDate,
          recurringPayment,
          telegramMessageEnabled,
          autoTradeEnabled,
          platformUsername,
          platformPassword,
          platformToken,
          enabled,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      res.status(404).json({ message: "Subscription not found" });
      return;
    }

    res.status(200).json({ message: "Subscription updated successfully" });
  } catch (error) {
    console.error("Error updating subscription:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


// Delete a subscription by ID (DELETE)
export const deleteSubscription = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.query.id;

    // Check if id exists and is a string
    if (!id || typeof id !== "string") {
      res.status(400).json({ error: "id is required and must be a string to delete a subscription" });
      return;
    }

    // Convert id to ObjectId
    const objectId = new ObjectId(id);

    const result = await subscriptionCollection.deleteOne({ _id: objectId });

    if (result.deletedCount === 0) {
      res.status(404).json({ message: "Subscription not found" });
      return;
    }

    res.status(200).json({ message: "Subscription deleted successfully" });
  } catch (error) {
    console.error("Error deleting subscription:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
