// import multer from 'multer';
// import path from 'path';

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'uploads/avatars/'); // Lưu ảnh vào thư mục này
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//     cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
//   }
// });

// export const uploadAvatar = multer({ storage: storage });