import sequelize from '../config/db.js';
import User from './User.js';
import Course from './Course.js';
import Module from './Module.js';
import Lesson from './Lesson.js';
import Quiz from './Quiz.js';
import Question from './Question.js';
import Option from './Option.js';
import QuizAttempt from './QuizAttempt.js';
import Answer from './Answer.js';
import Enrollment from './Enrollment.js';
import LessonProgress from './LessonProgress.js';
import ModuleProgress from './ModuleProgress.js';
import News from './News.js';
import ForumCategory from './ForumCategory.js';
import ForumTopic from './ForumTopic.js';
import ForumPost from './ForumPost.js';

// User and Course relationship
User.hasMany(Course, { as: 'createdCourses', foreignKey: 'instructorId' });
Course.belongsTo(User, { as: 'instructor', foreignKey: 'instructorId' });

// Course and Module relationship - explicit foreign key on both sides
Course.hasMany(Module, { 
  onDelete: 'CASCADE', 
  foreignKey: 'courseId'
});
Module.belongsTo(Course, {
  foreignKey: 'courseId'
});

// Module and Lesson relationship
Module.hasMany(Lesson, { 
  onDelete: 'CASCADE',
  foreignKey: 'moduleId' 
});
Lesson.belongsTo(Module, {
  foreignKey: 'moduleId'
});

// Enrollment relationship
User.belongsToMany(Course, { through: Enrollment, as: 'enrolledCourses', foreignKey: 'userId' });
Course.belongsToMany(User, { through: Enrollment, as: 'enrolledUsers', foreignKey: 'courseId' });
User.hasMany(Enrollment, { foreignKey: 'userId' });
Enrollment.belongsTo(User, { foreignKey: 'userId' });
Course.hasMany(Enrollment, { foreignKey: 'courseId' });
Enrollment.belongsTo(Course, { foreignKey: 'courseId' });

// Lesson Progress
User.hasMany(LessonProgress, { foreignKey: 'userId' });
LessonProgress.belongsTo(User, { foreignKey: 'userId' });
Lesson.hasMany(LessonProgress, { foreignKey: 'lessonId' });
LessonProgress.belongsTo(Lesson, { foreignKey: 'lessonId' });

// Module Progress
User.hasMany(ModuleProgress, { foreignKey: 'userId' });
ModuleProgress.belongsTo(User, { foreignKey: 'userId' });
Module.hasMany(ModuleProgress, { foreignKey: 'moduleId' });
ModuleProgress.belongsTo(Module, { foreignKey: 'moduleId' });

// Quiz relationships
Module.hasMany(Quiz, { foreignKey: 'moduleId', onDelete: 'SET NULL' });
Quiz.belongsTo(Module, { foreignKey: 'moduleId' });

Lesson.hasOne(Quiz, { foreignKey: 'lessonId', onDelete: 'SET NULL' });
Quiz.belongsTo(Lesson, { foreignKey: 'lessonId' });

Course.hasMany(Quiz, { foreignKey: 'courseId', onDelete: 'CASCADE' });
Quiz.belongsTo(Course, { foreignKey: 'courseId' });

Quiz.hasMany(Question, { onDelete: 'CASCADE', foreignKey: 'quizId' });
Question.belongsTo(Quiz, { foreignKey: 'quizId' });

Question.hasMany(Option, { onDelete: 'CASCADE', foreignKey: 'questionId' });
Option.belongsTo(Question, { foreignKey: 'questionId' });

Course.belongsTo(Quiz, { as: 'preTestQuiz', foreignKey: 'preTestQuizId', constraints: false });
Course.belongsTo(Quiz, { as: 'postTestQuiz', foreignKey: 'postTestQuizId', constraints: false });
Quiz.hasOne(Course, { as: 'preTestCourse', foreignKey: 'preTestQuizId', constraints: false });
Quiz.hasOne(Course, { as: 'postTestCourse', foreignKey: 'postTestQuizId', constraints: false });

// Quiz Attempt relationships
Quiz.hasMany(QuizAttempt, { foreignKey: 'quizId' });
QuizAttempt.belongsTo(Quiz, { foreignKey: 'quizId' });

User.hasMany(QuizAttempt, { foreignKey: 'userId' });
QuizAttempt.belongsTo(User, { foreignKey: 'userId' });

QuizAttempt.hasMany(Answer, { onDelete: 'CASCADE', foreignKey: 'quizAttemptId' });
Answer.belongsTo(QuizAttempt, { foreignKey: 'quizAttemptId' });

Question.hasMany(Answer, { foreignKey: 'questionId' });
Answer.belongsTo(Question, { foreignKey: 'questionId' });

Option.hasMany(Answer, { foreignKey: 'selectedOptionId', constraints: false });
Answer.belongsTo(Option, { foreignKey: 'selectedOptionId', constraints: false });

// Forum relationships
User.hasMany(ForumTopic, { foreignKey: 'authorId' });
ForumTopic.belongsTo(User, { as: 'author', foreignKey: 'authorId' });

User.hasMany(ForumPost, { foreignKey: 'authorId' });
ForumPost.belongsTo(User, { as: 'author', foreignKey: 'authorId' });

ForumCategory.hasMany(ForumTopic, { foreignKey: 'categoryId' });
ForumTopic.belongsTo(ForumCategory, { foreignKey: 'categoryId' });

ForumTopic.hasMany(ForumPost, { foreignKey: 'topicId', onDelete: 'CASCADE' });
ForumPost.belongsTo(ForumTopic, { foreignKey: 'topicId' });

const db = {
  sequelize,
  User,
  Course,
  Module,
  Lesson,
  Enrollment,
  LessonProgress,
  ModuleProgress,
  Quiz,
  Question,
  Option,
  QuizAttempt,
  Answer,
  News,
  ForumCategory,
  ForumTopic,
  ForumPost,

};

export default db;