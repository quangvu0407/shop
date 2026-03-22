import express from "express";
import {
  addProduct,
  getProducts,
  listProducts,
  removeProduct,
  singleProducts,
  updateProduct,
  decreaseStock,
  restoreStock,
  count
} from "../controllers/productController.js";

import upload from "../middleware/multer.js";
import adminAuth from "../middleware/adminAuth.js";
import validate from "../middleware/validate.js";
import { updateProductSchema, productSchema } from "../validators/productValidator.js";

const productRouter = express.Router();

// Thêm sản phẩm 
productRouter.post(
  "/add",
  // adminAuth, // 1. check quyền
  upload.fields([
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
    { name: "image3", maxCount: 1 },
    { name: "image4", maxCount: 1 },
  ]),
  validate(productSchema),
  addProduct
);

// Update sản phẩm
productRouter.put(
  "/:id",
  adminAuth,
  validate(updateProductSchema),
  updateProduct
);
//data dashboard
productRouter.get("/count", adminAuth, count);

// Xóa sản phẩm
productRouter.delete("/:id", adminAuth, removeProduct);

// Danh sách sản phẩm
productRouter.get("/list", listProducts);

productRouter.get("/listpage", getProducts)

// Internal stock update endpoint for order-service
productRouter.post("/stock/decrease", decreaseStock);
productRouter.post("/stock/restore", restoreStock);

// Chi tiết sản phẩm
productRouter.get("/:id", singleProducts);



export default productRouter;