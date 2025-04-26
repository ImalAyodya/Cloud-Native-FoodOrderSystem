// const multer = require('multer');
// const path = require('path');

// // Configure storage
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'uploads/'); // Temporary folder for uploads
//   },
//   filename: (req, file, cb) => {
//     cb(null, `${Date.now()}-${file.originalname}`);
//   }
// });

// // File filter for CSV and JSON
// const fileFilter = (req, file, cb) => {
//   const filetypes = /csv|json/;
//   const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
//   const mimetype = filetypes.test(file.mimetype);
  
//   if (extname && mimetype) {
//     return cb(null, true);
//   }
//   cb(new Error('Only CSV and JSON files are allowed'));
// };

// // Multer instance
// const upload = multer({
//   storage,
//   fileFilter,
//   limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
// });

// module.exports = upload;

const multer = require('multer');
const path = require('path');

// Configure storage for all uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Temporary folder for uploads
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`); // e.g., image-123456789-987654321.jpg
  },
});

// File filter for CSV and JSON (used for /import route)
const fileFilterForImport = (req, file, cb) => {
  const filetypes = /csv|json/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  }
  cb(new Error('Only CSV and JSON files are allowed'));
};

// File filter for images (used for /upload-image route)
const fileFilterForImages = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|webp/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  }
  cb(new Error('Only JPEG, PNG, and WebP images are allowed'));
};

// Multer instance for CSV/JSON imports
const uploadForImport = multer({
  storage,
  fileFilter: fileFilterForImport,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Multer instance for image uploads
const uploadForImages = multer({
  storage,
  fileFilter: fileFilterForImages,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

module.exports = {
  uploadForImport,
  uploadForImages,
};