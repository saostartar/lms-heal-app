import express from 'express';
import { getUsers, getUser, updateUser, deleteUser } from '../controllers/userController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

// Apply authentication to all routes
router.use(protect);

// Routes for admin only
router.route('/')
  .get(authorize('admin'), getUsers);

// Routes for both users and admins (with different permissions)
router.route('/:id')
  .get(getUser)
  .put(updateUser)
  .delete(authorize('admin'), deleteUser);

export default router;