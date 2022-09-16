import { Router } from "express";
import { getUsers, login, signup } from "../controllers/usersController";
import { check } from "express-validator";

const usersRoutes = Router();

usersRoutes.get("/", getUsers);
usersRoutes.post(
  "/signup",
  [
    check("name").not().isEmpty(),
    check("email").normalizeEmail().isEmail(),
    check("password").isLength({ min: 6 }),
  ],
  signup
);
usersRoutes.post("/login", login);

export default usersRoutes;
