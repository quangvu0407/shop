export const normalizeData = (data) => {
  const result = { ...data }

  if (typeof result.bestseller === "string") {
    result.bestseller = result.bestseller === "true"; // "true" → true, "false" → false
  }

  ["price", "quantity"].forEach((field) => {
    if (typeof result[field] === "string" && result[field] !== "") {
      const num = Number(result[field]);
      if (!isNaN(num)) result[field] = num;
    }
  })
  console.log("--- DEBUG RESULT ---");
  console.log("Giá trị của result là:", result);
  console.log("Kiểu dữ liệu của result là:", typeof result);

  ["sizes", "promotionIds"].forEach((field) => {
    // Kiểm tra xem field có tồn tại trong result không trước khi xử lý
    result.sizes = result.sizes || [];
    result.promotionIds = result.promotionIds || [];
    if (result[field] && typeof result[field] === "string") {
      try {
        result[field] = JSON.parse(result[field]);
      } catch (e) {
        console.error(`Lỗi parse field ${field}:`, e.message);
        result[field] = []; // Nếu parse lỗi thì mặc định là mảng rỗng
      }
    }
  });

  return result;
}