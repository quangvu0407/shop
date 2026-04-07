import express from "express";
import { create, list, update, remove, validate, confirmUsage, myPromotions } from "../controllers/promotionController.js";
import adminAuth from "../middleware/adminAuth.js";
import authUser from "../middleware/auth.js";

const router = express.Router();

// Admin routes
router.post("/create", adminAuth, create);
router.get("/list", adminAuth, list);
router.put("/:id", adminAuth, update);
router.delete("/:id", adminAuth, remove);

// User routes
router.get("/my", authUser, myPromotions);
router.post("/validate", authUser, validate);

// Internal
router.post("/confirm-usage", confirmUsage);

export default router;
