import { validationResult } from "express-validator";
import db from "../models/index.js";
import sequelize from "../config/db.js";
import { Op } from "sequelize";
import path from "path";
import fs from "fs";

const { Course, Module, Lesson, User, Enrollment, Quiz, Question, Option } = db;

// Helper function to build thumbnail URL
const getThumbnailUrl = (req, filename) => {
  if (!filename) return null;
  // Ensure the path starts with /uploads/thumbnails/
  const relativePath = path.join(
    "uploads",
    "thumbnails",
    path.basename(filename)
  );
  // Replace backslashes with forward slashes for URL compatibility
  const urlPath = relativePath.replace(/\\/g, "/");
  return `${req.protocol}://${req.get("host")}/${urlPath}`;
};

// Helper function to delete thumbnail file
const deleteThumbnailFile = (filename) => {
  if (filename) {
    const filePath = path.join(
      process.cwd(),
      "uploads",
      "thumbnails",
      path.basename(filename)
    );
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        console.log(`Deleted thumbnail file: ${filePath}`);
      } catch (err) {
        console.error(`Error deleting thumbnail file ${filePath}:`, err);
      }
    }
  }
};

// Get all courses
export const getAllCourses = async (req, res, next) => {
  try {
    // Extract query parameters
    const { search, category, level } = req.query;

    // Build conditions
    let whereConditions = {};

    // Handle search
    if (search) {
      whereConditions = {
        ...whereConditions,
        [Op.or]: [
          { title: { [Op.like]: `%${search}%` } },
          { description: { [Op.like]: `%${search}%` } },
        ],
      };
    }

    // Apply category filter
    if (category) {
      whereConditions.category = category;
    }

    // Apply level filter
    if (level) {
      whereConditions.level = level;
    }

    console.log("Query conditions:", JSON.stringify(whereConditions, null, 2));

    // Fetch courses
    const courses = await Course.findAll({
      where: whereConditions,
      include: [
        {
          model: User,
          as: "instructor",
          attributes: ["id", "name"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    // Add thumbnail URL to each course
    const coursesWithUrls = courses.map((course) => {
      const courseJson = course.toJSON();
      courseJson.thumbnailUrl = getThumbnailUrl(req, courseJson.thumbnail);
      return courseJson;
    });

    res.status(200).json({
      success: true,
      count: coursesWithUrls.length,
      data: coursesWithUrls, // Send data with URLs
    });
  } catch (error) {
    console.error("Error in getAllCourses:", error);
    next(error);
  }
};

// Get single course
export const getCourse = async (req, res, next) => {
  try {
    const { id } = req.params;

    const course = await Course.findByPk(id, {
      include: [
        {
          model: User,
          as: "instructor",
          attributes: ["id", "name", "email", "profileImage", "bio"],
        },
        {
          model: Quiz,
          as: "preTestQuiz",
          attributes: ["id", "title", "description"],
        },
        {
          model: Quiz,
          as: "postTestQuiz",
          attributes: ["id", "title", "description"],
        },
      ],
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Add thumbnail URL
    const courseJson = course.toJSON();
    courseJson.thumbnailUrl = getThumbnailUrl(req, courseJson.thumbnail);

    res.status(200).json({
      success: true,
      data: courseJson,
    });
  } catch (error) {
    next(error);
  }
};

// Create new course - Only instructors can create courses
export const createCourse = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      if (req.file) {
        deleteThumbnailFile(req.file.filename);
      }
      return res.status(400).json({ errors: errors.array() });
    }

    // Only instructors can create courses
    if (req.user.role !== "instructor") {
      // If authorization fails, delete uploaded file if it exists
      if (req.file) {
        deleteThumbnailFile(req.file.filename);
      }
      return res.status(403).json({
        success: false,
        message: "Only instructors can create courses",
      });
    }

    const transaction = await sequelize.transaction();

    try {
      const courseData = { ...req.body };
      courseData.instructorId = req.user.id;
      courseData.isPublished = true; // Or based on your logic
      courseData.isApproved = true; // Or based on your logic
      courseData.approvedBy = req.user.id; // Or based on your logic

      // Add thumbnail filename if uploaded
      if (req.file) {
        courseData.thumbnail = req.file.filename; // Store only the filename
      } else {
        courseData.thumbnail = null; // Explicitly set to null if no file
      }

      // Create the course first
      const course = await Course.create(courseData, { transaction });
      const courseId = course.id;

      await transaction.commit();

      try {
        const createdCourse = await Course.findByPk(courseId, {
          include: [
            { model: User, as: "instructor", attributes: ["id", "name"] },
          ],
        });

        // Add thumbnail URL to the response
        const courseJson = createdCourse.toJSON();
        courseJson.thumbnailUrl = getThumbnailUrl(req, courseJson.thumbnail);

        res.status(201).json({
          success: true,
          data: courseJson,
        });
      } catch (error) {
        console.error(
          "Error fetching complete course data after creation:",
          error
        );
        // Even if fetching fails, return basic info + URL if possible
        const basicData = {
          id: courseId,
          thumbnailUrl: getThumbnailUrl(req, courseData.thumbnail),
        };
        res.status(201).json({
          success: true,
          data: basicData,
          message: "Course created, but full data retrieval failed.",
        });
      }
    } catch (error) {
      await transaction.rollback();
      // If transaction fails, delete uploaded file if it exists
      if (req.file) {
        deleteThumbnailFile(req.file.filename);
      }
      throw error; // Re-throw error to be caught by the outer catch
    }
  } catch (error) {
    console.error("Error in createCourse:", error);
    // Ensure file is deleted on any error during creation process
    if (req.file) {
      deleteThumbnailFile(req.file.filename);
    }
    next(error);
  }
};

// Update course
export const updateCourse = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // If validation fails, delete newly uploaded file if it exists
      if (req.file) {
        deleteThumbnailFile(req.file.filename);
      }
      return res.status(400).json({ errors: errors.array() });
    }

    const course = await Course.findByPk(req.params.id);

    if (!course) {
      // If course not found, delete newly uploaded file if it exists
      if (req.file) {
        deleteThumbnailFile(req.file.filename);
      }
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }
    // Check ownership
    if (course.instructorId !== req.user.id) {
      // If not authorized, delete newly uploaded file if it exists
      if (req.file) {
        deleteThumbnailFile(req.file.filename);
      }
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this course",
      });
    }

    const updateData = { ...req.body };
    const oldThumbnail = course.thumbnail;
    let newThumbnail = null;

    // Handle thumbnail update
    if (req.file) {
      // New file uploaded, store its name
      newThumbnail = req.file.filename;
      updateData.thumbnail = newThumbnail;
    } else if (updateData.removeThumbnail === "true") {
      // User explicitly wants to remove the thumbnail
      updateData.thumbnail = null;
    } else {
      // No new file and no removal request, keep the old thumbnail
      // We delete the thumbnail key from updateData to avoid overwriting it with undefined
      delete updateData.thumbnail;
    }
    // Remove the helper flag from the data to be saved
    delete updateData.removeThumbnail;
    delete updateData.instructorId; // Don't allow changing instructor

    const updatedCourse = await course.update(updateData);

    if (oldThumbnail && (newThumbnail || updateData.thumbnail === null)) {
      deleteThumbnailFile(oldThumbnail);
    }

    // Add thumbnail URL to response
    const courseJson = updatedCourse.toJSON();
    courseJson.thumbnailUrl = getThumbnailUrl(req, courseJson.thumbnail);

    res.status(200).json({
      success: true,
      data: courseJson,
    });
  } catch (error) {
    // If update fails, delete the newly uploaded file if it exists
    if (req.file) {
      deleteThumbnailFile(req.file.filename);
    }
    console.error("Error updating course:", error);
    next(error);
  }
};

