import express from "express";
import * as newsController from "../controllers/newsController.js";
import { protect, authorize } from "../middlewares/auth.js";
import uploadNews from "../utils/uploadConfig.js";

const router = express.Router();

// Admin routes (protected)
router.get("/admin", protect, authorize("admin"), newsController.getAllNews);
router.post(
  "/admin",
  protect,
  authorize("admin"),
  uploadNews.single("image"),
  newsController.createNews
);

router.get(
  "/admin/:id",
  protect,
  authorize("admin"),
  newsController.getNewsById
);
router.put(
  "/admin/:id",
  protect,
  authorize("admin"),
  uploadNews.single("image"),
  newsController.updateNews
);
router.delete(
  "/admin/:id",
  protect,
  authorize("admin"),
  newsController.deleteNews
);

// Public routes
router.get("/", newsController.getPublicNews);
router.get("/:id", newsController.getPublicNewsById);

export default router;
