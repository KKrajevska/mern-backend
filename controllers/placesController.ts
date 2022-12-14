import { RequestHandler } from "express";
import { PlaceT, Indexed } from "../lib/types";
import { HttpError } from "../models/httpError";
import { validationResult } from "express-validator";
import PlaceModel from "../models/place";
import UserModel, { UserSchema } from "../models/user";
import { startSession } from "mongoose";
import { unlink } from "fs";

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
  req: Indexed,
  res,
  next
) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    throw new HttpError("Invalid inputs passed, please check your data", 422);
  }

  const { title, description, address, creator } = req.body;
  const createdPlace = new PlaceModel({
    title,
    description,
    address,
    location: { lat: 40.7484405, lng: -73.9878531 },
    image: req.file && req.file.path,
    creator: req.userData.userId,
  });

  let user;

  try {
    user = await UserModel.findById(req.userData.userId);
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
> = async (req: Indexed, res, next) => {
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

  if (place.creator.toString() !== req.userData.userId) {
    const error = new HttpError("You are not allowed to edit this place", 401);
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
  req: Indexed,
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

  const imagePath = place.image;
  try {
    const sess = await startSession();
    sess.startTransaction();
    await place.remove({ session: sess });

    place.creator.places.pull(place);
    const creator = new UserModel(place.creator, { id: true });
    await creator.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete place.",
      500
    );
    return next(error);
  }

  console.log("cr", place.creator.id);

  if (place.creator.id !== req.userData.userId) {
    const error = new HttpError(
      "You are not allowed to delete this place",
      401
    );
    return next(error);
  }

  unlink(imagePath, (err) => {
    console.log(err);
  });

  res.status(200).json({ message: "Deleted place" });
};
