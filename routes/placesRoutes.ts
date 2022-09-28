import express from "express";
import {
  createPlace,
  deletePlace,
  getPlaceById,
  getPlacesByUserId,
  updatePlace,
} from "../controllers/placesController";
import { check } from "express-validator";
import fileUpload from "../middleware/fileUpload";
import checkAuth from "../middleware/checkAuth";

const placesRoutes = express.Router();

placesRoutes.get("/:pid", getPlaceById);

placesRoutes.get("/user/:uid", getPlacesByUserId);

placesRoutes.use(checkAuth);

placesRoutes.post(
  "/",
  fileUpload.single("image"),
  [
    check("title").not().isEmpty(),
    check("description").isLength({ min: 5 }),
    check("address").not().isEmpty(),
  ],
  createPlace
);

placesRoutes.patch(
  "/:pid",
  [check("title").not().isEmpty(), check("description").isLength({ min: 5 })],
  updatePlace
);

placesRoutes.delete("/:pid", deletePlace);

export default placesRoutes;