// Delete course
export const deleteCourse = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  let courseThumbnail = null;

  try {
    const course = await Course.findByPk(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Check ownership
    if (course.instructorId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this course",
      });
    }

    courseThumbnail = course.thumbnail;

    // Before deleting the course, clear the quiz references
    await course.update(
      {
        preTestQuizId: null,
        postTestQuizId: null,
      },
      { transaction }
    );

    // Now delete the associated quizzes if they exist
    if (course.preTestQuizId) {
      await Quiz.destroy({
        where: { id: course.preTestQuizId },
        transaction,
      });
    }

    if (course.postTestQuizId) {
      await Quiz.destroy({
        where: { id: course.postTestQuizId },
        transaction,
      });
    }

    // Finally delete the course
    await course.destroy({ transaction });

    await transaction.commit();

    if (courseThumbnail) {
      deleteThumbnailFile(courseThumbnail);
    }

    res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error deleting course:", error);
    next(error);
  }
};

// Get instructor courses
export const getInstructorCourses = async (req, res, next) => {
  try {
    const courses = await Course.findAll({
      where: { instructorId: req.user.id },
      include: [
        {
          model: Module,
          attributes: ["id", "title"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    // Add thumbnail URL
     const coursesWithUrls = courses.map(course => {
        const courseJson = course.toJSON();
        courseJson.thumbnailUrl = getThumbnailUrl(req, courseJson.thumbnail);
        return courseJson;
    });

    res.status(200).json({
      success: true,
      count: coursesWithUrls.length,
      data: coursesWithUrls,
    });
  } catch (error) {
    next(error);
  }
};

// Get featured courses
export const getFeaturedCourses = async (req, res, next) => {
  try {
    // Using a subquery approach to count enrollments instead of group + order
    const courses = await Course.findAll({
      include: [
        {
          model: User,
          as: "instructor",
          attributes: ["id", "name"],
        },
      ],
      attributes: [
        "id",
        "title",
        "description",
        "thumbnail",
        "category",
        "level",
        "createdAt",
        [
          sequelize.literal(
            "(SELECT COUNT(*) FROM Enrollments WHERE Enrollments.courseId = Course.id)"
          ),
          "enrollmentsCount",
        ],
      ],
      order: [[sequelize.literal("enrollmentsCount"), "DESC"]],
      limit: 10,
    });

    // Format the data for response
    const formattedCourses = courses.map((course) => {
      const courseData = course.toJSON();
      return {
        id: course.id,
        title: course.title,
        description: course.description,
        thumbnailUrl: getThumbnailUrl(req, courseData.thumbnail), // Generate URL
        category: course.category,
        level: course.level,
        instructorName: course.instructor?.name,
        enrollmentsCount: parseInt(courseData.enrollmentsCount || 0),
      };
    });

    res.status(200).json({
      success: true,
      count: formattedCourses.length,
      data: formattedCourses,
    });
  } catch (error) {
    next(error);
  }
};

export const createCourseTests = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { title, description, questions } = req.body;

    // Validate input
    if (
      !title ||
      !questions ||
      !Array.isArray(questions) ||
      questions.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide test title and at least one question",
      });
    }

    // Verify the course exists and user has permission
    const course = await Course.findByPk(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Check ownership
    if (course.instructorId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this course",
      });
    }

    const transaction = await sequelize.transaction();

    try {
      // Create pre-test quiz
      const preTest = await Quiz.create(
        {
          title: `${title} (Pre-test)`,
          description: description || `Pre-test for ${course.title}`,
          courseId: course.id,
          moduleId: null, // Not associated with specific module
          status: "published",
          createdBy: req.user.id,
          type: "pre-test",
        },
        { transaction }
      );

      // Create post-test quiz with same structure
      const postTest = await Quiz.create(
        {
          title: `${title} (Post-test)`,
          description: description || `Post-test for ${course.title}`,
          courseId: course.id,
          moduleId: null, // Not associated with specific module
          status: "published",
          createdBy: req.user.id,
          type: "post-test",
        },
        { transaction }
      );

      // Process questions for both tests
      for (const questionData of questions) {
        // Validate question data
        if (
          !questionData.text ||
          !questionData.options ||
          !Array.isArray(questionData.options)
        ) {
          throw new Error("Invalid question format");
        }

        // Create the same question for pre-test
        const preQuestion = await Question.create(
          {
            quizId: preTest.id,
            text: questionData.text,
            type: questionData.type || "multiple-choice",
            points: questionData.points || 1,
            position: questionData.position,
          },
          { transaction }
        );

        // Create the same question for post-test
        const postQuestion = await Question.create(
          {
            quizId: postTest.id,
            text: questionData.text,
            type: questionData.type || "multiple-choice",
            points: questionData.points || 1,
            position: questionData.position,
          },
          { transaction }
        );

        // Create options for each question
        for (const optionData of questionData.options) {
          // Create option for pre-test question
          await Option.create(
            {
              questionId: preQuestion.id,
              text: optionData.text,
              isCorrect: optionData.isCorrect || false,
            },
            { transaction }
          );

          // Create identical option for post-test question
          await Option.create(
            {
              questionId: postQuestion.id,
              text: optionData.text,
              isCorrect: optionData.isCorrect || false,
            },
            { transaction }
          );
        }
      }

      // Update course with test references
      await course.update(
        {
          preTestQuizId: preTest.id,
          postTestQuizId: postTest.id,
          requirePreTest: true,
        },
        { transaction }
      );

      await transaction.commit();

      res.status(201).json({
        success: true,
        data: {
          preTest: { id: preTest.id, title: preTest.title },
          postTest: { id: postTest.id, title: postTest.title },
          message: "Course tests created successfully",
        },
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error("Error creating course tests:", error);
    next(error);
  }
};

export const updateCoursePrePostTests = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { title, description, questions } = req.body;

    // Validate input
    if (!questions || !Array.isArray(questions)) {
      return res.status(400).json({
        success: false,
        message: "Please provide questions array",
      });
    }

    // Get the course
    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Check if course has pre/post tests
    if (!course.preTestQuizId || !course.postTestQuizId) {
      return res.status(400).json({
        success: false,
        message: "Course doesn't have pre/post tests. Create them first.",
      });
    }

    // Check ownership
    if (course.instructorId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this course",
      });
    }

    const transaction = await sequelize.transaction();

    try {
      // Get pre and post test quizzes
      const preTest = await Quiz.findByPk(course.preTestQuizId);
      const postTest = await Quiz.findByPk(course.postTestQuizId);

      if (!preTest || !postTest) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: "Pre-test or post-test quiz not found",
        });
      }

      // Update quiz titles and descriptions if provided
      if (title || description) {
        await preTest.update(
          {
            title: title ? `${title} (Pre-test)` : preTest.title,
            description: description || preTest.description,
          },
          { transaction }
        );

        await postTest.update(
          {
            title: title ? `${title} (Post-test)` : postTest.title,
            description: description || postTest.description,
          },
          { transaction }
        );
      }

      // Delete existing questions and options
      const preQuestions = await Question.findAll({
        where: { quizId: preTest.id },
      });
      const postQuestions = await Question.findAll({
        where: { quizId: postTest.id },
      });

      // Delete all options for each question
      for (const question of [...preQuestions, ...postQuestions]) {
        await Option.destroy({
          where: { questionId: question.id },
          transaction,
        });
      }

      // Delete the questions themselves
      await Question.destroy({ where: { quizId: preTest.id }, transaction });
      await Question.destroy({ where: { quizId: postTest.id }, transaction });

      // Create new questions and options
      for (const questionData of questions) {
        // Create the same question for pre-test
        const preQuestion = await Question.create(
          {
            quizId: preTest.id,
            text: questionData.text,
            type: questionData.type || "multiple-choice",
            points: questionData.points || 1,
            position: questionData.position,
          },
          { transaction }
        );

        // Create the same question for post-test
        const postQuestion = await Question.create(
          {
            quizId: postTest.id,
            text: questionData.text,
            type: questionData.type || "multiple-choice",
            points: questionData.points || 1,
            position: questionData.position,
          },
          { transaction }
        );

        // Create options for each question
        for (const optionData of questionData.options) {
          // Create option for pre-test question
          await Option.create(
            {
              questionId: preQuestion.id,
              text: optionData.text,
              isCorrect: optionData.isCorrect || false,
            },
            { transaction }
          );

          // Create identical option for post-test question
          await Option.create(
            {
              questionId: postQuestion.id,
              text: optionData.text,
              isCorrect: optionData.isCorrect || false,
            },
            { transaction }
          );
        }
      }

      await transaction.commit();

      res.status(200).json({
        success: true,
        message: "Course tests updated successfully",
        data: {
          preTestId: preTest.id,
          postTestId: postTest.id,
        },
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error("Error updating course tests:", error);
    next(error);
  }
};

