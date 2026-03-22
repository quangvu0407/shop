import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../../context/ShopContext'
import Title from '../Title'
import { assets } from '../../assets/assets';
import CartTotal from './CartTotal';

const Cart = () => {
  const { products, currency, cartItems, updateQuantity, navigate } = useContext(ShopContext);
  const [cartData, setCartData] = useState([]);

  useEffect(() => {
    // Kiểm tra nếu cartItems là mảng và có dữ liệu products
    if (products.length > 0 && Array.isArray(cartItems)) {
      setCartData(cartItems);
    }
  }, [cartItems, products])

  const hasItems =
    Array.isArray(cartData) &&
    cartData.length > 0 &&
    cartData.some((item) =>
      products.some((p) => String(p._id) === String(item.productId))
    );

  return (
    <div className="border-t pt-10 sm:pt-14 pb-16 min-h-[50vh] bg-gradient-to-b from-stone-50/60 to-white">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <Title text1="GIỎ" text2="HÀNG" />
          <p className="text-stone-500 text-sm mt-1">
            Kiểm tra sản phẩm trước khi thanh toán.
          </p>
        </div>
      </div>

      {!hasItems ? (
        <div className="rounded-2xl border border-stone-200 bg-white p-12 text-center shadow-sm">
          <p className="text-stone-600 font-medium">Giỏ hàng đang trống</p>
          <p className="text-stone-500 text-sm mt-2 mb-6">
            Thêm sản phẩm từ bộ sưu tập để tiếp tục mua sắm.
          </p>
          <button
            type="button"
            onClick={() => navigate("/collection")}
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-stone-900 text-white text-sm font-medium hover:bg-stone-800 transition-colors"
          >
            Xem sản phẩm
          </button>
        </div>
      ) : (
        <>
          <div className="rounded-2xl border border-stone-200 bg-white shadow-sm overflow-hidden divide-y divide-stone-100">
            {cartData.map((item, index) => {
              const productData = products.find(
                (product) => String(product._id) === String(item.productId)
              );
              if (!productData) return null;

              return (
                <div
                  key={`${item.productId}-${item.size}-${index}`}
                  className="py-5 sm:py-6 text-stone-700 grid grid-cols-[3fr_1fr_1fr] md:grid-cols-[4fr_1.5fr_1fr_0.5fr] items-center gap-4 px-3 sm:px-5 hover:bg-stone-50/80 transition-colors"
                >
                  <div className="flex items-start gap-4 sm:gap-6 min-w-0">
                    <img
                      className="w-16 sm:w-24 h-20 sm:h-24 object-cover rounded-lg border border-stone-100 shrink-0"
                      src={productData.image?.[0] || ""}
                      alt=""
                    />
                    <div className="min-w-0">
                      <p className="text-sm sm:text-base font-medium text-stone-900 truncate">
                        {productData.name}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-stone-600">
                        <span>
                          {currency}
                          {productData.price}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-md bg-stone-100 text-stone-700 text-xs font-medium">
                          Size: {item.size}
                        </span>
                      </div>
                    </div>
                  </div>

                  <input
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (val > 0) {
                        updateQuantity(item.productId, item.size, val);
                      }
                    }}
                    className="text-center border border-stone-200 max-w-16 sm:max-w-20 px-2 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-stone-800/15"
                    type="number"
                    min={1}
                    defaultValue={item.quantity}
                  />

                  <p className="text-stone-900 font-medium tabular-nums">
                    {currency}
                    {Number(item.quantity * productData.price)}
                  </p>

                  <button
                    type="button"
                    onClick={() => updateQuantity(item.productId, item.size, 0)}
                    className="justify-self-end p-2 rounded-lg hover:bg-stone-100 transition-colors"
                    aria-label="Xóa khỏi giỏ"
                  >
                    <img className="w-4 sm:w-5" src={assets.bin_icon} alt="" />
                  </button>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end mt-10">
            <div className="w-full sm:w-[450px] rounded-2xl bg-white p-6 sm:p-7 shadow-sm border border-stone-200">
              <CartTotal />
              <div className="w-full text-end mt-6">
                <button
                  type="button"
                  onClick={() => navigate("/place-order")}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-stone-900 text-white text-sm font-medium hover:bg-stone-800 transition-colors"
                >
                  Thanh toán
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Cart