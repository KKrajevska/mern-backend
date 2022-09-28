import { RequestHandler } from "express";
import { JwtPayload, verify } from "jsonwebtoken";
import { Indexed, SUPERSECRET_TOKEN } from "../lib/types";
import { HttpError } from "../models/httpError";

interface UserJwtPayload extends JwtPayload {
  userId: string;
  email: string;
}

const checkAuth: RequestHandler = (req: Indexed, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      throw new Error("Authorization failed!");
    }
    const decodedToken = <UserJwtPayload>verify(token, SUPERSECRET_TOKEN);
    req.userData = { userId: decodedToken.userId };
    next();
  } catch (err) {
    const error = new HttpError("Authorization failed", 401);
    return next(error);
  }
};

export default checkAuth;
