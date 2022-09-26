import { Router } from "express";
import { getUsers, login, signup } from "../controllers/usersController";
import { check } from "express-validator";
import fileUpload from "../middleware/fileUpload";

const usersRoutes = Router();

usersRoutes.get("/", getUsers);
usersRoutes.post(
  "/signup",
  fileUpload.single("image"),
  [
    check("name").not().isEmpty(),
    check("email").normalizeEmail().isEmail(),
    check("password").isLength({ min: 6 }),
  ],
  signup
);
usersRoutes.post("/login", login);

export default usersRoutes;
