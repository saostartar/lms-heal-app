import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

// Define allowed file types
const allowedFileTypes = /pdf|doc|docx|ppt|pptx/;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'uploads', 'lessons');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Sanitize original filename (optional, but recommended)
    const sanitizedOriginalName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
    const uniqueFilename = `${uuidv4()}-${sanitizedOriginalName}`;
    cb(null, uniqueFilename);
  }
});

// Filter for allowed file types
const fileFilter = (req, file, cb) => {
  const extname = allowedFileTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedFileTypes.test(file.mimetype); // Basic check, extension is often more reliable

  if (extname) { // Primarily rely on extension for these types
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, Word (doc, docx), and PowerPoint (ppt, pptx) files are allowed.'), false);
  }
};

// Export multer configured for lesson attachment uploads (allow multiple files)
const uploadLessonAttachments = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit per file (adjust as needed)
  fileFilter: fileFilter
}).array('attachments', 5); // 'attachments' is the field name, allow up to 5 files

export default uploadLessonAttachments;