import { RequestHandler } from "express";
import { UserT } from "../lib/types";
import { HttpError } from "../models/httpError";
import UserModel from "../models/user";
import { validationResult } from "express-validator";
import { compare, hash } from "bcryptjs";
import { sign } from "jsonwebtoken";

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

  let hashedPassword;

  try {
    hashedPassword = await hash(password, 12);
  } catch (err) {
    const error = new HttpError(
      "Could not create user, please try again later",
      500
    );
    return next(error);
  }

  const createdUser = new UserModel({
    name,
    email,
    password: hashedPassword,
    image: req.file && req.file.path,
    places,
  });

  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError("Signup failed, please try again later", 500);
    return next(error);
  }

  let token;

  try {
    token = sign(
      { userId: createdUser.id, email: createdUser.email },
      "supersecret_dont_share",
      { expiresIn: "1h" }
    );
  } catch (err) {
    const error = new HttpError("Signup failed, please try again later", 500);
    return next(error);
  }

  res
    .status(201)
    .json({ userId: createdUser.id, email: createdUser.email, token: token });
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

  if (!existingUser) {
    const error = new HttpError(
      "Invalid credentials, could not log you in.",
      401
    );
    return next(error);
  }

  let isValidPassword = false;

  try {
    isValidPassword = await compare(password, existingUser.password);
  } catch (err) {
    const error = new HttpError(
      "Could not log you in, please check your credentials",
      500
    );
    return next(error);
  }

  if (isValidPassword) {
    const error = new HttpError(
      "Invalid credentials, could not log you in.",
      401
    );
    return next(error);
  }

  let token;

  try {
    token = sign(
      { userId: existingUser.id, email: existingUser.email },
      "supersecret_dont_share",
      { expiresIn: "1h" }
    );
  } catch (err) {
    const error = new HttpError("Signup failed, please try again later", 500);
    return next(error);
  }

  res.json({
    userId: existingUser.id,
    email: existingUser.email,
    token: token,
  });
};
