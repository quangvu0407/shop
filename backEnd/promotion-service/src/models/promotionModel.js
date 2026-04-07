import mongoose from "mongoose";

const promotionSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    type: { type: String, enum: ["percent", "freeship"], required: true },
    // percent: giá trị % giảm (1-100), freeship: không cần
    value: { type: Number, default: 0 },
    minOrderAmount: { type: Number, default: 0 },
    maxDiscount: { type: Number, default: 0 }, // 0 = không giới hạn (chỉ dùng cho percent)
    usageLimit: { type: Number, default: 0 },  // 0 = không giới hạn
    usedCount: { type: Number, default: 0 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    // Nếu rỗng = global cho tất cả, nếu có = chỉ những userId này mới dùng được
    assignedUsers: [{ type: String }],
    // Track userId đã dùng mã này (dùng cho cả global lẫn assigned)
    usedByUsers: [{ type: String }],
  },
  { timestamps: true }
);

const promotionModel =
  mongoose.models.promotion || mongoose.model("promotion", promotionSchema);

export default promotionModel;
