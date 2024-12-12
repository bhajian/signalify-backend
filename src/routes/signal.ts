import express from "express";
import {
  createSignal,
  getSignalsByChannel,
  updateSignal,
  deleteSignal,
} from "../controllers/signalController";
import { authenticate } from "../middleware/authMiddleware";

const router = express.Router();

// GET /signal - Get all signals by channelId
router.get("/", authenticate, getSignalsByChannel);

// POST /signal - Create a new signal
router.post("/", authenticate, createSignal);

// PUT /signal - Update an existing signal
router.put("/", authenticate, updateSignal);

// DELETE /signal - Delete a signal by ID
router.delete("/", authenticate, deleteSignal);

export default router;
