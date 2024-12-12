import express from "express";
import {
  createChannel,
  getChannelById,
  updateChannel,
  deleteChannel,
  getEnabledChannels,
  getMyChannels,
  toggleChannelStatus
} from "../controllers/channelController";
import { authenticate } from "../middleware/authMiddleware";

const router = express.Router();

// GET /channel - Get all channels or a specific channel by ownerSub
router.get("/", authenticate, getChannelById);

// GET /channel/all - Get all channels with status = ENABLED
router.get("/all", authenticate, getEnabledChannels);

// GET /channel/my - Get all channels owned by the user
router.get("/my", authenticate, getMyChannels);

// POST /channel - Create a new channel
router.post("/", authenticate, createChannel);

// PUT /channel - Update an existing channel
router.put("/", authenticate, updateChannel);

// PUT /channel/status - Enable/Disable a channel
router.put("/status", authenticate, toggleChannelStatus);

// DELETE /channel - Delete a channel by ownerSub and name
router.delete("/", authenticate, deleteChannel);

export default router;
