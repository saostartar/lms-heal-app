import express from 'express';
import { getPublicCourse } from '../controllers/courseController.js';
import { getPublicModulesByCourse } from '../controllers/modulesController.js';
import { getPublicInstructor } from '../controllers/instructorController.js';

const router = express.Router();

// Public course endpoints
router.get('/courses/:id', getPublicCourse);
router.get('/modules/course/:courseId', getPublicModulesByCourse);
router.get('/instructors/:id', getPublicInstructor);

export default router;