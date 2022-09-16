import { NextFunction, Request, Response } from "express";
import { UserT } from "../lib/types";
import { v4 as uuidv4 } from "uuid";
import { title } from "process";
import { HttpError } from "../models/httpError";

const DUMMY_USERS = [
  {
    id: "u1",
    name: "Max Schwartz",
    email: "test@test.com",
    password: "testers",
  },
];

export const getUsers = (req: Request, res: Response, next: NextFunction) => {
  res.json({ users: DUMMY_USERS });
};

export const signup = (
  req: Request<{}, {}, UserT>,
  res: Response,
  next: NextFunction
) => {
  const { name, email, password } = req.body;
  const hasUser = DUMMY_USERS.find((u) => u.email === email);
  if (hasUser) {
    throw new HttpError("Could not create user, email already exists", 422);
  }
  const createdUser = {
    id: uuidv4(),
    name,
    email,
    password,
  };

  DUMMY_USERS.push(createdUser);
  res.status(201).json({ user: createdUser });
};

export const login = (
  req: Request<{}, {}, { email: string; password: string }>,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body;
  const identidiedUser = DUMMY_USERS.find((u) => u.email === email);
  if (!identidiedUser || identidiedUser.password !== password) {
    throw new HttpError(
      "Could not identify user, credentials seem to be wront",
      401
    );
  }
  res.json({ message: "Logged in" });
};
