import db from '../models/index.js';
import { Op } from 'sequelize';
import { 
  getCourseStatistics, 
  getLessonStatistics, 
  getUserLearningStatistics 
} from '../utils/analyticsHelper.js';

const { Course, User, Enrollment, LessonProgress, QuizAttempt, Answer, Question, Option, Quiz} = db;

// Mendapatkan statistik kursus (untuk instructor)
export const getCourseAnalytics = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    
    // Cek apakah kursus ada
    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    // Cek apakah user adalah instructor atau admin
    if (req.user.role !== 'admin' && course.instructorId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this course analytics'
      });
    }
    
    const statistics = await getCourseStatistics(courseId);
    
    res.status(200).json({
      success: true,
      data: statistics
    });
  } catch (error) {
    next(error);
  }
};

// Mendapatkan statistik lesson (untuk instructor)
export const getLessonAnalytics = async (req, res, next) => {
  try {
    const { lessonId } = req.params;
    
    const statistics = await getLessonStatistics(lessonId);
    
    // Cek apakah user adalah instructor atau admin
    const course = await Course.findByPk(statistics.courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    if (req.user.role !== 'admin' && course.instructorId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this lesson analytics'
      });
    }
    
    res.status(200).json({
      success: true,
      data: statistics
    });
  } catch (error) {
    next(error);
  }
};

// Mendapatkan statistik pembelajaran user (untuk learner)
export const getUserAnalytics = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const statistics = await getUserLearningStatistics(userId);
    
    res.status(200).json({
      success: true,
      data: statistics
    });
  } catch (error) {
    next(error);
  }
};

// Mendapatkan statistik platform (untuk admin)
export const getPlatformAnalytics = async (req, res, next) => {
  try {
    // Cek apakah user adalah admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access platform analytics'
      });
    }
    
    // Get the timeframe parameter (if provided)
    const { timeframe = '30days' } = req.query;
    
    // Calculate the date based on timeframe
    const startDate = new Date();
    switch(timeframe) {
      case '7days':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '90days':
        startDate.setDate(startDate.getDate() - 90);
        break;
      case 'all':
        startDate.setFullYear(2000); // Set to a very old date to get all data
        break;
      default: // '30days' is default
        startDate.setDate(startDate.getDate() - 30);
    }
    
    // Total users
    const totalUsers = await User.count();
    
    // Users by role
    const learners = await User.count({ where: { role: 'learner' } });
    const instructors = await User.count({ where: { role: 'instructor' } });
    const admins = await User.count({ where: { role: 'admin' } });
    
    // Total courses
    const totalCourses = await Course.count();
    
    // Total enrollments
    const totalEnrollments = await Enrollment.count();

    // Calculate active users in the last 7 days (for the dashboard)
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    const activeUsersLastWeek = await LessonProgress.count({
      distinct: true,
      col: 'userId',
      where: {
        lastAccessedAt: {
          [Op.gte]: lastWeek
        }
      }
    });
    
    // New users in the selected timeframe
    const newUsers = await User.count({
      where: {
        createdAt: {
          [Op.gte]: startDate
        }
      }
    });
    
    // New enrollments in the selected timeframe
    const newEnrollments = await Enrollment.count({
      where: {
        createdAt: {
          [Op.gte]: startDate
        }
      }
    });
    
    // Course completions in the selected timeframe
    const courseCompletions = await Enrollment.count({
      where: {
        isCompleted: true,
        updatedAt: {
          [Op.gte]: startDate
        }
      }
    });
    
    // Calculate average completion rate
    const enrollmentsInTimeframe = await Enrollment.findAll({
      where: {
        createdAt: {
          [Op.gte]: startDate
        }
      },
      attributes: ['progress']
    });
    
    const avgCompletionRate = enrollmentsInTimeframe.length > 0
      ? Math.round(enrollmentsInTimeframe.reduce((sum, item) => sum + item.progress, 0) / enrollmentsInTimeframe.length)
      : 0;
    
    // Active users in the selected timeframe
    const activeUsers = await LessonProgress.count({
      distinct: true,
      col: 'userId',
      where: {
        lastAccessedAt: {
          [Op.gte]: startDate
        }
      }
    });
    // NEWS STATISTICS
    const { News } = db;
    // Total news articles
    const totalNewsArticles = await News.count();
    
    // Published news articles
    const publishedNewsArticles = await News.count({
      where: { isPublished: true }
    });
    
    // FORUM STATISTICS
    const { ForumCategory, ForumTopic, ForumPost } = db;
    
    // Total forum categories
    const forumCategories = await ForumCategory.count();
    
    // Total forum topics
    const forumTopics = await ForumTopic.count();
    
    // Total forum posts
    const forumPosts = await ForumPost.count();
    
    // Active forum topics (topics with at least one post in the last 7 days)
    const activeForumTopics = await ForumTopic.count({
      include: [{
        model: ForumPost,
        required: true,
        where: {
          createdAt: {
            [Op.gte]: lastWeek
          }
        }
      }]
    });
    
    // Forum posts in the last 7 days
    const forumPostsThisWeek = await ForumPost.count({
      where: {
        createdAt: {
          [Op.gte]: lastWeek
        }
      }
    });
    
    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        usersByRole: {
          learners,
          instructors,
          admins
        },
        totalCourses,
        totalEnrollments,
        activeUsers,
        activeUsersLastWeek,
        newUsers,
        newEnrollments,
        courseCompletions,
        avgCompletionRate,
        // News stats
        totalNewsArticles,
        publishedNewsArticles,
        // Forum stats
        forumCategories,
        forumTopics,
        forumPosts,
        activeForumTopics,
        forumPostsThisWeek
      }
    });
  } catch (error) {
    console.error('Platform analytics error:', error);
    next(error);
  }
};

