import express from "express";
import {
  createChannel,
  getChannelById,
  updateChannel,
  deleteChannel,
} from "../controllers/channelController";
import { authenticate } from "../middleware/authMiddleware";

const router = express.Router();

// GET /channel - Get all channels or a specific channel by ownerSub
router.get("/", authenticate, getChannelById);

// POST /channel - Create a new channel
router.post("/", authenticate, createChannel);

// PUT /channel - Update an existing channel
router.put("/", authenticate, updateChannel);

// DELETE /channel - Delete a channel by ownerSub and name
router.delete("/", authenticate, deleteChannel);

export default router;
