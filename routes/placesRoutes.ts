import express from "express";
import { HttpError } from "../models/httpError";

const placesRoutes = express.Router();

const DUMMY_PLACES = [
  {
    id: "p1",
    title: "Empire State Building",
    description: "One of the most famous skyscrapers in the world!",
    location: {
      lat: 40.7484474,
      lng: -73.9871516,
    },
    address: "20 W 34th St., New York, NY 10001",
    creator: "u1",
  },
];

placesRoutes.get("/:pid", (req, res, next) => {
  const placeId = req.params.pid;
  const place = DUMMY_PLACES.find((p) => p.id === placeId);

  if (!place) {
    const error = new HttpError(
      "Could not find a place for the provided id",
      404
    );

    throw error;
  }

  res.json({ place });
});

placesRoutes.get("/user/:uid", (req, res, next) => {
  const userId = req.params.uid;
  const place = DUMMY_PLACES.find((p) => p.creator === userId);

  if (!place) {
    const error = new HttpError(
      "Could not find a place for the provided id",
      404
    );

    return next(error);
  }

  res.json({ place });
});
export default placesRoutes;
