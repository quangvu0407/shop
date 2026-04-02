import React, { useContext } from "react";
import { ShopContext } from "../../context/ShopContext";
import { Link } from "react-router-dom";

const ProductItems = ({ productData }) => {
  const { currency } = useContext(ShopContext);

  return (
    <Link
      className="group block bg-white rounded-xl overflow-hidden hover:shadow-xl transition-all duration-500"
      to={`/product/${productData._id}`}
    >
      {/* Container Ảnh với hiệu ứng Zoom & Overlay nhẹ */}
      <div className="relative overflow-hidden aspect-[4/5] bg-gray-100">
        <img
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
          src={productData.image[0]}
          alt={productData.name}
        />

        {/* Lớp phủ mờ nhẹ khi hover (Optional) */}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>

      {/* Nội dung thông tin */}
      <div className="p-4 flex flex-col gap-1">
        {/* Tên sản phẩm - Giới hạn 1 dòng để tránh lệch layout */}
        <p className="text-gray-800 font-medium text-base truncate group-hover:text-green-600 transition-colors duration-300">
          {productData.name}
        </p>

        {/* Giá tiền nổi bật */}
        <div className="flex items-center justify-between mt-1">
          <p className="text-lg font-bold text-gray-900">
            {currency}
            {productData.price?.toLocaleString()}
          </p>

          {/* Một chi tiết nhỏ như icon hoặc nhãn 'New' giúp card sang hơn */}
          {productData.bestseller === true ? (
            <span className="text-[10px] font-bold px-2 py-1 bg-orange-50 text-orange-600 rounded uppercase tracking-wider">
              BestSeller
            </span>
          ) : (
            <span className="text-[10px] font-bold px-2 py-1 bg-green-50 text-green-600 rounded uppercase tracking-wider">
              Organic
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductItems;
