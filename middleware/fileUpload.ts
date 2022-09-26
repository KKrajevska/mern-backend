import multer from "multer";
import { v1 as uuid } from "uuid";

type MimeType = "image/png" | "image/jpeg" | "image/png";

const MIME_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
};

const fileUpload = multer({
  limits: { fileSize: 500000 },
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/images");
    },
    filename: (req, file, cb) => {
      const ext = MIME_TYPE_MAP[file.mimetype as MimeType];
      cb(null, uuid() + "." + ext);
    },
  }),
  fileFilter: (req, file, cb) => {
    const isValid = !!MIME_TYPE_MAP[file.mimetype as MimeType];
    const error = isValid ? null : new Error("Invalid Mime type!");
    cb(null, isValid);
  },
});

export default fileUpload;