// Mendapatkan statistik kursus teratas (untuk admin)
export const getTopCourses = async (req, res, next) => {
  try {
    // Cek apakah user adalah admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access top courses analytics'
      });
    }
    
    // Get top courses by enrollment - using subquery approach
    const topEnrollments = await Course.findAll({
      attributes: [
        'id',
        'title',
        [db.sequelize.literal('(SELECT COUNT(*) FROM Enrollments WHERE Enrollments.courseId = Course.id)'), 'enrollmentCount']
      ],
      order: [[db.sequelize.literal('enrollmentCount'), 'DESC']],
      limit: 5
    });
    
    // Get top courses by completion rate - using subquery approach
    const topCompletionRates = await Course.findAll({
      attributes: [
        'id',
        'title',
        [db.sequelize.literal('(SELECT AVG(progress) FROM Enrollments WHERE Enrollments.courseId = Course.id)'), 'avgCompletionRate'],
        [db.sequelize.literal('(SELECT COUNT(*) FROM Enrollments WHERE Enrollments.courseId = Course.id)'), 'enrollmentCount']
      ],
      having: db.sequelize.literal('(SELECT COUNT(*) FROM Enrollments WHERE Enrollments.courseId = Course.id) >= 5'),
      order: [[db.sequelize.literal('avgCompletionRate'), 'DESC']],
      limit: 5
    });
    
    // Format the data
    const formattedTopEnrollments = topEnrollments.map(course => {
      const rawCourse = course.toJSON();
      return {
        id: course.id,
        title: course.title,
        count: parseInt(rawCourse.enrollmentCount || 0)
      };
    });
    
    const formattedTopCompletionRates = topCompletionRates.map(course => {
      const rawCourse = course.toJSON();
      return {
        id: course.id,
        title: course.title,
        rate: Math.round(parseFloat(rawCourse.avgCompletionRate || 0)),
        count: parseInt(rawCourse.enrollmentCount || 0)
      };
    });
    
    res.status(200).json({
      success: true,
      data: {
        topEnrollments: formattedTopEnrollments,
        topCompletionRates: formattedTopCompletionRates
      }
    });
  } catch (error) {
    console.error('Top courses analytics error:', error);
    next(error);
  }
};

