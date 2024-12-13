import { Request, Response } from "express";
import { getDB } from "../db";
import { Collection } from "mongodb";

const profileCollectionName = process.env.PROFILE_COLLECTION as string;
let profileCollection : Collection;

export const initializeProfilesCollection = () => {
  const db = getDB(); // Get the DB instance
  profileCollection = db.collection(profileCollectionName);
};

// Create a new profile (POST)
export const createProfile = async (req: Request, res: Response): Promise<void> => {
  try {

    // const { sub, username, email } = req.user as { sub: string, username: string; email: string; };
    const { name, lastName, phone, address, role, sub, username, email } = req.body;

    if (!sub || !email) {
      res.status(400).json({ error: "sub and email are required" });
      return;
    }

    // Check if the profile already exists
    const existingProfile = await profileCollection.findOne({ sub });
    if (existingProfile) {
      res.status(200).json({ message: "Profile already exists", profile: existingProfile });
      return;
    }

    // Create a new profile
    const newProfile = {
      sub,
      username,
      email,
      name,
      lastName,
      phone,
      address,
      role,
      createdAt: new Date(),
    };

    await profileCollection.insertOne(newProfile);
    res.status(201).json({ message: "Profile created successfully", profile: newProfile });
  } catch (error) {
    console.error("Error creating profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get all profiles or a specific profile by email (GET)
export const getProfiles = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sub } = req.user as { sub: string, username: string; email: string };

    if (sub) {
      const profile = await profileCollection.findOne({ sub });

      if (!profile) {
        res.status(404).json({ message: "Profile not found" });
        return;
      }
      res.status(200).json({ profile });
    } else {
      res.status(200).json({ });
    }
  } catch (error) {
    console.error("Error fetching profiles:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update a profile by email (PUT)
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sub } = req.body;

    if (!sub) {
      res.status(400).json({ error: "Email is required to update a profile" });
      return;
    }

    const { name, lastName, phone, address, role } = req.body;

    // Update the profile
    const result = await profileCollection.updateOne(
      { sub },
      { $set: { name, lastName, phone, address, role } }
    );

    if (result.matchedCount === 0) {
      res.status(404).json({ message: "Profile not found" });
      return;
    }

    res.status(200).json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete a profile by email (DELETE)
export const deleteProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sub } = req.query;

    if (!sub) {
      res.status(400).json({ error: "Email is required to delete a profile" });
      return;
    }

    // Delete the profile
    const result = await profileCollection.deleteOne({ sub });

    if (result.deletedCount === 0) {
      res.status(404).json({ message: "Profile not found" });
      return;
    }

    res.status(200).json({ message: "Profile deleted successfully" });
  } catch (error) {
    console.error("Error deleting profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
