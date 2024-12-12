import express from "express";
import {
  createSubscription,
  getSubscriptionsByUser,
  updateSubscription,
  deleteSubscription,
} from "../controllers/subscriptionController";
import { authenticate } from "../middleware/authMiddleware";

const router = express.Router();

// GET /subscription - Get subscriptions by userSub
router.get("/", authenticate, getSubscriptionsByUser);

// POST /subscription - Create a new subscription
router.post("/", authenticate, createSubscription);

// PUT /subscription - Update an existing subscription
router.put("/", authenticate, updateSubscription);

// DELETE /subscription - Delete a subscription by ID
router.delete("/", authenticate, deleteSubscription);

export default router;
