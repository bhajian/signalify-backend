import express from "express";
import {
  createSubscription,
  handleStripeWebhook,
  getPaymentHistory,
} from "../controllers/paymentController";
import { authenticate } from "../middleware/authMiddleware";

const router = express.Router();

// POST /payment/subscribe - Create a subscription and Stripe Checkout session
router.post("/subscribe", authenticate, createSubscription);

// POST /payment/webhook - Handle Stripe webhook
router.post("/webhook", handleStripeWebhook);

// GET /payment/history - Get payment history by user
router.get("/history", authenticate, getPaymentHistory);

export default router;