// Get course tests with questions and options
export const getCourseTestsWithQuestions = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    // Get the course
    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Check if we have pre/post tests
    if (!course.preTestQuizId) {
      return res.status(200).json({
        success: true,
        data: {
          hasTests: false,
          message: "Course does not have pre/post tests",
        },
      });
    }

    // Check authorization
    const isInstructor = course.instructorId === req.user.id;
    const isAdmin = req.user.role === "admin";
    const isStudent = await Enrollment.findOne({
      where: { courseId: course.id, userId: req.user.id },
    });

    if (!isInstructor && !isAdmin && !isStudent) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view these tests",
      });
    }

    // Get preTest with full question and option data
    const preTest = await Quiz.findByPk(course.preTestQuizId, {
      include: [
        {
          model: Question,
          include: [
            {
              model: Option,
              // Only show which options are correct to instructors/admins
              attributes: isStudent
                ? ["id", "text"]
                : ["id", "text", "isCorrect"],
            },
          ],
        },
      ],
    });

    // Get postTest with full question and option data
    const postTest = await Quiz.findByPk(course.postTestQuizId, {
      include: [
        {
          model: Question,
          include: [
            {
              model: Option,
              // Only show which options are correct to instructors/admins
              attributes: isStudent
                ? ["id", "text"]
                : ["id", "text", "isCorrect"],
            },
          ],
        },
      ],
    });

    res.status(200).json({
      success: true,
      data: {
        hasTests: true,
        requirePreTest: course.requirePreTest,
        preTest,
        postTest,
      },
    });
  } catch (error) {
    console.error("Error fetching course tests:", error);
    next(error);
  }
};

