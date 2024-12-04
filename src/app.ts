import express from "express";
import helloRoutes from "./routes/hello";
import tokenRoutes from "./routes/token";
import protectedRoutes from "./routes/protected";

const app = express();

// Use routes
app.use("/hello", helloRoutes); // All /helloworld routes
app.use("/token", tokenRoutes); // All /token routes
app.use("/protected", protectedRoutes); // All /protected routes

export default app;
