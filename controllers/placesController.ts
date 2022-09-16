import { create } from "domain";
import { NextFunction, Request, Response } from "express";
import { PlaceT } from "../lib/types";
import { HttpError } from "../models/httpError";
import { v4 as uuidv4 } from "uuid";
import { validationResult } from "express-validator";
let DUMMY_PLACES: PlaceT[] = [
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

export const getPlaceById = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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
};

export const getPlacesByUserId = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.params.uid;
  const places = DUMMY_PLACES.filter((p) => p.creator === userId);

  if (places.length === 0) {
    const error = new HttpError(
      "Could not find a places for the provided id",
      404
    );

    return next(error);
  }

  res.json({ places });
};

export const createPlace = (
  req: Request<{}, {}, PlaceT>,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    throw new HttpError("Invalid inputs passed, please check your data", 422);
  }

  const { title, description, location, address, creator } = req.body;
  const createdPlace = {
    id: uuidv4(),
    title,
    description,
    location,
    address,
    creator,
  };

  DUMMY_PLACES.push(createdPlace);

  res.status(201).json({ place: createdPlace });
};

export const updatePlace = (
  req: Request<{ pid: string }, {}, { title: string; description: string }>,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    throw new HttpError("Invalid inputs passed, please check your data", 422);
  }

  const { title, description } = req.body;
  const placeId = req.params.pid;

  const updatedPlace = { ...DUMMY_PLACES.find((p) => p.id === placeId) };
  const placeIndex = DUMMY_PLACES.findIndex((p) => p.id === placeId);

  updatedPlace.title = title;
  updatedPlace.description = description;

  DUMMY_PLACES[placeIndex] = updatedPlace as PlaceT;

  res.status(200).json({ place: updatedPlace });
};

export const deletePlace = (
  req: Request<{ pid: string }>,
  res: Response,
  next: NextFunction
) => {
  const placeId = req.params.pid;

  if (!DUMMY_PLACES.find((p) => p.id === placeId)) {
    throw new HttpError("Could not find a place for that id", 404);
  }

  DUMMY_PLACES = DUMMY_PLACES.filter((p) => p.id !== placeId);
  res.status(200).json({ message: "Deleted place" });
};