// Update course pre/post test settings
export const updateCourseTests = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { requirePreTest, preTestQuizId, postTestQuizId } = req.body;

    // Find the course
    const course = await Course.findByPk(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Check ownership
    if (course.instructorId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this course",
      });
    }

    // Update test settings
    await course.update({
      requirePreTest:
        requirePreTest !== undefined ? requirePreTest : course.requirePreTest,
      preTestQuizId: preTestQuizId || course.preTestQuizId,
      postTestQuizId: postTestQuizId || course.postTestQuizId,
    });

    res.status(200).json({
      success: true,
      data: course,
    });
  } catch (error) {
    next(error);
  }
};

// Get course pre/post test settings
export const getCourseTests = async (req, res, next) => {
  try {
    const { id } = req.params;

    const course = await Course.findByPk(id, {
      include: [
        {
          model: Quiz,
          as: "preTestQuiz",
          attributes: ["id", "title", "description", "status"],
        },
        {
          model: Quiz,
          as: "postTestQuiz",
          attributes: ["id", "title", "description", "status"],
        },
      ],
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        requirePreTest: course.requirePreTest,
        preTestQuiz: course.preTestQuiz,
        postTestQuiz: course.postTestQuiz,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCourseTests = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    // Find the course and make sure it exists
    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Check if user is authorized (course creator or admin)
    if (course.instructorId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete tests for this course",
      });
    }

    const transaction = await sequelize.transaction();

    try {
      // Store IDs for deletion
      const preTestId = course.preTestQuizId;
      const postTestId = course.postTestQuizId;

      // Update course to remove test references
      await course.update(
        {
          preTestQuizId: null,
          postTestQuizId: null,
          requirePreTest: false,
        },
        { transaction }
      );

      // Delete the quizzes if they exist
      if (preTestId) {
        await Quiz.destroy({
          where: { id: preTestId },
          transaction,
        });
      }

      if (postTestId) {
        await Quiz.destroy({
          where: { id: postTestId },
          transaction,
        });
      }

      await transaction.commit();

      res.status(200).json({
        success: true,
        message: "Course tests deleted successfully",
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error("Error deleting course tests:", error);
    next(error);
  }
};

// Get a single course - Public access version for course preview
export const getPublicCourse = async (req, res, next) => {
  try {
    const { id } = req.params;

    const course = await Course.findOne({
      where: {
        id,
        isPublished: true,
        isApproved: true,
      },
      include: [
        {
          model: User,
          as: "instructor",
          attributes: ["id", "name"],
        },
        // Exclude sensitive information or test-related data for public view
      ],
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    res.status(200).json({
      success: true,
      data: course,
    });
  } catch (error) {
    next(error);
  }
};