// Get instructor dashboard data
export const getInstructorDashboard = async (req, res, next) => {
  try {
    const instructorId = req.user.id;
    
    // Get instructor's courses
    const courses = await Course.findAll({
      where: { instructorId },
      attributes: ['id', 'title', 'isPublished', 'createdAt'],
      include: [
        {
          model: Enrollment,
          attributes: ['id', 'progress', 'isCompleted']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: 10
    });

    // Format courses with enrollment count
    const formattedCourses = courses.map(course => ({
      id: course.id,
      title: course.title,
      isPublished: course.isPublished,
      createdAt: course.createdAt,
      enrollments: course.Enrollments.length
    }));
    
    // Calculate total students across all instructor's courses - use sequelize syntax
    const studentsCount = await db.sequelize.query(
      `SELECT COUNT(DISTINCT \`userId\`) as count 
       FROM \`Enrollments\` 
       INNER JOIN \`Courses\` ON \`Enrollments\`.\`courseId\` = \`Courses\`.\`id\` 
       WHERE \`Courses\`.\`instructorId\` = ?`,
      {
        replacements: [instructorId],
        type: db.sequelize.QueryTypes.SELECT
      }
    );
    const totalStudents = studentsCount[0]?.count || 0;
    
    // Get total courses and published courses count
    const totalCourses = courses.length;
    const publishedCourses = courses.filter(course => course.isPublished).length;
    
    // Calculate total enrollments - use raw query for more reliability
    const enrollmentsCount = await db.sequelize.query(
      `SELECT COUNT(*) as count 
       FROM \`Enrollments\` 
       INNER JOIN \`Courses\` ON \`Enrollments\`.\`courseId\` = \`Courses\`.\`id\` 
       WHERE \`Courses\`.\`instructorId\` = ?`,
      {
        replacements: [instructorId],
        type: db.sequelize.QueryTypes.SELECT
      }
    );
    const totalEnrollments = enrollmentsCount[0]?.count || 0;
    
    // Calculate completion rate - use raw query
    const completedEnrollmentsCount = await db.sequelize.query(
      `SELECT COUNT(*) as count 
       FROM \`Enrollments\` 
       INNER JOIN \`Courses\` ON \`Enrollments\`.\`courseId\` = \`Courses\`.\`id\` 
       WHERE \`Courses\`.\`instructorId\` = ? AND \`Enrollments\`.\`isCompleted\` = true AND \`Enrollments\`.\`progress\` = 100`,
      {
        replacements: [instructorId],
        type: db.sequelize.QueryTypes.SELECT
      }
    );
    const completedEnrollments = completedEnrollmentsCount[0]?.count || 0;
    
    const completionRate = totalEnrollments > 0 
      ? Math.round((completedEnrollments / totalEnrollments) * 100) 
      : 0;
    
    // Get popular courses - use raw query for accurate counting
    const popularCoursesQuery = await db.sequelize.query(
      `SELECT \`Courses\`.\`id\`, \`Courses\`.\`title\`, COUNT(\`Enrollments\`.\`id\`) as enrollment_count
       FROM \`Courses\`
       LEFT JOIN \`Enrollments\` ON \`Courses\`.\`id\` = \`Enrollments\`.\`courseId\`
       WHERE \`Courses\`.\`instructorId\` = ?
       GROUP BY \`Courses\`.\`id\`, \`Courses\`.\`title\`
       ORDER BY enrollment_count DESC
       LIMIT 5`,
      {
        replacements: [instructorId],
        type: db.sequelize.QueryTypes.SELECT
      }
    );
    
    const formattedPopularCourses = popularCoursesQuery.map(course => ({
      id: course.id,
      title: course.title,
      enrollments: parseInt(course.enrollment_count || 0)
    }));
    
    // Get courses with low completion rates
    const coursesWithProgressQuery = await db.sequelize.query(
      `SELECT \`Courses\`.\`id\`, \`Courses\`.\`title\`, AVG(\`Enrollments\`.\`progress\`) as avg_progress, COUNT(\`Enrollments\`.\`id\`) as enrollment_count
       FROM \`Courses\`
       LEFT JOIN \`Enrollments\` ON \`Courses\`.\`id\` = \`Enrollments\`.\`courseId\`
       WHERE \`Courses\`.\`instructorId\` = ?
       GROUP BY \`Courses\`.\`id\`, \`Courses\`.\`title\`
       HAVING COUNT(\`Enrollments\`.\`id\`) > 0
       ORDER BY avg_progress ASC
       LIMIT 5`,
      {
        replacements: [instructorId],
        type: db.sequelize.QueryTypes.SELECT
      }
    );
    
    const lowCompletionCourses = coursesWithProgressQuery.map(course => ({
      id: course.id,
      title: course.title,
      completionRate: Math.round(parseFloat(course.avg_progress || 0))
    }));
    
    // Get recent activities
    const recentActivities = [];
    
    // Recent enrollments - use join in raw query
    const recentEnrollmentsQuery = await db.sequelize.query(
      `SELECT \`Enrollments\`.\`id\`, \`Enrollments\`.\`createdAt\`, \`Courses\`.\`title\` as course_title, \`Users\`.\`name\` as user_name
       FROM \`Enrollments\`
       INNER JOIN \`Courses\` ON \`Enrollments\`.\`courseId\` = \`Courses\`.\`id\`
       INNER JOIN \`Users\` ON \`Enrollments\`.\`userId\` = \`Users\`.\`id\`
       WHERE \`Courses\`.\`instructorId\` = ?
       ORDER BY \`Enrollments\`.\`createdAt\` DESC
       LIMIT 5`,
      {
        replacements: [instructorId],
        type: db.sequelize.QueryTypes.SELECT
      }
    );
    
    recentEnrollmentsQuery.forEach(enrollment => {
      recentActivities.push({
        type: 'enrollment',
        message: `${enrollment.user_name} enrolled in "${enrollment.course_title}"`,
        time: enrollment.createdAt.toISOString(),
        timestamp: enrollment.createdAt
      });
    });
    
    // Recent course completions - use join in raw query
    const recentCompletionsQuery = await db.sequelize.query(
      `SELECT \`Enrollments\`.\`id\`, \`Enrollments\`.\`updatedAt\`, \`Courses\`.\`title\` as course_title, \`Users\`.\`name\` as user_name
       FROM \`Enrollments\`
       INNER JOIN \`Courses\` ON \`Enrollments\`.\`courseId\` = \`Courses\`.\`id\`
       INNER JOIN \`Users\` ON \`Enrollments\`.\`userId\` = \`Users\`.\`id\`
       WHERE \`Courses\`.\`instructorId\` = ? AND \`Enrollments\`.\`isCompleted\` = true AND \`Enrollments\`.\`progress\` = 100
       ORDER BY \`Enrollments\`.\`updatedAt\` DESC
       LIMIT 5`,
      {
        replacements: [instructorId],
        type: db.sequelize.QueryTypes.SELECT
      }
    );
    
    recentCompletionsQuery.forEach(completion => {
      recentActivities.push({
        type: 'completion',
        message: `${completion.user_name} completed "${completion.course_title}"`,
        time: completion.updatedAt.toISOString(),
        timestamp: completion.updatedAt
      });
    });
    
    // Rest of the function remains unchanged
    const sortedActivities = recentActivities
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10)
      .map(activity => {
        // Format time as relative (e.g., "2 days ago")
        const activityDate = new Date(activity.timestamp);
        const now = new Date();
        const diffTime = Math.abs(now - activityDate);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        
        let formattedTime;
        if (diffDays > 0) {
          formattedTime = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        } else if (diffHours > 0) {
          formattedTime = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        } else if (diffMinutes > 0) {
          formattedTime = `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
        } else {
          formattedTime = 'Just now';
        }
        
        return {
          ...activity,
          time: formattedTime
        };
      });
    
    res.status(200).json({
      success: true,
      data: {
        courses: formattedCourses,
        stats: {
          totalStudents,
          totalCourses,
          publishedCourses,
          totalEnrollments,
          completionRate,
          averageRating: 0 // Not implemented in this version
        },
        recentActivities: sortedActivities,
        popularCourses: formattedPopularCourses,
        lowCompletionCourses
      }
    });
  } catch (error) {
    console.error('Instructor dashboard error:', error);
    next(error);
  }
};

// Check if user can access course content based on pre-test completion
export const checkCourseAccessStatus = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;
    
    // Check if user is enrolled
    const enrollment = await Enrollment.findOne({
      where: {
        userId,
        courseId
      }
    });
    
    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: 'You must be enrolled in this course to access its content',
        canAccess: false
      });
    }
    
    // Get course with pre-test details
    const course = await Course.findByPk(courseId, {
      attributes: ['id', 'title', 'requirePreTest', 'preTestQuizId', 'postTestQuizId'],
    });
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
        canAccess: false
      });
    }
    
    // If pre-test is not required, learner can access course content
    if (!course.requirePreTest || !course.preTestQuizId) {
      return res.status(200).json({
        success: true,
        canAccess: true,
        preTestRequired: false,
        preTestCompleted: false,
        postTestAvailable: Boolean(course.postTestQuizId),
        postTestCompleted: false
      });
    }
    
    // Check if user completed pre-test
    let preTestAttempt = null;
    if (course.preTestQuizId) {
      preTestAttempt = await QuizAttempt.findOne({
        where: {
          quizId: course.preTestQuizId,
          userId,
          status: 'completed'
        },
        order: [['createdAt', 'DESC']]
      });
    }
    
    // Check if user completed post-test
    let postTestAttempt = null;
    if (course.postTestQuizId) {
      postTestAttempt = await QuizAttempt.findOne({
        where: {
          quizId: course.postTestQuizId,
          userId,
          status: 'completed'
        },
        order: [['createdAt', 'DESC']]
      });
    }
    
    // If pre-test is required and not completed, learner can't access course content
    const preTestCompleted = Boolean(preTestAttempt);
    const postTestCompleted = Boolean(postTestAttempt);
    
    res.status(200).json({
      success: true,
      canAccess: preTestCompleted || !course.requirePreTest,
      preTestRequired: course.requirePreTest,
      preTestCompleted,
      preTestId: course.preTestQuizId,
      preTestAttemptId: preTestAttempt?.id,
      preTestScore: preTestAttempt?.score,
      postTestAvailable: Boolean(course.postTestQuizId),
      postTestCompleted,
      postTestId: course.postTestQuizId,
      postTestAttemptId: postTestAttempt?.id,
      postTestScore: postTestAttempt?.score,
      courseProgress: enrollment.progress
    });
  } catch (error) {
    next(error);
  }
};


// Compare pre-test and post-test results for a user
export const compareTestResults = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;
    
    // Check if user is enrolled
    const enrollment = await Enrollment.findOne({
      where: {
        userId,
        courseId
      }
    });
    
    if (!enrollment && req.user.role === 'learner') {
      return res.status(403).json({
        success: false,
        message: 'You must be enrolled in this course to access test results'
      });
    }
    
    // Get course with pre-test and post-test details
    const course = await Course.findByPk(courseId, {
      attributes: ['id', 'title', 'preTestQuizId', 'postTestQuizId']
    });
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    if (!course.preTestQuizId || !course.postTestQuizId) {
      return res.status(400).json({
        success: false,
        message: 'This course does not have both pre-test and post-test configured'
      });
    }
    
    // Get user's latest pre-test attempt
    const preTestAttempt = await QuizAttempt.findOne({
      where: {
        quizId: course.preTestQuizId,
        userId,
        status: 'completed'
      },
      include: [
        {
          model: Answer,
          include: [
            { model: Question, include: [{ model: Option }] },
            { model: Option }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    // Get user's latest post-test attempt
    const postTestAttempt = await QuizAttempt.findOne({
      where: {
        quizId: course.postTestQuizId,
        userId,
        status: 'completed'
      },
      include: [
        {
          model: Answer,
          include: [
            { model: Question, include: [{ model: Option }] },
            { model: Option }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    if (!preTestAttempt || !postTestAttempt) {
      return res.status(400).json({
        success: false,
        message: 'Both pre-test and post-test must be completed to compare results',
        preTestCompleted: Boolean(preTestAttempt),
        postTestCompleted: Boolean(postTestAttempt)
      });
    }
    
    // Calculate improvement metrics
    const preTestScore = preTestAttempt.score || 0;
    const postTestScore = postTestAttempt.score || 0;
    const improvement = postTestScore - preTestScore;
    const improvementPercentage = preTestScore > 0 
      ? (improvement / preTestScore) * 100 
      : postTestScore > 0 ? 100 : 0;
    
    // Map questions and answers for comparison
    const preTestAnswers = preTestAttempt.Answers.reduce((acc, answer) => {
      acc[answer.Question.text] = {
        questionId: answer.questionId,
        text: answer.Question.text,
        isCorrect: answer.isCorrect,
        selectedOption: answer.Option?.text || answer.textAnswer,
        score: answer.score
      };
      return acc;
    }, {});
    
    const postTestAnswers = postTestAttempt.Answers.reduce((acc, answer) => {
      acc[answer.Question.text] = {
        questionId: answer.questionId,
        text: answer.Question.text,
        isCorrect: answer.isCorrect,
        selectedOption: answer.Option?.text || answer.textAnswer,
        score: answer.score
      };
      return acc;
    }, {});
    
    // Compare question-by-question
    const questionComparison = [];
    
    // Use post-test questions as base
    for (const [questionText, postAnswer] of Object.entries(postTestAnswers)) {
      const preAnswer = preTestAnswers[questionText];
      
      if (preAnswer) {
        questionComparison.push({
          question: questionText,
          preTestCorrect: preAnswer.isCorrect,
          postTestCorrect: postAnswer.isCorrect,
          improved: !preAnswer.isCorrect && postAnswer.isCorrect,
          declined: preAnswer.isCorrect && !postAnswer.isCorrect,
          preTestAnswer: preAnswer.selectedOption,
          postTestAnswer: postAnswer.selectedOption
        });
      }
    }
    
    res.status(200).json({
      success: true,
      data: {
        course: {
          id: course.id,
          title: course.title
        },
        preTest: {
          id: preTestAttempt.id,
          date: preTestAttempt.endTime,
          score: preTestScore,
          totalTime: preTestAttempt.timeSpent
        },
        postTest: {
          id: postTestAttempt.id,
          date: postTestAttempt.endTime,
          score: postTestScore,
          totalTime: postTestAttempt.timeSpent
        },
        comparison: {
          improvement,
          improvementPercentage: parseFloat(improvementPercentage.toFixed(2)),
          questionComparison
        }
      }
    });
  } catch (error) {
    console.error('Error comparing test results:', error);
    next(error);
  }
};


// Get analytics for a specific quiz
export const getQuizAnalytics = async (req, res, next) => {
  try {
    const { quizId } = req.params;

    // First, fetch the basic quiz info to determine its associations
    const quiz = await Quiz.findByPk(quizId);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Determine the associated course
    let course = null;
    
    // If quiz has a direct courseId
    if (quiz.courseId) {
      course = await Course.findByPk(quiz.courseId);
    } 
    // If quiz is associated with a module
    else if (quiz.moduleId) {
      const module = await Module.findByPk(quiz.moduleId, {
        include: [Course]
      });
      if (module && module.Course) {
        course = module.Course;
      }
    }
    
    // If no course found by either method
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found. Quiz is not properly associated with any course.'
      });
    }
    
    // Check authorization
    if (req.user.role !== 'admin' && course.instructorId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this quiz analytics'
      });
    }

    // Get all quiz attempts
    const attempts = await QuizAttempt.findAll({
      where: { quizId },
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email']
        },
        {
          model: Answer,
          include: [{ model: Question }]
        }
      ]
    });

    // Calculate statistics
    const totalAttempts = attempts.length;
    const uniqueStudents = new Set(attempts.map(a => a.userId)).size;

    let totalScore = 0;
    let passCount = 0;
    let totalTimeSpent = 0;

    // Question-level statistics
    const questionStats = {};

    attempts.forEach(attempt => {
      totalScore += attempt.score || 0;
      if (attempt.isPassed) passCount++;
      totalTimeSpent += attempt.timeSpent || 0;

      // Process answers for question stats
      attempt.Answers.forEach(answer => {
        const questionId = answer.questionId;
        const questionText = answer.Question ? answer.Question.text : "Unknown Question";

        if (!questionStats[questionId]) {
          questionStats[questionId] = {
            id: questionId,
            text: questionText,
            totalAnswers: 0,
            correctAnswers: 0,
            totalTimeSpent: 0,
            skipped: 0
          };
        }

        questionStats[questionId].totalAnswers++;
        if (answer.isCorrect) questionStats[questionId].correctAnswers++;
        if (answer.timeSpent) questionStats[questionId].totalTimeSpent += answer.timeSpent;
      });
    });

    // Calculate averages
    const averageScore = totalAttempts > 0 ? totalScore / totalAttempts : 0;
    const passRate = totalAttempts > 0 ? (passCount / totalAttempts) * 100 : 0;
    const avgTimeSpent = totalAttempts > 0 ? totalTimeSpent / totalAttempts : 0;

    // Format time helper function
    const formatTime = (seconds) => {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = Math.round(seconds % 60);
      return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    };

    // Format question stats into array
    const formattedQuestionStats = Object.values(questionStats).map(stat => ({
      id: stat.id,
      text: stat.text,
      correctPercentage: stat.totalAnswers > 0 ? (stat.correctAnswers / stat.totalAnswers) * 100 : 0,
      avgTimeSpent: stat.totalAnswers > 0 ? stat.totalTimeSpent / stat.totalAnswers : 0,
      avgTimeSpentFormatted: formatTime(stat.totalAnswers > 0 ? stat.totalTimeSpent / stat.totalAnswers : 0),
      skippedPercentage: stat.skipped > 0 ? (stat.skipped / totalAttempts) * 100 : 0
    }));

    // Format recent attempts
    const recentAttempts = attempts
      .sort((a, b) => new Date(b.endTime) - new Date(a.endTime))
      .slice(0, 10)
      .map(attempt => ({
        id: attempt.id,
        student: {
          id: attempt.User.id,
          name: attempt.User.name,
          email: attempt.User.email
        },
        score: attempt.score || 0,
        isPassed: attempt.isPassed || false,
        endTime: attempt.endTime,
        timeSpent: attempt.timeSpent || 0,
        timeSpentFormatted: formatTime(attempt.timeSpent || 0)
      }));

    res.status(200).json({
      success: true,
      data: {
        totalAttempts,
        uniqueStudents,
        averageScore,
        passRate,
        avgTimeSpent,
        avgTimeSpentFormatted: formatTime(avgTimeSpent),
        questionStats: formattedQuestionStats,
        recentAttempts
      }
    });
  } catch (error) {
    console.error('Error getting quiz analytics:', error);
    next(error);
  }
};