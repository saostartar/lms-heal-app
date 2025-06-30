import express from 'express';
import { protect, authorize } from '../middlewares/auth.js';
import { getInstructorDashboard } from '../controllers/analyticsController.js';
import { 
    getInstructorPublicProfile, 
    getInstructorProfile,
    updateInstructorProfile,
    updateProfileImage
  } from '../controllers/instructorController.js';
  import multer from 'multer';
  import path from 'path';
  import fs from 'fs';
  
  const router = express.Router();
  
  // Configure multer for file uploads
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = 'uploads/profiles';
      
      // Create directory if it doesn't exist
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      // Generate unique filename with timestamp
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, `instructor-${req.user.id}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
  });
  
  // File filter to only allow image files
  const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  };
  
  const upload = multer({ 
    storage, 
    fileFilter,
    limits: {
      fileSize: 2 * 1024 * 1024 // 2MB size limit
    }
  });

  // Profile routes
router.get('/profile', protect, authorize('instructor'), getInstructorProfile);
router.put('/profile', protect, authorize('instructor'), updateInstructorProfile);
router.post('/profile/image', protect, authorize('instructor'), upload.single('profileImage'), updateProfileImage);

// Dashboard routes
router.get('/dashboard', protect, authorize('instructor'), getInstructorDashboard);

// Public routes
router.get('/:id', getInstructorPublicProfile);
export default router;