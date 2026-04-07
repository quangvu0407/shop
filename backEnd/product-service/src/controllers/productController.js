import {
  createProduct,
  getAllProducts,
  deleteProduct,
  getProductById,
  updateProductById,
  ProductPage,
  decreaseProductsStock,
  restoreProductsStock,
  getProductCount,
  getProductContext,
  getProductsByIds,
} from "../services/productService.js";

// Thêm
const addProduct = async (req, res) => {
  try {
    await createProduct(req.body, req.files);
    res.json({ success: true, message: "Product Added" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Danh sách
const listProducts = async (req, res) => {
  try {
    const products = await getAllProducts();
    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const productContext = async (req, res) => {
  try {
    const products = await getProductContext();
    res.json({ success: true, products })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export const getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const { category, subCategory, search, sort } = req.query;

    const result = await ProductPage({ page, limit, category, subCategory, search, sort });

    res.json({ success: true, ...result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Xóa
const removeProduct = async (req, res) => {
  try {
    await deleteProduct(req.params.id);
    res.json({ success: true, message: "Product Removed" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Chi tiết
const singleProducts = async (req, res) => {
  try {
    const product = await getProductById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found!",
      });
    }

    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update
const updateProduct = async (req, res) => {
  try {
    const product = await updateProductById(req.params.id, req.body);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found!",
      });
    }

    res.json({ success: true, message: "Updated", product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const decreaseStock = async (req, res) => {
  try {
    const { items } = req.body;
    await decreaseProductsStock(items || []);
    res.json({ success: true, message: "Stock updated" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const restoreStock = async (req, res) => {
  try {
    const { items } = req.body;
    await restoreProductsStock(items || []);
    res.json({ success: true, message: "Stock restored" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const count = async (req, res) => {
  try {
    const productCount = await getProductCount();
    res.json({ success: true, productCount });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to get product count" });
  }
};

const batchProducts = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0)
      return res.json({ success: true, products: [] });
    const products = await getProductsByIds(ids);
    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export {
  addProduct,
  listProducts,
  removeProduct,
  singleProducts,
  updateProduct,
  decreaseStock,
  restoreStock,
  count,
  productContext,
  batchProducts,
};