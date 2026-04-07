import { v2 as cloudinary } from "cloudinary";
import productModel from "../models/productModel.js";
import redis from '../config/redis.js'

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
  const saved = await product.save();
  invalidateProductCache();
  return saved;
};

const CACHE_TTL = 300 // 5 phút

const invalidateProductCache = async () => {
  try {
    const keys = await redis.keys('products:*')
    if (keys.length) await redis.del(keys)
  } catch (e) {
    console.error('Redis invalidate error:', e)
  }
}

// Get all
const getAllProducts = async () => {
  const cacheKey = "products:all";
  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log("Cache hit");
      return JSON.parse(cached);
    }
  } catch (e) {
    console.error('Redis get error:', e)
  }

  const products = await productModel.find({}).lean();

  try {
    await redis.set(cacheKey, JSON.stringify(products), "EX", CACHE_TTL);
  } catch (e) {
    console.error('Redis set error:', e)
  }

  return products
};

// Get product for chatbot

const getProductContext = async () => {
  return await productModel.find({}).select("_id name price category subCategory sizes quantity bestseller").limit(50);
};

const ProductPage = async ({ page = 1, limit = 15, category, subCategory, search, sort }) => {
  page = Number(page) || 1;
  limit = Math.min(Number(limit) || 15, 50);
  const skip = (page - 1) * limit;
  const cacheKey = `products:${page}:${limit}:${category || "all"}:${subCategory || "all"}:${search || ""}:${sort || "default"}`;
  // 1. check cache
  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log("Cache hit:", cacheKey);
      return JSON.parse(cached);
    }
  } catch (e) {
    console.error('Redis get error:', e)
  }

  const filter = {};
  if (category) filter.category = { $in: Array.isArray(category) ? category : category.split(',') };
  if (subCategory) filter.subCategory = { $in: Array.isArray(subCategory) ? subCategory : subCategory.split(',') };
  if (search) filter.name = { $regex: search, $options: 'i' };

  const sortOption = sort === 'low-high' ? { price: 1 } : sort === 'high-low' ? { price: -1 } : { date: -1 };

  const [products, total] = await Promise.all([
    productModel.find(filter).sort(sortOption).skip(skip).limit(limit),
    productModel.countDocuments(filter),
  ]);

  const result = {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    data: products,
  };

  // 4. set cache
  try {
    await redis.set(cacheKey, JSON.stringify(result), "EX", CACHE_TTL);
  } catch (e) {
    console.error('Redis set error:', e)
  }

  return result;
};

// Delete
const deleteProduct = async (id) => {
  const result = await productModel.findByIdAndDelete(id);
  try {
    await redis.del(`product:${id}`)
    await invalidateProductCache()
  } catch (e) {
    console.error('Redis del error:', e)
  }
  return result;
};

// Get one
const getProductById = async (id) => {
  const cacheKey = `product:${id}`

  try {
    const cached = await redis.get(cacheKey)
    if (cached) return JSON.parse(cached)
  } catch (e) {
    console.error('Redis get error:', e)
  }

  const product = await productModel.findById(id)
  if (!product) throw new Error('Product not found')

  try {
    await redis.set(cacheKey, JSON.stringify(product), 'EX', CACHE_TTL)
  } catch (e) {
    console.error('Redis set error:', e)
  }

  return product
}


// Update
const updateProductById = async (id, data) => {
  const { name, description, price, category, subCategory, bestseller, sizes, quantity, promotionIds } = data;

  await redis.del(`product:${id}`)
  return await productModel.findByIdAndUpdate(
    id,
    { name, description, price, category, subCategory, bestseller, quantity, promotionIds, sizes },
    { new: true }
  ).then(result => { invalidateProductCache(); return result; });
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

  try {
    await Promise.all(productIds.map(id => redis.del(`product:${id}`)))
    await invalidateProductCache()
  } catch (e) {
    console.error('Redis invalidate stock error:', e)
  }

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

  try {
    await Promise.all(productIds.map(id => redis.del(`product:${id}`)))
    await invalidateProductCache()
  } catch (e) {
    console.error('Redis invalidate stock error:', e)
  }

  return productIds;
};

const getProductCount = async () => {
  const count = await productModel.countDocuments();
  return count;
};

const getProductsByIds = async (ids = []) => {
  return await productModel.find({ _id: { $in: ids } });
};

export {
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
};