import express from "express";
import { getToken } from "../controllers/tokenController";

const router = express.Router();

router.get("/", getToken); // GET /token

export default router;
