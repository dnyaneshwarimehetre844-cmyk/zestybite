const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const UPLOAD_DIR = path.join(__dirname, "..", "public", "images", "uploads");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });


const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (!allowed.includes(file.mimetype)) {
    return cb(new Error("Only JPEG, PNG, or WEBP images are allowed"));
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, 
});


const compressImage = async (req, res, next) => {
  try {
    if (!req.file) return next();

    const prefix = req.file.fieldname || "upload";
    const filename = `${prefix}-${Date.now()}-${Math.round(Math.random() * 1e9)}.webp`;
    const outputPath = path.join(UPLOAD_DIR, filename);

    const resizeOptions =
      prefix === "avatar"
        ? { width: 400, height: 400, fit: "cover" }
        : { width: 800, height: 800, fit: "inside", withoutEnlargement: true };

    await sharp(req.file.buffer)
      .resize(resizeOptions)
      .webp({ quality: 75 })
      .toFile(outputPath);

    req.body.image = `/images/uploads/${filename}`;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { upload, compressImage };