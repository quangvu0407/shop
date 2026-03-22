import commentModel from "../models/commentModel.js";

const normalizeRate = (rate) => {
  const n = Number(rate);
  if (Number.isNaN(n)) return null;
  const r = Math.round(n);
  if (r < 0 || r > 5) return null;
  return r;
};

export const createComment = async ({ userId, Id, description, rate }) => {
  const productId = String(Id ?? "").trim();
  if (!productId) throw new Error("Thiếu Id sản phẩm");

  const text = String(description ?? "").trim();
  if (!text) throw new Error("Nội dung bình luận không được để trống");

  const normalizedRate = normalizeRate(rate);
  if (normalizedRate === null) throw new Error("Đánh giá phải từ 0 đến 5");

  const doc = new commentModel({
    userId: String(userId),
    Id: productId,
    description: text,
    rate: normalizedRate,
    date: Date.now(),
  });
  return await doc.save();
};

export const listCommentsByProductId = async (productId) => {
  const id = String(productId ?? "").trim();
  if (!id) return [];
  return await commentModel.find({ Id: id }).sort({ date: -1 }).lean();
};
