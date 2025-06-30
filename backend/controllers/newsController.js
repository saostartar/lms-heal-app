import db from '../models/index.js';
import { Op } from 'sequelize';
import fs from 'fs';
import path from 'path';

const { News, User } = db;

// Get all news articles (paginated)
export const getAllNews = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, category, search, published } = req.query;
    const offset = (page - 1) * limit;
    
    const where = {};
    
    // Filter by category if provided
    if (category) {
      where.category = category;
    }
    
    // Filter by search term if provided
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { content: { [Op.like]: `%${search}%` } }
      ];
    }
    
    // Filter by published status if provided
    if (published === 'true') {
      where.isPublished = true;
    } else if (published === 'false') {
      where.isPublished = false;
    }
    
    // Get news articles
    const news = await News.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name']
        }
      ]
    });
    
    // Transform results to include full image path
    const transformedNews = news.rows.map(item => {
      const newsItem = item.toJSON();
      if (newsItem.imagePath) {
        newsItem.imageUrl = `${req.protocol}://${req.get('host')}/uploads/news/${newsItem.imagePath}`;
      }
      return newsItem;
    });
    
    res.status(200).json({
      success: true,
      data: {
        news: transformedNews,
        totalPages: Math.ceil(news.count / limit),
        currentPage: parseInt(page),
        total: news.count
      }
    });
  } catch (error) {
    console.error('Error fetching news:', error);
    next(error);
  }
};

// Get public news articles (for learners)
export const getPublicNews = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, category } = req.query;
    const offset = (page - 1) * limit;
    
    const where = {
      isPublished: true
    };
    
    // Filter by category if provided
    if (category) {
      where.category = category;
    }
    
    const news = await News.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['publishedAt', 'DESC']],
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name']
        }
      ]
    });
    
    // Transform results to include full image path
    const transformedNews = news.rows.map(item => {
      const newsItem = item.toJSON();
      if (newsItem.imagePath) {
        newsItem.imageUrl = `${req.protocol}://${req.get('host')}/uploads/news/${newsItem.imagePath}`;
      }
      return newsItem;
    });
    
    res.status(200).json({
      success: true,
      data: {
        news: transformedNews,
        totalPages: Math.ceil(news.count / limit),
        currentPage: parseInt(page),
        total: news.count
      }
    });
  } catch (error) {
    console.error('Error fetching public news:', error);
    next(error);
  }
};

// Get a single news article by ID
export const getNewsById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const news = await News.findByPk(id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name']
        }
      ]
    });
    
    if (!news) {
      return res.status(404).json({
        success: false,
        message: 'News article not found'
      });
    }

    // Add full image URL
    const newsData = news.toJSON();
    if (newsData.imagePath) {
      newsData.imageUrl = `${req.protocol}://${req.get('host')}/uploads/news/${newsData.imagePath}`;
    }
    
    res.status(200).json({
      success: true,
      data: newsData
    });
  } catch (error) {
    console.error('Error fetching news by ID:', error);
    next(error);
  }
};

export const getPublicNewsById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const news = await News.findOne({
      where: {
        id,
        isPublished: true
      },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name']
        }
      ]
    });
    
    if (!news) {
      return res.status(404).json({
        success: false,
        message: 'News article not found'
      });
    }
    
    // Add full image URL
    const newsData = news.toJSON();
    if (newsData.imagePath) {
      newsData.imageUrl = `${req.protocol}://${req.get('host')}/uploads/news/${newsData.imagePath}`;
    }
    
    res.status(200).json({
      success: true,
      data: newsData
    });
  } catch (error) {
    console.error('Error fetching public news by ID:', error);
    next(error);
  }
};

// Create a new news article (admin only)
export const createNews = async (req, res, next) => {
  try {
    const { title, content, category, isPublished } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required'
      });
    }
    
    // Set publishedAt date if isPublished is true
    const publishedAt = isPublished ? new Date() : null;
    
    // Handle file upload
    const imagePath = req.file ? req.file.filename : null;
    
    // Create the news article
    const news = await News.create({
      title,
      content,
      category,
      imagePath,
      isPublished,
      publishedAt,
      authorId: req.user.id
    });
    
    // Add image URL to response
    const responseData = news.toJSON();
    if (responseData.imagePath) {
      responseData.imageUrl = `${req.protocol}://${req.get('host')}/uploads/news/${responseData.imagePath}`;
    }
    
    res.status(201).json({
      success: true,
      data: responseData
    });
  } catch (error) {
    console.error('Error creating news:', error);
    next(error);
  }
};

// Update a news article (admin only)
export const updateNews = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content, category, isPublished, removeImage } = req.body;
    
    // Find the news article
    const news = await News.findByPk(id);
    
    if (!news) {
      return res.status(404).json({
        success: false,
        message: 'News article not found'
      });
    }
    
    // Check if we need to update publishedAt
    let publishedAt = news.publishedAt;
    if (!news.isPublished && isPublished) {
      publishedAt = new Date();
    }
    
    // Handle image update
    let imagePath = news.imagePath;
    
    // If removeImage is true, delete the existing image
    if (removeImage === 'true' && news.imagePath) {
      const imagePath = path.join(process.cwd(), 'uploads', 'news', news.imagePath);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
      imagePath = null;
    }
    
    // If a new file is uploaded, replace the existing one
    if (req.file) {
      // Delete the old image if it exists
      if (news.imagePath) {
        const oldImagePath = path.join(process.cwd(), 'uploads', 'news', news.imagePath);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      imagePath = req.file.filename;
    }
    
    // Update the news article
    await news.update({
      title: title || news.title,
      content: content || news.content,
      category: category || news.category,
      imagePath,
      isPublished: isPublished !== undefined ? isPublished : news.isPublished,
      publishedAt
    });
    
    // Add image URL to response
    const responseData = news.toJSON();
    if (responseData.imagePath) {
      responseData.imageUrl = `${req.protocol}://${req.get('host')}/uploads/news/${responseData.imagePath}`;
    }
    
    res.status(200).json({
      success: true,
      data: responseData
    });
  } catch (error) {
    console.error('Error updating news:', error);
    next(error);
  }
};

// Delete a news article (admin only)
export const deleteNews = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Find the news article
    const news = await News.findByPk(id);
    
    if (!news) {
      return res.status(404).json({
        success: false,
        message: 'News article not found'
      });
    }
    
    // Delete the associated image if it exists
    if (news.imagePath) {
      const imagePath = path.join(process.cwd(), 'uploads', 'news', news.imagePath);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    // Delete the news article
    await news.destroy();
    
    res.status(200).json({
      success: true,
      message: 'News article deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting news:', error);
    next(error);
  }
};