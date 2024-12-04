import express from "express";
import { getProtected } from "../controllers/protectedController";
import { authenticate } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/", authenticate, getProtected); // GET /protected with authentication

export default router;
