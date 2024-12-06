import express from "express";
import {
  createProfile,
  getProfiles,
  updateProfile,
  deleteProfile,
} from "../controllers/profileController";
import { authenticate } from "../middleware/authMiddleware";

const router = express.Router();

// GET /profile - Get all profiles or a specific profile by email
router.get("/", authenticate, getProfiles);

// POST /profile - Create a new profile
router.post("/", authenticate, createProfile);

// PUT /profile - Update an existing profile
router.put("/", authenticate, updateProfile);

// DELETE /profile - Delete a profile by email
router.delete("/", authenticate, deleteProfile);

export default router;
