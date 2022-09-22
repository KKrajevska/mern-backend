import { NextFunction, Request, RequestHandler, Response } from "express";
import { UserT } from "../lib/types";
import { v4 as uuidv4 } from "uuid";
import { title } from "process";
import { HttpError } from "../models/httpError";
import UserModel from "../models/user";
import { validationResult } from "express-validator";

const DUMMY_USERS = [
  {
    id: "u1",
    name: "Max Schwartz",
    email: "test@test.com",
    password: "testers",
  },
];

export const getUsers: RequestHandler = async (req, res, next) => {
  let users;
  try {
    users = await UserModel.find({}, "-password");
  } catch (err) {
    const error = new HttpError(
      "Fetching users failed, please try again later.",
      500
    );
    return next(error);
  }
  res.json({ users: users.map((user) => user.toObject({ getters: true })) });
};

export const signup: RequestHandler<{}, {}, UserT> = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }
  const { name, email, password, places } = req.body;

  let existingUser;

  try {
    existingUser = await UserModel.findOne({ email });
  } catch (err) {
    const error = new HttpError("Signup failed, please try again later", 500);
    return next(error);
  }

  if (existingUser) {
    const error = new HttpError(
      "User already exists, please login instead",
      422
    );
    return next(error);
  }

  const createdUser = new UserModel({
    name,
    email,
    password,
    image: "https://live.staticflickr.com/7631/26849088292_36fc52ee90_b.jpg",
    places,
  });

  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError("Signup failed, please try again later", 500);
    return next(error);
  }
  res.status(201).json({ user: createdUser.toObject({ getters: true }) });
};

export const login: RequestHandler<
  {},
  {},
  { email: string; password: string }
> = async (req, res, next) => {
  const { email, password } = req.body;

  let existingUser;

  try {
    existingUser = await UserModel.findOne({ email });
  } catch (err) {
    const error = new HttpError(
      "Logging in failed, please try again later.",
      500
    );
    return next(error);
  }

  if (!existingUser || existingUser.password !== password) {
    const error = new HttpError(
      "Invalid credentials, could not log you in.",
      401
    );
    return next(error);
  }

  res.json({ message: "Logged in!" });
};
