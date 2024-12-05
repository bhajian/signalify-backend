import express from "express";
import { getProtected, getUsers } from "../controllers/protectedController";
import { authenticate } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/", authenticate, getProtected); // GET /protected with authentication
router.get("/users", authenticate, getUsers);

export default router;
