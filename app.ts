import express, { ErrorRequestHandler } from "express";
import bodyParser from "body-parser";
import placesRoutes from "./routes/placesRoutes";

const app = express();

app.use("/api/places", placesRoutes);

const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error occured" });
};

app.use(errorHandler);

app.listen(5000);
