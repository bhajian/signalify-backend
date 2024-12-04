import express, { Request, Response } from "express";
import { authenticate } from "./authMiddleware";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

// Unprotected Route
app.get("/hello", (req: Request, res: Response) => {
  res.json({ message: "Hello World!" });
});

// Protected Route
app.get("/protected", authenticate, (req: Request, res: Response) => {
  res.json({ message: "Welcome to the protected route!", user: req.user });
});





app.get("/token", async (req: Request, res: Response): Promise<void> => {
  const code = req.query.code as string;

  if (!code) {
    res.status(400).json({ error: "Authorization code is missing" });
    return;
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await axios.post(
      process.env.COGNITO_TOKEN_URL as string,
      new URLSearchParams({
        grant_type: "authorization_code",
        client_id: process.env.COGNITO_CLIENT_ID as string,
        // client_secret: process.env.COGNITO_CLIENT_SECRET as string,
        code: code,
        redirect_uri: process.env.COGNITO_REDIRECT_URI as string,
      }).toString(),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    const { id_token, access_token } = tokenResponse.data;

    res.status(200).json({ id_token, access_token });
  } catch (error: any) {
    console.error("Error exchanging code for tokens:", error.response?.data || error.message);
    res.status(500).json({
      error: "Failed to exchange code for tokens",
      details: error.response?.data,
    });
  }
});






// Start Server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
