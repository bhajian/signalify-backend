import { Request, Response } from "express";
import Stripe from "stripe";
import { getDB } from "../db";
import { Collection, ObjectId } from "mongodb";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-11-20.acacia",
});

let subscriptionCollection: Collection;
let paymentHistoryCollection: Collection;

// Initialize the MongoDB collections
export const initializeCollections = () => {
  const db = getDB();
  // Initialize collections from environment variables
  subscriptionCollection = db.collection(process.env.SUBSCRIPTION_COLLECTION as string);
  paymentHistoryCollection = db.collection(process.env.PAYMENT_HISTORY_COLLECTION as string);

  console.log("MongoDB collections initialized:", {
    subscriptions: process.env.SUBSCRIPTION_COLLECTION,
    paymentHistory: process.env.PAYMENT_HISTORY_COLLECTION,
  });
};

// Create a subscription and Stripe Checkout session (POST)
export const createSubscription = async (req: Request, res: Response): Promise<void> => {
  try {
    const { channelId, priceId } = req.body;
    const { sub } = req.user as { sub: string };

    if (!channelId || !priceId) {
      res.status(400).json({ error: "channelId and priceId are required" });
      return;
    }

    const subscription = {
      channelId,
      userSub: sub,
      status: "disabled",
      createdAt: new Date(),
    };

    const insertedSubscription = await subscriptionCollection.insertOne(subscription);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        subscriptionId: insertedSubscription.insertedId.toString(),
        userSub: sub,
        channelId,
      },
      success_url: `${process.env.FRONTEND_URL}/subscription/success`,
      cancel_url: `${process.env.FRONTEND_URL}/subscription/cancel`,
    });

    res.status(200).json({ sessionId: session.id });
    return; // Explicitly return to indicate the end of the function
  } catch (error) {
    console.error("Error creating subscription:", error);
    res.status(500).json({ error: "Internal server error" });
    return;
  }
};

export const handleStripeWebhook = async (req: Request, res: Response): Promise<void> => {
  const payload = req.body;
  const sig = req.headers["stripe-signature"] as string;

  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      if (session.metadata) {
        const subscriptionId = session.metadata.subscriptionId;
        const userSub = session.metadata.userSub;
        const channelId = session.metadata.channelId;

        if (!subscriptionId || !userSub || !channelId) {
          res.status(400).json({ error: "Missing metadata in Stripe session" });
          return;
        }

        await subscriptionCollection.updateOne(
          { _id: new ObjectId(subscriptionId), status: "disabled" },
          { $set: { status: "enabled", updatedAt: new Date() } }
        );

        const paymentRecord = {
          subscriptionId,
          userSub,
          channelId,
          stripePaymentId: session.id,
          amount: session.amount_total ? session.amount_total / 100 : 0, // Handle null case
          currency: session.currency || "usd",
          status: session.payment_status,
          createdAt: new Date(),
        };

        await paymentHistoryCollection.insertOne(paymentRecord);

        console.log(`Subscription ${subscriptionId} enabled and payment record created.`);
      }
    }

    res.status(200).send();
    return;
  } catch (error) {
    console.error("Error processing Stripe webhook:", error instanceof Error ? error.message : error);
    res.status(400).send("Webhook Error");
    return;
  }
};


export const getPaymentHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sub } = req.user as { sub: string, username: string; email: string };

    const paymentHistory = await paymentHistoryCollection.find({ userSub: sub }).toArray();

    if (!paymentHistory.length) {
      res.status(404).json({ message: "No payment history found for this user" });
      return;
    }

    res.status(200).json(paymentHistory);
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error fetching payment history:", error.message);
      res.status(500).json({ error: "Internal server error" });
    } else {
      console.error("Unknown error:", error);
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
};
