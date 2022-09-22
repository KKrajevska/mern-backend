import { model, Schema, Types } from "mongoose";
import { LocationT } from "../lib/types";

export interface PlaceSchema {
  title: string;
  description: string;
  image: string;
  address: string;
  location: LocationT;
  creator: Types.ObjectId;
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
  creator: { type: Schema.Types.ObjectId, required: true, ref: "User" },
});

const PlaceModel = model<PlaceSchema>("Place", placeSchema);

export default PlaceModel;
