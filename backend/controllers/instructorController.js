// Create a new instructor controller file if it doesn't exist
import db from '../models/index.js';

const { User, Course } = db;

// Get instructor public profile (for course preview pages)
export const getInstructorPublicProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const instructor = await User.findOne({
      where: {
        id,
        role: 'instructor',
        isActive: true
      },
      attributes: ['id', 'name', 'profileImage', 'bio'],
      include: [
        {
          model: Course,
          as: 'createdCourses',
          where: {
            isPublished: true,
            isApproved: true
          },
          attributes: ['id', 'title'],
          required: false
        }
      ]
    });
    
    if (!instructor) {
      return res.status(404).json({
        success: false,
        message: 'Instructor not found'
      });
    }
    
    // Count approved and published courses
    const courseCount = instructor.createdCourses.length;
    
    // Format the response
    const instructorProfile = {
      id: instructor.id,
      name: instructor.name,
      profileImage: instructor.profileImage,
      bio: instructor.bio,
      courseCount
    };
    
    res.status(200).json({
      success: true,
      data: instructorProfile
    });
  } catch (error) {
    next(error);
  }
};



export const getInstructorProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const instructor = await User.findOne({
      where: {
        id: userId,
        role: 'instructor'
      },
      attributes: ['id', 'name', 'email', 'profileImage', 'bio', 'credentials', 'socialLinks', 'notifications']
    });
    
    if (!instructor) {
      return res.status(404).json({
        success: false,
        message: 'Instructor profile not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: instructor
    });
  } catch (error) {
    next(error);
  }
};

export const updateInstructorProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name, bio, credentials, socialLinks, notifications } = req.body;
    
    const instructor = await User.findOne({
      where: {
        id: userId,
        role: 'instructor'
      }
    });
    
    if (!instructor) {
      return res.status(404).json({
        success: false,
        message: 'Instructor profile not found'
      });
    }
    
    // Update fields
    await instructor.update({
      name: name || instructor.name,
      bio: bio !== undefined ? bio : instructor.bio,
      credentials: credentials !== undefined ? credentials : instructor.credentials,
      socialLinks: socialLinks || instructor.socialLinks,
      notifications: notifications || instructor.notifications
    });
    
    res.status(200).json({
      success: true,
      data: instructor,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfileImage = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }
    
    // Get file path (will depend on your file upload implementation)
    const profileImage = `/uploads/profiles/${req.file.filename}`;
    
    const instructor = await User.findOne({
      where: {
        id: userId,
        role: 'instructor'
      }
    });
    
    if (!instructor) {
      return res.status(404).json({
        success: false,
        message: 'Instructor profile not found'
      });
    }
    
    // Update the profile image field
    await instructor.update({ profileImage });
    
    res.status(200).json({
      success: true,
      data: { profileImage },
      message: 'Profile image updated successfully'
    });
  } catch (error) {
    next(error);
  }
};




export const getPublicInstructor = async (req, res, next) => {
  try {
    const { id } = req.params;

    const instructor = await User.findOne({
      where: { 
        id,
        role: 'instructor'
      },
      attributes: ['id', 'name', 'profileImage', 'bio']
    });

    if (!instructor) {
      return res.status(404).json({
        success: false,
        message: "Instructor not found",
      });
    }

    res.status(200).json({
      success: true,
      data: instructor,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getInstructorPublicProfile,
  getInstructorProfile,
  updateInstructorProfile,
  updateProfileImage
};