import db from '../models/index.js';

const { ForumCategory, ForumTopic, ForumPost, User } = db;

// Category Controllers
export const getAllCategories = async (req, res, next) => {
  try {
    const categories = await ForumCategory.findAll({
      where: { isActive: true },
      order: [['order', 'ASC']],
      include: [
        {
          model: ForumTopic,
          attributes: ['id'],
          required: false
        }
      ],
      attributes: {
        include: [
          [
            db.sequelize.literal('(SELECT COUNT(*) FROM ForumTopics WHERE ForumTopics.categoryId = ForumCategory.id)'),
            'topicCount'
          ]
        ]
      }
    });

    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    next(error);
  }
};

export const getCategoryById = async (req, res, next) => {
  try {
    const { categoryId } = req.params;
    
    const category = await ForumCategory.findByPk(categoryId, {
      include: [
        {
          model: ForumTopic,
          include: [
            {
              model: User,
              as: 'author',
              attributes: ['id', 'name']
            },
            {
              model: ForumPost,
              separate: true,
              limit: 1,
              order: [['createdAt', 'DESC']],
              include: [
                {
                  model: User,
                  as: 'author',
                  attributes: ['id', 'name']
                }
              ]
            }
          ],
          order: [
            ['isPinned', 'DESC'],
            ['lastActivityAt', 'DESC']
          ]
        }
      ]
    });
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    next(error);
  }
};

// Topic Controllers
export const createTopic = async (req, res, next) => {
  try {
    const { categoryId } = req.params;
    const { title, content } = req.body;
    const userId = req.user.id;
    
    // Check if category exists
    const category = await ForumCategory.findByPk(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    // Create topic
    const topic = await ForumTopic.create({
      title,
      content,
      categoryId,
      authorId: userId,
      lastActivityAt: new Date()
    });
    
    res.status(201).json({
      success: true,
      data: topic
    });
  } catch (error) {
    next(error);
  }
};

export const getTopicById = async (req, res, next) => {
  try {
    const { topicId } = req.params;
    
    // Find topic with author and category
    const topic = await ForumTopic.findByPk(topicId, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name']
        },
        {
          model: ForumCategory,
          attributes: ['id', 'title', 'slug']
        },
        {
          model: ForumPost,
          include: [
            {
              model: User,
              as: 'author',
              attributes: ['id', 'name', 'role', 'createdAt']
            }
          ],
          order: [['createdAt', 'ASC']]
        }
      ]
    });
    
    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Topic not found'
      });
    }
    
    // Increment view count
    await topic.increment('viewCount');
    
    res.status(200).json({
      success: true,
      data: topic
    });
  } catch (error) {
    next(error);
  }
};

// Post Controllers
export const createPost = async (req, res, next) => {
  try {
    const { topicId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;
    
    // Check if topic exists and is not locked
    const topic = await ForumTopic.findByPk(topicId);
    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Topic not found'
      });
    }
    
    if (topic.isLocked) {
      return res.status(403).json({
        success: false,
        message: 'This topic is locked and no longer accepts replies'
      });
    }
    
    // Create post
    const post = await ForumPost.create({
      content,
      topicId,
      authorId: userId
    });
    
    // Update topic's last activity time
    await topic.update({ lastActivityAt: new Date() });
    
    // Get post with author
    const postWithAuthor = await ForumPost.findByPk(post.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'role']
        }
      ]
    });
    
    res.status(201).json({
      success: true,
      data: postWithAuthor
    });
  } catch (error) {
    next(error);
  }
};

// Admin controllers for managing forums
export const createCategory = async (req, res, next) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to create categories'
      });
    }
    
    const { title, description, slug, order } = req.body;
    
    // Create category
    const category = await ForumCategory.create({
      title,
      description,
      slug,
      order: order || 0
    });
    
    res.status(201).json({
      success: true,
      data: category
    });
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update categories'
      });
    }
    
    const { categoryId } = req.params;
    const { title, description, slug, order, isActive } = req.body;
    
    // Find category
    const category = await ForumCategory.findByPk(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    // Update category
    await category.update({
      title: title || category.title,
      description: description !== undefined ? description : category.description,
      slug: slug || category.slug,
      order: order !== undefined ? order : category.order,
      isActive: isActive !== undefined ? isActive : category.isActive
    });
    
    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    next(error);
  }
};