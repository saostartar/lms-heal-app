import db from '../models/index.js';
import { getUserLearningStatistics } from '../utils/analyticsHelper.js';

const { User, Course, Enrollment, LessonProgress } = db;

// Get learner statistics for the dashboard
export const getLearnerStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Get learning statistics using the helper function
    const learningStats = await getUserLearningStatistics(userId);
    
    // Calculate total learning hours
    const totalLearningHours = Math.round(learningStats.totalLearningTimeSeconds / 3600);
    
    // Count active enrollments (not completed)
    const activeEnrollmentsCount = await Enrollment.count({
      where: { 
        userId,
        isCompleted: false
      }
    });
    
    // Count completed courses
    const completedCoursesCount = await Enrollment.count({
      where: { 
        userId,
        isCompleted: true
      }
    });
    
    res.status(200).json({
      success: true,
      data: {
        activeEnrollmentsCount,
        completedCoursesCount,
        totalLearningHours
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get recently accessed courses for the dashboard
export const getRecentCourses = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Get enrollments with course information
    const enrollments = await Enrollment.findAll({
      where: { userId },
      include: [
        {
          model: Course,
          attributes: ['id', 'title', 'thumbnail']
        }
      ],
      order: [['updatedAt', 'DESC']],
      limit: 6
    });
    
    // Format the response
    const formattedCourses = enrollments.map(enrollment => ({
      id: enrollment.Course.id,
      title: enrollment.Course.title,
      thumbnail: enrollment.Course.thumbnail,
      progress: enrollment.progress,
      lastAccessed: enrollment.updatedAt
    }));
    
    res.status(200).json({
      success: true,
      data: formattedCourses
    });
  } catch (error) {
    next(error);
  }
};

// Update learner profile
export const updateLearnerProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name, bio, interests, notifications } = req.body;
    
    // Update user information
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Update fields
    await user.update({
      name: name || user.name,
      bio: bio !== undefined ? bio : user.bio,
      interests: interests !== undefined ? interests : user.interests,
      notifications: notifications || user.notifications
    });
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// Get learner enrollments
export const getLearnerEnrollments = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const enrollments = await Enrollment.findAll({
      where: { userId },
      include: [
        {
          model: Course,
          attributes: ['id', 'title', 'thumbnail'],
          include: [
            {
              model: User,
              as: 'instructor',
              attributes: ['id', 'name', 'profileImage']
            }
          ]
        }
      ],
      order: [['updatedAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: enrollments.length,
      data: enrollments
    });
  } catch (error) {
    next(error);
  }
};

// Get single enrollment
export const getLearnerEnrollment = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.params;

    const enrollment = await Enrollment.findOne({
      where: {
        userId,
        courseId
      },
      include: [
        {
          model: Course,
          attributes: ['id', 'title', 'thumbnail']
        }
      ]
    });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    res.status(200).json({
      success: true,
      data: enrollment
    });
  } catch (error) {
    next(error);
  }
};