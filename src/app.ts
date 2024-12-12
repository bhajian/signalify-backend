import express from "express";
import { connectDB } from "./db";
import helloRoutes from "./routes/hello";
import tokenRoutes from "./routes/token";
import protectedRoutes from "./routes/protected";
import profileRoutes from "./routes/profile";
import channelRoutes from "./routes/channel";
import signalRoutes from "./routes/signal";
import subscriptionRoutes from "./routes/subscription";
import paymentRoutes from "./routes/payment";
import { initializeProfilesCollection } from "./controllers/profileController";
import { initializeChannelCollection } from "./controllers/channelController";
import { initializeSignalCollection } from "./controllers/signalController";
import { initializeSubscriptionCollection } from "./controllers/subscriptionController";
import { initializeCollections } from "./controllers/paymentController";

const app = express();
(async () => {
    await connectDB();
    initializeProfilesCollection();
    initializeChannelCollection();
    initializeSignalCollection();
    initializeSubscriptionCollection();
    initializeCollections();
  })();
  
app.use(express.json());

// Use routes
app.use("/api/hello", helloRoutes);
app.use("/api/token", tokenRoutes);
app.use("/api/protected", protectedRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/channel", channelRoutes);
app.use("/api/signal", signalRoutes);
app.use("/api/subscription", subscriptionRoutes);
app.use("/api/payment", paymentRoutes);

export default app;
