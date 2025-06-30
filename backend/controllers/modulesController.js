import { validationResult } from "express-validator";
import db from "../models/index.js";

const { Module, Course, Lesson, LessonProgress, ModuleProgress } = db;

// Get all modules for a course
export const getCourseModules = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { preview } = req.query;

    // Check if course exists
    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Skip approval/publication checks
     
    // Determine what data to include based on preview mode
    let includeOptions = [];

    if (preview === "true") {
      // For preview mode, include limited lesson information without content
      includeOptions = [
        {
          model: Lesson,
          attributes: ["id", "title", "type", "duration"],
          // Don't include lesson content in preview mode
        },
      ];
    } else {
      // Full information for authenticated users
      includeOptions = [
        {
          model: Lesson,
          include: [
            {
              model: LessonProgress,
              where: req.user ? { userId: req.user.id } : null,
              required: false,
            },
          ],
        },
        {
          model: ModuleProgress,
          where: req.user ? { userId: req.user.id } : null,
          required: false,
        },
      ];
    }

    // Get modules with appropriate includes
    const modules = await Module.findAll({
      where: { courseId },
      include: includeOptions,
      order: [
        ["position", "ASC"],
        [Lesson, "position", "ASC"],
      ],
    });

    // Calculate additional information for preview mode
    if (preview === "true") {
      modules.forEach((module) => {
        if (module.Lessons) {
          module.dataValues.lessonCount = module.Lessons.length;
          module.dataValues.totalDuration = module.Lessons.reduce(
            (sum, lesson) => sum + (lesson.duration || 0),
            0
          );
        }
      });
    }

    res.status(200).json({
      success: true,
      count: modules.length,
      data: modules,
    });
  } catch (error) {
    next(error);
  }
};

// Get single module
export const getModule = async (req, res, next) => {
  try {
    const { moduleId } = req.params;

    const module = await Module.findByPk(moduleId);
    if (!module) {
      return res.status(404).json({
        success: false,
        message: "Module not found",
      });
    }

    res.status(200).json({
      success: true,
      data: module,
    });
  } catch (error) {
    next(error);
  }
};

// Create new module
export const createModule = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { courseId } = req.params;
    const { title, description, position } = req.body;

    // Check if course exists
    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Check if user is authorized to create module for this course
    if (course.instructorId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to create modules for this course",
      });
    }

    // Get max position if not provided
    let modulePosition = position;
    if (modulePosition === undefined) {
      const maxPositionModule = await Module.findOne({
        where: { courseId },
        order: [["position", "DESC"]],
      });
      modulePosition = maxPositionModule ? maxPositionModule.position + 1 : 0;
    }

    // Create module
    const module = await Module.create({
      courseId,
      title,
      description,
      position: modulePosition,
    });

    res.status(201).json({
      success: true,
      data: module,
    });
  } catch (error) {
    next(error);
  }
};

// Update module
export const updateModule = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { moduleId } = req.params;
    const { title, description, position } = req.body;

    let module = await Module.findByPk(moduleId, {
      include: [{ model: Course }],
    });

    if (!module) {
      return res.status(404).json({
        success: false,
        message: "Module not found",
      });
    }

    // Check if user is authorized to update this module
    if (
      module.Course.instructorId !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this module",
      });
    }

    // Update module
    module = await module.update({
      title: title || module.title,
      description: description !== undefined ? description : module.description,
      position: position !== undefined ? position : module.position,
    });

    res.status(200).json({
      success: true,
      data: module,
    });
  } catch (error) {
    next(error);
  }
};

// Delete module
export const deleteModule = async (req, res, next) => {
  try {
    const { moduleId } = req.params;

    const module = await Module.findByPk(moduleId, {
      include: [{ model: Course }],
    });

    if (!module) {
      return res.status(404).json({
        success: false,
        message: "Module not found",
      });
    }

    // Check if user is authorized to delete this module
    if (
      module.Course.instructorId !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this module",
      });
    }

    await module.destroy();

    res.status(200).json({
      success: true,
      message: "Module deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getModulesByCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    // Get course to check access permissions
    const course = await Course.findByPk(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Determine what data to include
    let includeOptions = [];

    // Different include options based on whether it's for a preview or not
    if (req.query.preview === "true") {
      // For preview mode, include limited lesson information
      includeOptions = [
        {
          model: Lesson,
          attributes: ["id", "title", "type", "duration"],
        },
      ];
    } else {
      // Full information for authenticated users
      includeOptions = [
        {
          model: Lesson,
          include: req.user ? [
            {
              model: LessonProgress,
              where: { userId: req.user.id },
              required: false,
            },
          ] : [],
        },
        {
          model: ModuleProgress,
          where: req.user ? { userId: req.user.id } : null,
          required: false,
        },
      ];
    }

    // Get modules with appropriate includes
    const modules = await Module.findAll({
      where: { courseId },
      include: includeOptions,
      order: [
        ["position", "ASC"],
        [Lesson, "position", "ASC"],
      ],
    });

    // Calculate additional information for preview mode
    if (req.query.preview === "true") {
      modules.forEach((module) => {
        if (module.Lessons) {
          module.dataValues.lessonCount = module.Lessons.length;
          module.dataValues.totalDuration = module.Lessons.reduce(
            (sum, lesson) => sum + (lesson.duration || 0),
            0
          );
        }
      });
    }

    res.status(200).json({
      success: true,
      count: modules.length,
      data: modules,
    });
  } catch (error) {
    next(error);
  }
};

export const getPublicModulesByCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    // Get course to check if it's published and approved
    const course = await Course.findOne({
      where: { 
        id: courseId,
        isPublished: true,
        isApproved: true
      }
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Include limited lesson information for preview
    const modules = await Module.findAll({
      where: { courseId },
      include: [
        {
          model: Lesson,
          attributes: ["id", "title", "type", "duration"],
        },
      ],
      order: [
        ['position', 'ASC'], 
        [Lesson, 'position', 'ASC']
      ]
    });

    // Calculate total duration for each module
    const modulesWithDuration = modules.map(module => {
      const moduleData = module.toJSON();
      // Check if lessons array exists before calling reduce
      moduleData.totalDuration = moduleData.lessons && moduleData.lessons.length > 0
        ? moduleData.lessons.reduce((total, lesson) => total + (lesson.duration || 0), 0)
        : 0;
      return moduleData;
    });

    res.status(200).json({
      success: true,
      data: modulesWithDuration,
    });
  } catch (error) {
    next(error);
  }
};