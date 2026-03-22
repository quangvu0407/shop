import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";
import productModel from "./models/productModel.js";
import connectDB from "./config/mongodb.js";

connectDB();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadImage = async (path) => {
  const result = await cloudinary.uploader.upload(path);
  return result.secure_url;
};

async function seedProducts() {
  try {
    await productModel.deleteMany();
    console.log("Old products deleted");

    const description = "Powerful smartphone with high performance chip, premium design and long battery life.";

    const rawProducts = [

      // ================= PHONE (24 sản phẩm) =================
      { name: "iPhone 15 Pro Max", price: 32990000, category: "Phone", subCategory: "Apple", sizes: ["256", "512"], bestseller: true },
      { name: "iPhone 15 Pro", price: 28990000, category: "Phone", subCategory: "Apple", sizes: ["128", "256"], bestseller: true },
      { name: "iPhone 15", price: 22990000, category: "Phone", subCategory: "Apple", sizes: ["128", "256"], bestseller: false },
      { name: "iPhone 14", price: 19990000, category: "Phone", subCategory: "Apple", sizes: ["128", "256"], bestseller: true },
      { name: "iPhone 13", price: 16990000, category: "Phone", subCategory: "Apple", sizes: ["128", "256"], bestseller: false },
      { name: "iPhone 12", price: 13990000, category: "Phone", subCategory: "Apple", sizes: ["64", "128"], bestseller: false },
      { name: "iPhone SE 2022", price: 10990000, category: "Phone", subCategory: "Apple", sizes: ["64", "128"], bestseller: false },
      { name: "iPhone 14 Pro Max", price: 27990000, category: "Phone", subCategory: "Apple", sizes: ["256", "512"], bestseller: true },

      { name: "Samsung Galaxy S24 Ultra", price: 30990000, category: "Phone", subCategory: "Samsung", sizes: ["256", "512"], bestseller: true },
      { name: "Samsung Galaxy S24", price: 22990000, category: "Phone", subCategory: "Samsung", sizes: ["128", "256"], bestseller: true },
      { name: "Samsung Galaxy S23 Ultra", price: 27990000, category: "Phone", subCategory: "Samsung", sizes: ["256", "512"], bestseller: true },
      { name: "Samsung Galaxy S23", price: 19990000, category: "Phone", subCategory: "Samsung", sizes: ["128", "256"], bestseller: false },
      { name: "Samsung Galaxy A55", price: 10990000, category: "Phone", subCategory: "Samsung", sizes: ["128", "256"], bestseller: false },
      { name: "Samsung Galaxy A35", price: 8990000, category: "Phone", subCategory: "Samsung", sizes: ["128", "256"], bestseller: false },
      { name: "Samsung Galaxy A15", price: 4990000, category: "Phone", subCategory: "Samsung", sizes: ["64", "128"], bestseller: false },
      { name: "Samsung Galaxy Z Fold5", price: 40990000, category: "Phone", subCategory: "Samsung", sizes: ["256", "512"], bestseller: true },

      { name: "Xiaomi 14 Pro", price: 19990000, category: "Phone", subCategory: "Xiaomi", sizes: ["256", "512"], bestseller: true },
      { name: "Xiaomi 14", price: 17990000, category: "Phone", subCategory: "Xiaomi", sizes: ["128", "256"], bestseller: true },
      { name: "Xiaomi 13T Pro", price: 15990000, category: "Phone", subCategory: "Xiaomi", sizes: ["256", "512"], bestseller: true },
      { name: "Xiaomi 12T", price: 11990000, category: "Phone", subCategory: "Xiaomi", sizes: ["128", "256"], bestseller: false },
      { name: "Xiaomi Redmi Note 13", price: 6990000, category: "Phone", subCategory: "Xiaomi", sizes: ["128", "256"], bestseller: false },
      { name: "Xiaomi Redmi Note 12", price: 5990000, category: "Phone", subCategory: "Xiaomi", sizes: ["64", "128"], bestseller: false },
      { name: "Xiaomi Redmi 13C", price: 3990000, category: "Phone", subCategory: "Xiaomi", sizes: ["64", "128"], bestseller: false },
      { name: "Xiaomi Poco F5", price: 9990000, category: "Phone", subCategory: "Xiaomi", sizes: ["256", "512"], bestseller: true },


      // ================= CHARGER (14 sản phẩm) =================
      { name: "Apple 25w USB-C Charger", price: 590000, category: "Charger", subCategory: "Apple", sizes: ["64", "128"], bestseller: true },
      { name: "Apple 240w USB-C Charger", price: 990000, category: "Charger", subCategory: "Apple", sizes: ["128", "256"], bestseller: false },
      { name: "Apple No core Charger", price: 1190000, category: "Charger", subCategory: "Apple", sizes: ["128", "256"], bestseller: false },
      { name: "Apple 25w magesafe Charger", price: 1490000, category: "Charger", subCategory: "Apple", sizes: ["256", "512"], bestseller: false },

      { name: "Samsung 45w Fast Charger", price: 490000, category: "Charger", subCategory: "Samsung", sizes: ["64", "128"], bestseller: true },
      { name: "Samsung 65w Super Fast Charger", price: 890000, category: "Charger", subCategory: "Samsung", sizes: ["128", "256"], bestseller: true },
      { name: "Samsung 45w", price: 790000, category: "Charger", subCategory: "Samsung", sizes: ["128", "256"], bestseller: false },
      { name: "Samsung 50w", price: 1290000, category: "Charger", subCategory: "Samsung", sizes: ["256", "512"], bestseller: false },

      { name: "Xiaomi 33W Fast Charger", price: 350000, category: "Charger", subCategory: "Xiaomi", sizes: ["64", "128"], bestseller: true },
      { name: "Xiaomi 67W Turbo Charger", price: 450000, category: "Charger", subCategory: "Xiaomi", sizes: ["128", "256"], bestseller: true },
      { name: "Xiaomi 120W HyperCharge", price: 990000, category: "Charger", subCategory: "Xiaomi", sizes: ["256", "512"], bestseller: false },
      { name: "Xiaomi Wireless Charger", price: 690000, category: "Charger", subCategory: "Xiaomi", sizes: ["128", "256"], bestseller: false },
      { name: "Xiaomi Car Charger", price: 290000, category: "Charger", subCategory: "Xiaomi", sizes: ["64", "128"], bestseller: false },
      { name: "Xiaomi GaN Charger 65W", price: 790000, category: "Charger", subCategory: "Xiaomi", sizes: ["128", "256"], bestseller: false },


      // ================= EARPHONE (14 sản phẩm) =================
      { name: "Apple AirPods 2", price: 2990000, category: "Earphone", subCategory: "Apple", sizes: ["128", "256"], bestseller: false },
      { name: "Apple AirPods 3", price: 3990000, category: "Earphone", subCategory: "Apple", sizes: ["128", "256"], bestseller: true },
      { name: "Apple AirPods Pro 2", price: 5990000, category: "Earphone", subCategory: "Apple", sizes: ["256", "512"], bestseller: true },
      { name: "Apple EarPods Lightning", price: 590000, category: "Earphone", subCategory: "Apple", sizes: ["64", "128"], bestseller: false },

      { name: "Samsung Galaxy Buds FE", price: 1990000, category: "Earphone", subCategory: "Samsung", sizes: ["64", "128"], bestseller: false },
      { name: "Samsung Galaxy Buds2", price: 2990000, category: "Earphone", subCategory: "Samsung", sizes: ["128", "256"], bestseller: true },
      { name: "Samsung Galaxy Buds2 Pro", price: 3990000, category: "Earphone", subCategory: "Samsung", sizes: ["256", "512"], bestseller: true },
      { name: "Samsung AKG Wired Earphone", price: 490000, category: "Earphone", subCategory: "Samsung", sizes: ["64", "128"], bestseller: false },

      { name: "Xiaomi Redmi Buds 4", price: 990000, category: "Earphone", subCategory: "Xiaomi", sizes: ["64", "128"], bestseller: false },
      { name: "Xiaomi Buds 4 Pro", price: 2990000, category: "Earphone", subCategory: "Xiaomi", sizes: ["128", "256"], bestseller: true },
      { name: "Xiaomi Buds 3T Pro", price: 2490000, category: "Earphone", subCategory: "Xiaomi", sizes: ["128", "256"], bestseller: false },
      { name: "Xiaomi Wired Earphone", price: 290000, category: "Earphone", subCategory: "Xiaomi", sizes: ["64", "128"], bestseller: false },
      { name: "Xiaomi Gaming Earbuds", price: 1490000, category: "Earphone", subCategory: "Xiaomi", sizes: ["128", "256"], bestseller: false },
      { name: "Xiaomi Noise Cancelling Earbuds", price: 1990000, category: "Earphone", subCategory: "Xiaomi", sizes: ["256", "512"], bestseller: false },

    ];

    const products = [];

    for (let i = 0; i < rawProducts.length; i++) {
      console.log(`Uploading p_img${i + 1}.png...`);

      const imageUrl = await uploadImage(`./seedImages/p_image${i + 1}.jpg`);

      products.push({
        ...rawProducts[i],
        description,
        image: [imageUrl],
        date: Date.now(),
      });
    }

    await productModel.insertMany(products);

    console.log("🔥 FULL 52 PRODUCTS SEEDED SUCCESSFULLY!");
    process.exit();
  } catch (err) {
    console.log("FULL ERROR:", err);
  }
}

seedProducts();