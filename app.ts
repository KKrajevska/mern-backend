import express, {
  ErrorRequestHandler,
  NextFunction,
  Request,
  Response,
} from "express";
import bodyParser from "body-parser";
import placesRoutes from "./routes/placesRoutes";
import { HttpError } from "./models/httpError";
import mongoose from "mongoose";
import sanitizedConfig from "./config";

require("dotenv").config();
const app = express();

app.use(bodyParser.json());
app.use("/api/places", placesRoutes);

app.use((req: Request, res: Response, next: NextFunction) => {
  const error = new HttpError("Could not find this route.", 404);
  throw error;
});

const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
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
