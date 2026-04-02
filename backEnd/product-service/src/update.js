import dotenv from "dotenv";
dotenv.config();

import axios from "axios";
import { v2 as cloudinary } from "cloudinary";
import productModel from "./models/productModel.js";
import connectDB from "./config/mongodb.js";

await connectDB();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ── Upload ảnh từ URL thẳng lên Cloudinary (không cần download về máy) ────────
const uploadFromUrl = async (imageUrl) => {
  const result = await cloudinary.uploader.upload(imageUrl, {
    resource_type: "image",
    folder: "fashion-store",
  });
  return result.secure_url;
};

// ── Tìm ảnh trên Unsplash theo keyword ───────────────────────────────────────
const usedImageIds = new Set(); // tránh ảnh trùng

const fetchUnsplashImage = async (query) => {
  const res = await axios.get("https://api.unsplash.com/search/photos", {
    params: { query, per_page: 20, orientation: "portrait" },
    headers: { Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}` },
  });

  const results = res.data.results;

  // Lấy ảnh chưa dùng
  const fresh = results.find((r) => !usedImageIds.has(r.id));
  const chosen = fresh || results[0]; // fallback nếu tất cả đã dùng

  if (chosen) usedImageIds.add(chosen.id);

  // Dùng ảnh regular (1080px) — đủ đẹp, không quá nặng
  return chosen?.urls?.regular || null;
};

// ── Sản phẩm + keyword tìm ảnh + description riêng ──────────────────────────
const NEW_PRODUCTS = [
  // ── MEN TOPWEAR ──
  {
    name: "Men Classic Crew Neck Cotton Tee", price: 25, category: "Men", subCategory: "Topwear",
    sizes: ["S","M","L","XL"], bestseller: true,
    imageQuery: "men white crew neck t-shirt fashion",
    description: "A timeless crew neck tee made from 100% breathable cotton. Versatile enough for casual outings or layering under jackets.",
  },
  {
    name: "Men Slim Fit Polo Shirt", price: 35, category: "Men", subCategory: "Topwear",
    sizes: ["S","M","L","XL","XXL"], bestseller: false,
    imageQuery: "men polo shirt slim fit",
    description: "Classic polo shirt with a refined slim fit. Features a ribbed collar and two-button placket for a polished look.",
  },
  {
    name: "Men Striped Oxford Button-Down Shirt", price: 45, category: "Men", subCategory: "Topwear",
    sizes: ["S","M","L","XL"], bestseller: false,
    imageQuery: "men striped oxford shirt",
    description: "Crafted from Oxford weave fabric with a clean stripe pattern. Perfect for smart-casual occasions.",
  },
  {
    name: "Men Linen Casual Shirt", price: 40, category: "Men", subCategory: "Topwear",
    sizes: ["M","L","XL","XXL"], bestseller: false,
    imageQuery: "men linen casual shirt summer",
    description: "Lightweight linen construction keeps you cool and comfortable. An effortless summer essential.",
  },
  {
    name: "Men Graphic Print Oversized Tee", price: 30, category: "Men", subCategory: "Topwear",
    sizes: ["S","M","L","XL"], bestseller: true,
    imageQuery: "men oversized graphic tee streetwear",
    description: "Bold graphic print on a relaxed oversized silhouette. A streetwear staple for the modern wardrobe.",
  },

  // ── MEN BOTTOMWEAR ──
  {
    name: "Men Slim Fit Stretch Chinos", price: 55, category: "Men", subCategory: "Bottomwear",
    sizes: ["S","M","L","XL"], bestseller: true,
    imageQuery: "men slim fit chino pants",
    description: "Four-way stretch fabric ensures all-day comfort without sacrificing a sharp silhouette.",
  },
  {
    name: "Men Relaxed Fit Cargo Pants", price: 60, category: "Men", subCategory: "Bottomwear",
    sizes: ["M","L","XL","XXL"], bestseller: false,
    imageQuery: "men cargo pants relaxed fit",
    description: "Multiple utility pockets with a comfortable relaxed fit. Built for both style and functionality.",
  },
  {
    name: "Men Skinny Fit Ripped Jeans", price: 65, category: "Men", subCategory: "Bottomwear",
    sizes: ["S","M","L","XL"], bestseller: true,
    imageQuery: "men skinny ripped jeans",
    description: "Distressed detailing on a sleek skinny cut. A go-to denim option for an edgy everyday look.",
  },
  {
    name: "Men Regular Fit Jogger Pants", price: 45, category: "Men", subCategory: "Bottomwear",
    sizes: ["S","M","L","XL"], bestseller: false,
    imageQuery: "men jogger pants casual",
    description: "Elasticated waist and tapered cuffs make these joggers the perfect blend of comfort and style.",
  },
  {
    name: "Men Straight Fit Classic Denim Jeans", price: 70, category: "Men", subCategory: "Bottomwear",
    sizes: ["S","M","L","XL","XXL"], bestseller: true,
    imageQuery: "men straight fit blue denim jeans",
    description: "A wardrobe essential in classic indigo wash. Straight-leg cut works effortlessly with any top.",
  },

  // ── MEN WINTERWEAR ──
  {
    name: "Men Quilted Puffer Jacket", price: 120, category: "Men", subCategory: "Winterwear",
    sizes: ["S","M","L","XL"], bestseller: true,
    imageQuery: "men quilted puffer jacket winter",
    description: "Insulated quilted construction traps heat effectively while keeping a lightweight feel.",
  },
  {
    name: "Men Hooded Fleece Sweatshirt", price: 65, category: "Men", subCategory: "Winterwear",
    sizes: ["S","M","L","XL","XXL"], bestseller: true,
    imageQuery: "men hooded fleece sweatshirt",
    description: "Plush fleece interior for maximum warmth. Kangaroo pocket and adjustable drawstring hood.",
  },
  {
    name: "Men Wool Blend Overcoat", price: 180, category: "Men", subCategory: "Winterwear",
    sizes: ["M","L","XL"], bestseller: false,
    imageQuery: "men wool overcoat long elegant",
    description: "Premium wool-blend fabric with a tailored long silhouette. Elevates any outfit instantly.",
  },
  {
    name: "Men Sherpa-Lined Denim Jacket", price: 110, category: "Men", subCategory: "Winterwear",
    sizes: ["S","M","L","XL"], bestseller: true,
    imageQuery: "men sherpa lined denim jacket",
    description: "Classic denim outer shell with cozy sherpa lining. The perfect transitional layer.",
  },
  {
    name: "Men Turtleneck Ribbed Sweater", price: 55, category: "Men", subCategory: "Winterwear",
    sizes: ["S","M","L"], bestseller: false,
    imageQuery: "men ribbed turtleneck sweater",
    description: "Fine ribbed knit with a high turtleneck for sophisticated cold-weather dressing.",
  },

  // ── WOMEN TOPWEAR ──
  {
    name: "Women Floral Print Wrap Blouse", price: 38, category: "Women", subCategory: "Topwear",
    sizes: ["XS","S","M","L"], bestseller: true,
    imageQuery: "women floral wrap blouse fashion",
    description: "Feminine floral print on a flattering wrap silhouette. Light and breezy for warm days.",
  },
  {
    name: "Women Ribbed Crop Tank Top", price: 22, category: "Women", subCategory: "Topwear",
    sizes: ["XS","S","M","L","XL"], bestseller: true,
    imageQuery: "women ribbed crop tank top",
    description: "Stretchy ribbed fabric hugs the body with a cropped length. Pairs perfectly with high-waist bottoms.",
  },
  {
    name: "Women Puff Sleeve Chiffon Blouse", price: 42, category: "Women", subCategory: "Topwear",
    sizes: ["S","M","L"], bestseller: false,
    imageQuery: "women puff sleeve chiffon blouse",
    description: "Dramatic puff sleeves add volume and elegance. Lightweight chiffon flows gracefully.",
  },
  {
    name: "Women Off-Shoulder Ruffle Top", price: 40, category: "Women", subCategory: "Topwear",
    sizes: ["XS","S","M","L"], bestseller: true,
    imageQuery: "women off shoulder ruffle top",
    description: "Playful ruffle trim on an off-shoulder neckline. Perfect for a romantic, feminine look.",
  },
  {
    name: "Women Tie-Front Gingham Shirt", price: 45, category: "Women", subCategory: "Topwear",
    sizes: ["S","M","L","XL"], bestseller: false,
    imageQuery: "women tie front gingham shirt",
    description: "Classic gingham print with a trendy tie-front detail. Great for casual daytime styling.",
  },

  // ── WOMEN BOTTOMWEAR ──
  {
    name: "Women High-Waist Skinny Jeans", price: 60, category: "Women", subCategory: "Bottomwear",
    sizes: ["XS","S","M","L","XL"], bestseller: true,
    imageQuery: "women high waist skinny jeans",
    description: "High-rise waistband elongates the silhouette. Skinny fit denim with just the right stretch.",
  },
  {
    name: "Women Pleated Midi Skirt", price: 50, category: "Women", subCategory: "Bottomwear",
    sizes: ["XS","S","M","L"], bestseller: true,
    imageQuery: "women pleated midi skirt fashion",
    description: "Elegant pleated fabric flows beautifully at midi length. Transitions effortlessly from day to night.",
  },
  {
    name: "Women Wide Leg Linen Pants", price: 55, category: "Women", subCategory: "Bottomwear",
    sizes: ["S","M","L","XL"], bestseller: false,
    imageQuery: "women wide leg linen pants",
    description: "Breathable linen in a relaxed wide-leg cut. Effortlessly chic for warm-weather dressing.",
  },
  {
    name: "Women Satin Slip Midi Skirt", price: 58, category: "Women", subCategory: "Bottomwear",
    sizes: ["XS","S","M","L","XL"], bestseller: true,
    imageQuery: "women satin slip skirt midi",
    description: "Luxurious satin finish with a subtle bias cut. Dress up or down for versatile styling.",
  },
  {
    name: "Women Ripped Boyfriend Jeans", price: 65, category: "Women", subCategory: "Bottomwear",
    sizes: ["S","M","L","XL"], bestseller: false,
    imageQuery: "women ripped boyfriend jeans",
    description: "Relaxed boyfriend fit with distressed detailing for a cool, laid-back aesthetic.",
  },

  // ── WOMEN WINTERWEAR ──
  {
    name: "Women Double-Breasted Wool Coat", price: 160, category: "Women", subCategory: "Winterwear",
    sizes: ["XS","S","M","L"], bestseller: true,
    imageQuery: "women double breasted wool coat elegant",
    description: "Structured double-breasted silhouette in premium wool. A statement outerwear piece for winter.",
  },
  {
    name: "Women Oversized Teddy Fleece Jacket", price: 90, category: "Women", subCategory: "Winterwear",
    sizes: ["S","M","L","XL"], bestseller: true,
    imageQuery: "women teddy fleece jacket oversized",
    description: "Ultra-soft teddy fleece in an cozy oversized fit. The ultimate comfort layer for cold days.",
  },
  {
    name: "Women Cropped Puffer Jacket", price: 110, category: "Women", subCategory: "Winterwear",
    sizes: ["XS","S","M","L"], bestseller: false,
    imageQuery: "women cropped puffer jacket winter",
    description: "Cropped silhouette with warm insulation. Pairs perfectly with high-waist jeans or skirts.",
  },
  {
    name: "Women Belted Trench Coat", price: 150, category: "Women", subCategory: "Winterwear",
    sizes: ["XS","S","M","L","XL"], bestseller: true,
    imageQuery: "women belted trench coat classic",
    description: "A classic trench with a cinched waist belt for a polished, timeless silhouette.",
  },
  {
    name: "Women Zip-Up Velvet Hoodie", price: 80, category: "Women", subCategory: "Winterwear",
    sizes: ["S","M","L","XL"], bestseller: true,
    imageQuery: "women velvet zip hoodie cozy",
    description: "Luxuriously soft velvet with a full zip closure. Cozy meets stylish in this statement hoodie.",
  },

  // ── KIDS TOPWEAR ──
  {
    name: "Kids Dino Print Crew Neck Tee", price: 18, category: "Kids", subCategory: "Topwear",
    sizes: ["3-4Y","5-6Y","7-8Y","9-10Y"], bestseller: true,
    imageQuery: "kids dinosaur print t-shirt children",
    description: "Fun dinosaur prints on soft cotton fabric. Kids will love the playful design and comfortable fit.",
  },
  {
    name: "Kids Superhero Graphic Tee", price: 19, category: "Kids", subCategory: "Topwear",
    sizes: ["3-4Y","5-6Y","7-8Y","9-10Y"], bestseller: true,
    imageQuery: "kids superhero graphic t-shirt",
    description: "Bold superhero artwork on durable cotton. Perfect for little adventurers on the go.",
  },
  {
    name: "Kids Striped Polo Shirt", price: 22, category: "Kids", subCategory: "Topwear",
    sizes: ["3-4Y","5-6Y","7-8Y"], bestseller: false,
    imageQuery: "kids striped polo shirt children",
    description: "Smart striped polo in easy-care fabric. Great for school or casual outings.",
  },
  {
    name: "Kids Space Print Cotton T-Shirt", price: 18, category: "Kids", subCategory: "Topwear",
    sizes: ["3-4Y","5-6Y","7-8Y"], bestseller: true,
    imageQuery: "kids space planet print t-shirt",
    description: "Out-of-this-world space prints spark imagination. Soft cotton keeps kids comfy all day.",
  },
  {
    name: "Kids Animal Print Button Shirt", price: 25, category: "Kids", subCategory: "Topwear",
    sizes: ["3-4Y","5-6Y","7-8Y","9-10Y"], bestseller: false,
    imageQuery: "kids animal print button shirt children",
    description: "Adorable animal motifs on a classic button-up. Easy to wear and even easier to love.",
  },

  // ── KIDS BOTTOMWEAR ──
  {
    name: "Kids Elastic Waist Jogger Pants", price: 25, category: "Kids", subCategory: "Bottomwear",
    sizes: ["3-4Y","5-6Y","7-8Y","9-10Y"], bestseller: true,
    imageQuery: "kids jogger pants elastic waist",
    description: "Soft elastic waist for easy dressing. Tapered fit keeps them looking neat while playing.",
  },
  {
    name: "Kids Pull-On Denim Jeans", price: 30, category: "Kids", subCategory: "Bottomwear",
    sizes: ["5-6Y","7-8Y","9-10Y"], bestseller: false,
    imageQuery: "kids pull on denim jeans children",
    description: "No-fuss pull-on waistband with the classic denim look. Durable enough for active kids.",
  },
  {
    name: "Kids Floral Print Leggings", price: 18, category: "Kids", subCategory: "Bottomwear",
    sizes: ["5-6Y","7-8Y","9-10Y","11-12Y"], bestseller: true,
    imageQuery: "kids girls floral leggings",
    description: "Stretchy floral leggings in soft jersey fabric. Great for mixing and matching any top.",
  },
  {
    name: "Kids Active Track Pants", price: 24, category: "Kids", subCategory: "Bottomwear",
    sizes: ["5-6Y","7-8Y","9-10Y","11-12Y"], bestseller: true,
    imageQuery: "kids active track pants sport",
    description: "Moisture-wicking fabric for active play. Side pockets and elastic cuffs for a sporty look.",
  },
  {
    name: "Kids Slim Fit Chino Pants", price: 26, category: "Kids", subCategory: "Bottomwear",
    sizes: ["3-4Y","5-6Y","7-8Y","9-10Y"], bestseller: false,
    imageQuery: "kids chino pants slim fit",
    description: "Neat chino cut in soft stretch fabric. Smart enough for school, comfortable enough for play.",
  },

  // ── KIDS WINTERWEAR ──
  {
    name: "Kids Hooded Puffer Jacket", price: 55, category: "Kids", subCategory: "Winterwear",
    sizes: ["3-4Y","5-6Y","7-8Y","9-10Y"], bestseller: true,
    imageQuery: "kids hooded puffer jacket winter children",
    description: "Lightweight yet warm puffer insulation with a cozy hood. Keeps little ones toasty in the cold.",
  },
  {
    name: "Kids Fleece Zip-Up Hoodie", price: 38, category: "Kids", subCategory: "Winterwear",
    sizes: ["5-6Y","7-8Y","9-10Y"], bestseller: true,
    imageQuery: "kids fleece zip hoodie children",
    description: "Soft anti-pill fleece with full zip. An essential layering piece for chilly weather.",
  },
  {
    name: "Kids Cable Knit Crew Neck Sweater", price: 32, category: "Kids", subCategory: "Winterwear",
    sizes: ["3-4Y","5-6Y","7-8Y"], bestseller: false,
    imageQuery: "kids cable knit sweater children",
    description: "Classic cable knit texture in warm acrylic blend. Cozy and stylish for winter days.",
  },
  {
    name: "Kids Sherpa Lined Bomber Jacket", price: 60, category: "Kids", subCategory: "Winterwear",
    sizes: ["5-6Y","7-8Y","9-10Y","11-12Y"], bestseller: false,
    imageQuery: "kids sherpa bomber jacket children",
    description: "Sherpa lining inside a cool bomber silhouette. Warm, stylish, and kid-approved.",
  },
  {
    name: "Kids Cozy Plaid Flannel Shirt Jacket", price: 48, category: "Kids", subCategory: "Winterwear",
    sizes: ["3-4Y","5-6Y","7-8Y"], bestseller: true,
    imageQuery: "kids plaid flannel shirt jacket",
    description: "Brushed flannel in classic plaid. Wear open as a jacket or buttoned as a shirt.",
  },
  {
    name: "Kids Faux Fur Trim Parka Coat", price: 70, category: "Kids", subCategory: "Winterwear",
    sizes: ["3-4Y","5-6Y","7-8Y","9-10Y"], bestseller: false,
    imageQuery: "kids parka coat faux fur hood children",
    description: "Long parka silhouette with faux fur hood trim. Maximum warmth for the coldest days.",
  },
  {
    name: "Kids Chunky Knit Cardigan", price: 35, category: "Kids", subCategory: "Winterwear",
    sizes: ["5-6Y","7-8Y","9-10Y"], bestseller: false,
    imageQuery: "kids chunky knit cardigan children",
    description: "Chunky open-knit cardigan in soft yarn. Easy to layer over any outfit for extra warmth.",
  },
  {
    name: "Kids Thermal Lined Jogger Set", price: 45, category: "Kids", subCategory: "Winterwear",
    sizes: ["5-6Y","7-8Y","9-10Y","11-12Y"], bestseller: false,
    imageQuery: "kids thermal jogger set winter",
    description: "Thermal-lined joggers with matching top. A complete cozy set for cold-weather comfort.",
  },
];

// ── Main ──────────────────────────────────────────────────────────────────────
const seedNewProducts = async () => {
  try {
    console.log(`🚀 Seeding ${NEW_PRODUCTS.length} products...\n`);
    const products = [];

    for (let i = 0; i < NEW_PRODUCTS.length; i++) {
      const { imageQuery, description, ...raw } = NEW_PRODUCTS[i];

      try {
        // 1. Tìm ảnh Unsplash
        const unsplashUrl = await fetchUnsplashImage(imageQuery);
        if (!unsplashUrl) throw new Error("No image found");

        // 2. Upload thẳng URL lên Cloudinary
        const cloudUrl = await uploadFromUrl(unsplashUrl);
        console.log(`✅ [${i + 1}/${NEW_PRODUCTS.length}] "${raw.name}"`);

        products.push({
          ...raw,
          description,
          image: [cloudUrl],
          quantity: Math.floor(Math.random() * 150) + 10,
          promotionIds: [],
          date: Date.now(),
        });

        // Tránh rate limit Unsplash (50 req/hour free tier)
        await new Promise((r) => setTimeout(r, 1200));

      } catch (err) {
        console.warn(`⚠️  [${i + 1}] Skipped "${raw.name}": ${err.message}`);
      }
    }

    await productModel.insertMany(products, { ordered: false });
    console.log(`\n🔥 ADDED ${products.length}/${NEW_PRODUCTS.length} PRODUCTS SUCCESSFULLY!`);
    process.exit(0);
  } catch (err) {
    console.error("❌ ERROR:", err);
    process.exit(1);
  }
};

seedNewProducts();