import multer from "multer";
import path from "path";
import fs from "fs";

export function createUploader(subFolder: string) {
  const uploadDir = path.join(
    process.cwd(),
    "uploads",
    subFolder
  );

  // Tạo folder nếu chưa có
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const filename =
        Date.now() +
        "-" +
        Math.round(Math.random() * 1e9) +
        path.extname(file.originalname);
      cb(null, filename);
    },
  });

  return multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 }, 
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.startsWith("image/")) {
        cb(new Error("Chỉ cho phép upload ảnh"));
      } else {
        cb(null, true);
      }
    },
  });
}
