import express, { ErrorRequestHandler, RequestHandler } from "express";
import bodyParser, { raw } from "body-parser";
import placesRoutes from "./routes/placesRoutes";
import { HttpError } from "./models/httpError";
import mongoose from "mongoose";
import sanitizedConfig from "./config";
import usersRoutes from "./routes/usersRoutes";
import { unlink } from "fs";
import path from "path";

require("dotenv").config();
const app = express();

app.use(bodyParser.json());

app.use("/uploads/images", express.static(path.join("uploads", "images")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, PATCH");
  next();
});

app.use("/api/places", placesRoutes);
app.use("/api/users", usersRoutes);

app.use((req, res, next) => {
  const error = new HttpError("Could not find this route.", 404);
  throw error;
});

const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
  if (req.file) {
    unlink(req.file.path, (err) => {
      console.log(err);
    });
  }
  if (res.headersSent) {
    return next(error);
  }

  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error occured" });
};

app.use(errorHandler);

mongoose
  .connect(sanitizedConfig.MONGO_URI)
  .then(() => app.listen(5000))
  .catch((err) => console.log(err));
