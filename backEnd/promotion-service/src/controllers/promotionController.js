import * as svc from "../services/promotionService.js";

// Admin: tạo mã
export const create = async (req, res) => {
  try {
    const promo = await svc.createPromotion(req.body);
    res.json({ success: true, promo });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Admin: lấy tất cả
export const list = async (req, res) => {
  try {
    const promos = await svc.getAllPromotions();
    res.json({ success: true, promos });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Admin: cập nhật
export const update = async (req, res) => {
  try {
    const promo = await svc.updatePromotion(req.params.id, req.body);
    res.json({ success: true, promo });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Admin: xóa
export const remove = async (req, res) => {
  try {
    await svc.deletePromotion(req.params.id);
    res.json({ success: true, message: "Đã xóa mã khuyến mãi" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// User: lấy danh sách mã của mình
export const myPromotions = async (req, res) => {
  try {
    const promos = await svc.getPromotionsForUser(String(req.user.id));
    res.json({ success: true, promos });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// User: kiểm tra & áp dụng mã (chỉ validate, chưa tăng usedCount)
export const validate = async (req, res) => {
  try {
    const { code, orderAmount } = req.body;
    if (!code) return res.json({ success: false, message: "Thiếu mã khuyến mãi" });
    const result = await svc.applyPromoCode(code, Number(orderAmount) || 0, req.user.id);
    res.json({ success: result.valid, ...result });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Internal: track usage sau khi đặt hàng thành công
export const confirmUsage = async (req, res) => {
  try {
    const { promoId, userId } = req.body;
    if (promoId && userId) await svc.confirmUsage(promoId, userId);
    res.json({ success: true });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
