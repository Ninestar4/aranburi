import express from "express";
import mongoose from "mongoose";
import userRouter from "./routes/user.route.js";
import authRouter from "./routes/auth.route.js";
import cors from "cors";

mongoose
  .connect(
    "mongodb+srv://napatrlove:NrUjSzWGWWXjRi5U@aranburi.vcryxfj.mongodb.net/aranburi?retryWrites=true&w=majority&appName=aranburi"
  )
  .then(() => {
    console.log("Connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

const app = express();

// Configure CORS to allow requests from any origin
app.use(cors());

app.use(express.json());

// Routes
app.use("/api/user", userRouter);
app.use("/api/auth", authRouter);

// MIDDLEWARE for error handling
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});

app.listen(3001, () => {
  console.log("Server is running on port 3001");
});
