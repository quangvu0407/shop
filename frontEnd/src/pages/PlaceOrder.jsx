import React, { useContext, useState, useEffect } from 'react'
import Title from '../components/Title'
import CartTotal from '../components/Cart/CartTotal'
import { assets } from '../assets/assets'
import { ShopContext } from '../context/ShopContext'
import axiosInstance from '../customize/axios'
import { toast } from 'react-toastify'
import { Tag, Truck, X, ChevronDown, ChevronUp } from 'lucide-react'

const PlaceOrder = () => {
  const [method, setMethod] = useState('cod');
  const {
    navigate,
    cartItems,
    clearCart,
    getCartAmount,
    delivery_fee,
    products,
  } = useContext(ShopContext);

  // Promo state
  const [availablePromos, setAvailablePromos] = useState([]);
  const [showPromoList, setShowPromoList] = useState(false);
  const [appliedPercent, setAppliedPercent] = useState(null);   // { code, discount, promoId }
  const [appliedFreeship, setAppliedFreeship] = useState(null); // { code, promoId }

  const cartSubtotal = getCartAmount();
  const shippingFee = appliedFreeship ? 0 : delivery_fee;
  const promoDiscount = appliedPercent ? appliedPercent.discount : 0;
  const finalAmount = Math.max(0, cartSubtotal + shippingFee - promoDiscount);

  useEffect(() => {
    axiosInstance.get("/promotion/my")
      .then(res => { if (res.success) setAvailablePromos(res.promos); })
      .catch(() => { });
  }, []);

  const handleSelectPromo = async (promo) => {
    // Toggle off nếu đã chọn
    if (appliedPercent?.promoId === String(promo._id)) { setAppliedPercent(null); return; }
    if (appliedFreeship?.promoId === String(promo._id)) { setAppliedFreeship(null); return; }

    // Kiểm tra giới hạn loại
    if (promo.type === "percent" && appliedPercent) {
      toast.error("Chỉ được dùng 1 mã giảm % — bỏ mã cũ trước"); return;
    }
    if (promo.type === "freeship" && appliedFreeship) {
      toast.error("Chỉ được dùng 1 mã freeship — bỏ mã cũ trước"); return;
    }

    try {
      const res = await axiosInstance.post("/promotion/validate", {
        code: promo.code,
        orderAmount: cartSubtotal,
      });
      if (!res.success) { toast.error(res.message); return; }

      if (res.freeShip) {
        setAppliedFreeship({ code: promo.code, promoId: res.promoId });
        toast.success("Áp dụng freeship thành công");
      } else {
        setAppliedPercent({ code: promo.code, discount: res.discount, promoId: res.promoId });
        toast.success(`Giảm $${res.discount.toFixed(2)}`);
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const isApplied = (promo) =>
    appliedPercent?.promoId === String(promo._id) ||
    appliedFreeship?.promoId === String(promo._id);

  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "",
    street: "", city: "", state: "",
    zipcode: "", country: "", phone: "",
  });

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setFormData(data => ({ ...data, [name]: value }));
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      if (!Array.isArray(cartItems) || cartItems.length === 0) {
        toast.error("Giỏ hàng trống"); return;
      }

      const orderItemsRaw = await Promise.all(
        cartItems.map(async (cartItem) => {
          let productInfo = products.find(
            (product) => String(product._id) === String(cartItem.productId)
          );
          if (!productInfo) {
            const productRes = await axiosInstance.get(`/product/${cartItem.productId}`);
            if (productRes.success) productInfo = productRes.product;
          }
          if (!productInfo) return null;

          const stock = Number(productInfo.quantity) || 0;
          const need = Number(cartItem.quantity) || 0;
          if (stock < need) {
            throw new Error(`Sản phẩm "${productInfo.name}" không đủ hàng (còn ${stock}, cần ${need}).`);
          }
          return {
            productId: cartItem.productId,
            name: productInfo.name,
            price: productInfo.price,
            image: productInfo.image,
            size: cartItem.size,
            quantity: cartItem.quantity,
          };
        })
      );
      const orderItems = orderItemsRaw.filter(Boolean);
      if (orderItems.length === 0) { toast.error("Không có sản phẩm hợp lệ"); return; }

      const orderData = {
        address: formData,
        items: orderItems,
        amount: finalAmount,
        promoIds: [
          ...(appliedPercent ? [appliedPercent.promoId] : []),
          ...(appliedFreeship ? [appliedFreeship.promoId] : []),
        ],
      };

      switch (method) {
        case "cod": {
          const response = await axiosInstance.post("/order/place", orderData);
          if (response.success) { await clearCart(); navigate("/orders"); }
          else toast.error(response.message);
          break;
        }
        case "stripe": {
          const responseStripe = await axiosInstance.post("/order/stripe", orderData);
          if (responseStripe.success) window.location.replace(responseStripe.session_url);
          else toast.error(responseStripe.message);
          break;
        }
        case "vnpay":
          toast.info("VNPAY chưa được kích hoạt"); break;
        default: break;
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || "Đặt hàng thất bại");
    }
  };

  const inputClass =
    "w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-800/15 focus:border-stone-400";

  return (
    <form
      onSubmit={onSubmitHandler}
      className="flex flex-col lg:flex-row justify-between gap-10 lg:gap-16 pt-8 sm:pt-12 pb-20 min-h-[80vh] border-t bg-gradient-to-b from-stone-50/50 to-white"
    >
      {/* ── Cột trái: địa chỉ ── */}
      <div className="flex flex-col gap-4 w-full lg:max-w-[480px]">
        <div className="mb-1">
          <Title text1="GIAO HÀNG" text2="TỚI ĐÂU" />
          <p className="text-stone-500 text-sm mt-1">Điền địa chỉ nhận hàng chính xác để giao đúng hẹn.</p>
        </div>
        <div className="flex gap-3">
          <input required onChange={onChangeHandler} name="firstName" value={formData.firstName} className={inputClass} type="text" placeholder="Tên" />
          <input required onChange={onChangeHandler} name="lastName" value={formData.lastName} className={inputClass} type="text" placeholder="Họ" />
        </div>
        <input required onChange={onChangeHandler} name="email" value={formData.email} className={inputClass} type="email" placeholder="Email" />
        <input required onChange={onChangeHandler} name="street" value={formData.street} className={inputClass} type="text" placeholder="Địa chỉ (số nhà, đường)" />
        <div className="flex gap-3">
          <input required onChange={onChangeHandler} name="city" value={formData.city} className={inputClass} type="text" placeholder="Thành phố" />
          <input required onChange={onChangeHandler} name="state" value={formData.state} className={inputClass} type="text" placeholder="Quận / Tỉnh" />
        </div>
        <div className="flex gap-3">
          <input required onChange={onChangeHandler} name="zipcode" value={formData.zipcode} className={inputClass} type="text" inputMode="numeric" placeholder="Mã bưu điện" />
          <input required onChange={onChangeHandler} name="country" value={formData.country} className={inputClass} type="text" placeholder="Quốc gia" />
        </div>
        <input required onChange={onChangeHandler} name="phone" value={formData.phone} className={inputClass} type="tel" inputMode="tel" placeholder="Số điện thoại" />
      </div>

      {/* ── Cột phải: tóm tắt + promo + thanh toán ── */}
      <div className="w-full lg:max-w-md lg:pt-2">
        <div className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 shadow-sm">
          <CartTotal />

          {/* ── Khuyến mãi ── */}
          <div className="mt-4 border-t border-stone-100 pt-4 space-y-3">

            {/* Mã đã chọn */}
            {appliedPercent && (
              <div className="flex items-center justify-between bg-orange-50 border border-orange-200 rounded-xl px-3 py-2 text-sm">
                <span className="flex items-center gap-2 text-orange-700 font-mono font-bold">
                  <Tag size={14} /> {appliedPercent.code} — -${appliedPercent.discount.toFixed(2)}
                </span>
                <button type="button" onClick={() => setAppliedPercent(null)} className="text-orange-400 hover:text-orange-600"><X size={14} /></button>
              </div>
            )}
            {appliedFreeship && (
              <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-3 py-2 text-sm">
                <span className="flex items-center gap-2 text-green-700 font-mono font-bold">
                  <Truck size={14} /> {appliedFreeship.code} — Miễn phí vận chuyển
                </span>
                <button type="button" onClick={() => setAppliedFreeship(null)} className="text-green-400 hover:text-green-600"><X size={14} /></button>
              </div>
            )}

            {/* Toggle danh sách */}
            {availablePromos.length > 0 && (
              <button
                type="button"
                onClick={() => setShowPromoList(v => !v)}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-stone-200 hover:border-stone-400 text-sm font-medium text-stone-700 transition"
              >
                <span>Chọn mã khuyến mãi ({availablePromos.length} mã)</span>
                {showPromoList ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            )}
            {availablePromos.length === 0 && (
              <p className="text-xs text-stone-400 text-center py-1">Không có mã khuyến mãi nào</p>
            )}

            {/* Danh sách mã */}
            {showPromoList && (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {availablePromos.map(promo => {
                  const applied = isApplied(promo);
                  const isPercent = promo.type === "percent";
                  return (
                    <button
                      key={promo._id}
                      type="button"
                      onClick={() => handleSelectPromo(promo)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm transition
                        ${applied
                          ? isPercent
                            ? "border-orange-400 bg-orange-50"
                            : "border-green-400 bg-green-50"
                          : "border-stone-200 hover:border-stone-400 bg-white"
                        }`}
                    >
                      <div className="flex items-center gap-3 text-left">
                        <span className={`p-1.5 rounded-lg ${isPercent ? "bg-orange-100 text-orange-600" : "bg-green-100 text-green-600"}`}>
                          {isPercent ? <Tag size={14} /> : <Truck size={14} />}
                        </span>
                        <div>
                          <p className="font-mono font-bold text-stone-800">{promo.code}</p>
                          <p className="text-xs text-stone-500">
                            {isPercent
                              ? `Giảm ${promo.value}%${promo.maxDiscount > 0 ? ` (tối đa $${promo.maxDiscount})` : ""}`
                              : "Miễn phí vận chuyển"}
                            {promo.minOrderAmount > 0 && ` · Đơn từ $${promo.minOrderAmount}`}
                          </p>
                        </div>
                      </div>
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${applied ? (isPercent ? "bg-orange-200 text-orange-700" : "bg-green-200 text-green-700") : "bg-stone-100 text-stone-500"}`}>
                        {applied ? "Đã chọn" : "Chọn"}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Tổng sau giảm */}
            {(appliedPercent || appliedFreeship) && (
              <div className="border-t border-stone-100 pt-3 space-y-1 text-sm">
                {appliedFreeship && (
                  <div className="flex justify-between text-green-600">
                    <span>Freeship</span><span>-${delivery_fee}.00</span>
                  </div>
                )}
                {appliedPercent && (
                  <div className="flex justify-between text-orange-600">
                    <span>Giảm giá</span><span>-${appliedPercent.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-stone-900 text-base pt-1">
                  <span>Tổng thanh toán</span><span>${finalAmount.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Phương thức thanh toán ── */}
        <div className="mt-10">
          <Title text1="THANH" text2="TOÁN" />
          <p className="text-stone-500 text-sm mt-1 mb-4">Chọn phương thức thanh toán phù hợp.</p>
          <div className="flex flex-col gap-3">
            {[
              { key: "stripe", label: <img className="h-5" src={assets.stripe_logo} alt="Stripe" /> },
              { key: "vnpay", label: <span className="text-sm font-medium text-stone-800">VNPAY</span> },
              { key: "cod", label: <span className="text-sm font-medium text-stone-700">Thanh toán khi nhận hàng (COD)</span> },
            ].map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setMethod(key)}
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors cursor-pointer ${method === key ? "border-stone-900 bg-stone-50 ring-2 ring-stone-900/10" : "border-stone-200 hover:border-stone-300 bg-white"}`}
              >
                <span className={`min-w-3.5 h-3.5 rounded-full border-2 shrink-0 ${method === key ? "border-stone-900 bg-stone-900" : "border-stone-300"}`} />
                {label}
              </button>
            ))}
          </div>
          <div className="w-full mt-8 flex justify-end">
            <button type="submit" className="w-full sm:w-auto sm:min-w-[200px] py-3.5 px-10 rounded-xl bg-stone-900 text-white text-sm font-medium hover:bg-stone-800 transition-colors">
              Đặt hàng
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;
