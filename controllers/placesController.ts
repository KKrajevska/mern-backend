import { create } from "domain";
import { NextFunction, Request, RequestHandler, Response } from "express";
import { PlaceModelT, PlaceT } from "../lib/types";
import { HttpError } from "../models/httpError";
import { v4 as uuidv4 } from "uuid";
import { validationResult } from "express-validator";
import PlaceModel, { PlaceSchema } from "../models/place";
import UserModel, { UserSchema } from "../models/user";
import { startSession, Types } from "mongoose";
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

export const getPlaceById: RequestHandler = async (req, res, next) => {
  const placeId = req.params.pid;
  let place;
  try {
    place = await PlaceModel.findById(placeId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not find a place",
      500
    );
    return next(error);
  }

  if (!place) {
    const error = new HttpError(
      "Could not find a place for the provided id",
      404
    );

    return next(error);
  }

  res.json({ place: place.toObject({ getters: true }) });
};

export const getPlacesByUserId: RequestHandler = async (req, res, next) => {
  const userId = req.params.uid;
  let places;

  try {
    places = await PlaceModel.find({ creator: userId });
  } catch (err) {
    const error = new HttpError(
      "Fetching places failed, please try again later",
      500
    );
    return next(error);
  }

  if (places.length === 0) {
    const error = new HttpError(
      "Could not find places for the provided id",
      404
    );

    return next(error);
  }

  res.json({
    places: places.map((place) => place.toObject({ getters: true })),
  });
};

export const createPlace: RequestHandler<{}, {}, PlaceT> = async (
  req,
  res,
  next
) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    throw new HttpError("Invalid inputs passed, please check your data", 422);
  }

  const { title, description, location, address, creator } = req.body;
  const createdPlace = new PlaceModel({
    title,
    description,
    address,
    location,
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Empire_State_Building_%28aerial_view%29.jpg/400px-Empire_State_Building_%28aerial_view%29.jpg",
    creator,
  });

  let user;

  try {
    user = await UserModel.findById(creator);
  } catch (err) {
    const error = new HttpError(
      "Creating place failed, please try again later",
      500
    );
    return next(error);
  }

  if (!user) {
    const error = new HttpError("Could not find user for the provided id", 404);
    return next(error);
  }

  try {
    const sess = await startSession();
    sess.startTransaction();
    await createdPlace.save({ session: sess });
    user.places.push(createdPlace);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      "Creating place failed, please try again.",
      500
    );
    return next(error);
  }
  res.status(201).json({ place: createdPlace });
};

export const updatePlace: RequestHandler<
  { pid: string },
  {},
  { title: string; description: string }
> = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    throw new HttpError("Invalid inputs passed, please check your data", 422);
  }

  const { title, description } = req.body;
  const placeId = req.params.pid;

  // const updatedPlace = { ...DUMMY_PLACES.find((p) => p.id === placeId) };

  let place;

  try {
    place = await PlaceModel.findById(placeId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update place",
      500
    );
    return next(error);
  }

  if (!place) {
    const error = new HttpError(
      "Could not find a place for the provided id",
      404
    );
    return next(error);
  }
  place.title = title;
  place.description = description;

  try {
    await place.save();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update place",
      500
    );
    return next(error);
  }

  res.status(200).json({ place: place.toObject({ getters: true }) });
};

export const deletePlace: RequestHandler<{ pid: string }> = async (
  req,
  res,
  next
) => {
  const placeId = req.params.pid;

  let place;

  try {
    // place = await PlaceModel.findById(placeId).populate("creator");
    place = await PlaceModel.findById(placeId).populate<{
      creator: UserSchema;
    }>("creator");
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete place.",
      500
    );
    return next(error);
  }

  if (!place) {
    const error = new HttpError(
      "Could not find a place for the provided id",
      404
    );
    return next(error);
  }

  try {
    const sess = await startSession();
    sess.startTransaction();
    await place.remove({ session: sess });

    place.creator.places.pull(place);
    const creator = new UserModel(place.creator, { _id: false });
    await creator.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    console.log(err);
    const error = new HttpError(
      "Something went wrong, could not delete place.",
      500
    );
    return next(error);
  }

  res.status(200).json({ message: "Deleted place" });
};
