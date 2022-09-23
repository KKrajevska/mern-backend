import { model, Schema, Types } from "mongoose";
import mongooseUniqueValidator from "mongoose-unique-validator";
import { PlaceSchema } from "./place";

export interface UserSchema {
  name: string;
  email: string;
  password: string;
  image: string;
  places: Types.DocumentArray<PlaceSchema>;
}

const userSchema = new Schema<UserSchema>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6 },
  image: { type: String, required: true },
  places: [{ type: Schema.Types.ObjectId, required: true, ref: "Place" }],
});

// userSchema.plugin(mongooseUniqueValidator);

const UserModel = model<UserSchema>("User", userSchema);

export default UserModel;
