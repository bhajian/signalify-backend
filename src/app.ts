import express from "express";
import helloRoutes from "./routes/hello";
import tokenRoutes from "./routes/token";
import protectedRoutes from "./routes/protected";
import profileRoutes from "./routes/profile";
import { connectDB } from "./db";
import { initializeProfilesCollection } from "./controllers/profileController";

const app = express();
(async () => {
    await connectDB();
    initializeProfilesCollection();
  })();
  
app.use(express.json());

// Use routes
app.use("/api/hello", helloRoutes); // All /helloworld routes
app.use("/api/token", tokenRoutes); // All /token routes
app.use("/api/protected", protectedRoutes); // All /protected routes
app.use("/api/profile", profileRoutes);



export default app;
