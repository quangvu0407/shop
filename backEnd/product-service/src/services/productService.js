import { v2 as cloudinary } from "cloudinary";
import productModel from "../models/productModel.js";

// Add product
const createProduct = async (data, files) => {
  const {
    name,
    description,
    price,
    category,
    subCategory,
    sizes,
    quantity,
    promotionIds,
    bestseller,
  } = data;

  const image1 = files.image1 && files.image1[0];
  const image2 = files.image2 && files.image2[0];
  const image3 = files.image3 && files.image3[0];
  const image4 = files.image4 && files.image4[0];

  const images = [image1, image2, image3, image4].filter(Boolean);

  const imagesUrl = await Promise.all(
    images.map(async (item) => {
      const result = await cloudinary.uploader.upload(item.path, {
        resource_type: "image",
      });
      return result.secure_url;
    })
  );

  const productData = {
    name,
    description,
    category,
    price,
    subCategory,
    bestseller,
    sizes,
    quantity,
    promotionIds,
    image: imagesUrl,
    date: Date.now(),
  };

  const product = new productModel(productData);
  return await product.save();
};

// Get all
const getAllProducts = async () => {
  return await productModel.find({});
};

// Get product for chatbot

const getProductContext = async () => {
  return await productModel.find({}).select("_id name price category subCategory sizes quantity bestseller").limit(50);
};

const ProductPage = async ({ page = 1, limit = 15, category }) => {
  const skip = (page - 1) * limit;

  const filter = {};
  if (category) filter.category = category;

  const products = await productModel.find(filter)
    .skip(skip)
    .limit(limit);

  const total = await productModel.countDocuments(filter);

  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    data: products,
  };
};

// Delete
const deleteProduct = async (id) => {
  return await productModel.findByIdAndDelete(id);
};

// Get one
const getProductById = async (id) => {
  return await productModel.findById(id);
};

// Update
const updateProductById = async (id, data) => {
  const { name, description, price, category, subCategory, bestseller, sizes, quantity, promotionIds } = data;

  return await productModel.findByIdAndUpdate(
    id,
    {
      name,
      description,
      price,
      category,
      subCategory,
      bestseller,
      quantity,
      promotionIds,
      sizes
    },
    { new: true }
  );
};

const decreaseProductsStock = async (items = []) => {
  const quantityByProduct = new Map();

  for (const item of items) {
    const productId = (item.productId || item._id)?.toString();
    const qty = Number(item.quantity) || 0;
    if (!productId || qty <= 0) continue;
    quantityByProduct.set(productId, (quantityByProduct.get(productId) || 0) + qty);
  }

  const productIds = Array.from(quantityByProduct.keys());
  if (productIds.length === 0) return [];

  const products = await productModel
    .find({ _id: { $in: productIds } })
    .select("_id quantity name");
  const productMap = new Map(
    products.map((p) => [p._id.toString(), { quantity: p.quantity, name: p.name }])
  );

  for (const [productId, qty] of quantityByProduct.entries()) {
    const info = productMap.get(productId.toString());
    if (!info) {
      throw new Error("Có sản phẩm trong đơn không tồn tại hoặc đã bị xóa.");
    }
    if (info.quantity < qty) {
      throw new Error(
        `Sản phẩm "${info.name}" không đủ hàng (còn ${info.quantity}, cần ${qty}).`
      );
    }
  }

  await productModel.bulkWrite(
    productIds.map((productId) => ({
      updateOne: {
        filter: { _id: productId },
        update: { $inc: { quantity: -quantityByProduct.get(productId) } },
      },
    }))
  );

  return productIds;
};

const restoreProductsStock = async (items = []) => {
  const quantityByProduct = new Map();

  for (const item of items) {
    const productId = (item.productId || item._id)?.toString();
    const qty = Number(item.quantity) || 0;
    if (!productId || qty <= 0) continue;
    quantityByProduct.set(productId, (quantityByProduct.get(productId) || 0) + qty);
  }

  const productIds = Array.from(quantityByProduct.keys());
  if (productIds.length === 0) return [];

  await productModel.bulkWrite(
    productIds.map((productId) => ({
      updateOne: {
        filter: { _id: productId },
        update: { $inc: { quantity: quantityByProduct.get(productId) } },
      },
    }))
  );

  return productIds;
};

const getProductCount = async () => {
  const count = await productModel.countDocuments();
  return count;
}

export {
  createProduct,
  getAllProducts,
  deleteProduct,
  getProductById,
  updateProductById,
  ProductPage,
  decreaseProductsStock,
  restoreProductsStock,
  getProductCount, getProductContext
};