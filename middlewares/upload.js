// middlewares/upload.js

import multer from 'multer';

const storage = multer.memoryStorage(); // Store in memory or configure disk/cloud
export  const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Max 10MB
});



