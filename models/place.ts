import mongoose, { Document, model, Schema } from "mongoose";
import { LocationT } from "../lib/types";

interface PlaceSchema {
  title: string;
  description: string;
  image: string;
  address: string;
  location: LocationT;
  creator: any;
}

const placeSchema = new Schema<PlaceSchema>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  address: { type: String, required: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  creator: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
});

const PlaceModel = model<PlaceSchema>("Place", placeSchema);

export default PlaceModel;
