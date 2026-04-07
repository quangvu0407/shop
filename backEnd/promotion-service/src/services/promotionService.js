import promotionModel from "../models/promotionModel.js";

export const createPromotion = async (data) => {
  const promo = new promotionModel(data);
  return await promo.save();
};

export const getAllPromotions = async () => {
  return await promotionModel.find({}).sort({ createdAt: -1 });
};

// Lấy mã dành cho user: global chưa dùng + assigned cho user này
export const getPromotionsForUser = async (userId) => {
  const now = new Date();
  return await promotionModel.find({
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now },
    usedByUsers: { $ne: String(userId) }, // user chưa dùng mã này
    $or: [
      { assignedUsers: { $size: 0 } },    // global
      { assignedUsers: String(userId) },   // gán riêng cho user
    ],
    $expr: {
      $or: [
        { $eq: ["$usageLimit", 0] },
        { $lt: ["$usedCount", "$usageLimit"] },
      ],
    },
  }).sort({ type: 1, createdAt: -1 });
};

export const updatePromotion = async (id, data) => {
  return await promotionModel.findByIdAndUpdate(id, data, { new: true });
};

export const deletePromotion = async (id) => {
  return await promotionModel.findByIdAndDelete(id);
};

export const applyPromoCode = async (code, orderAmount, userId) => {
  const promo = await promotionModel.findOne({ code: code.toUpperCase() });

  if (!promo) return { valid: false, message: "Mã khuyến mãi không tồn tại" };
  if (!promo.isActive) return { valid: false, message: "Mã khuyến mãi không còn hiệu lực" };

  const now = new Date();
  if (now < promo.startDate) return { valid: false, message: "Mã chưa đến thời gian sử dụng" };
  if (now > promo.endDate) return { valid: false, message: "Mã khuyến mãi đã hết hạn" };
  if (promo.usageLimit > 0 && promo.usedCount >= promo.usageLimit)
    return { valid: false, message: "Mã khuyến mãi đã hết lượt sử dụng" };

  // Kiểm tra user đã dùng chưa
  if (promo.usedByUsers.includes(String(userId)))
    return { valid: false, message: "Bạn đã sử dụng mã này rồi" };

  // Kiểm tra quyền dùng (nếu assigned)
  if (promo.assignedUsers.length > 0 && !promo.assignedUsers.includes(String(userId)))
    return { valid: false, message: "Mã này không dành cho bạn" };

  if (orderAmount < promo.minOrderAmount)
    return { valid: false, message: `Đơn hàng tối thiểu ${promo.minOrderAmount} để dùng mã này` };

  if (promo.type === "freeship") {
    return { valid: true, discount: 0, freeShip: true, promoId: promo._id, message: "Miễn phí vận chuyển" };
  }

  let discount = (orderAmount * promo.value) / 100;
  if (promo.maxDiscount > 0) discount = Math.min(discount, promo.maxDiscount);
  discount = Math.round(discount * 100) / 100;

  return { valid: true, discount, freeShip: false, promoId: promo._id, message: `Giảm ${promo.value}%` };
};

// Sau khi đặt hàng: tăng usedCount + track userId đã dùng + xóa khỏi assignedUsers nếu gán riêng
export const confirmUsage = async (promoId, userId) => {
  const promo = await promotionModel.findById(promoId);
  if (!promo) return;

  const update = {
    $inc: { usedCount: 1 },
    $addToSet: { usedByUsers: String(userId) }, // push nếu chưa có
  };

  // Nếu là mã gán riêng thì xóa userId khỏi assignedUsers
  if (promo.assignedUsers.length > 0) {
    update.$pull = { assignedUsers: String(userId) };
  }

  await promotionModel.findByIdAndUpdate(promoId, update);
};
