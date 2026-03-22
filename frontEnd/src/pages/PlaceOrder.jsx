import React, { useContext, useState } from 'react'
import Title from '../components/Title'
import CartTotal from '../components/Cart/CartTotal'
import { assets } from '../assets/assets'
import { ShopContext } from '../context/ShopContext'
import axiosInstance from '../customize/axios'
import { toast } from 'react-toastify'

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

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    phone: "",
  });

  const onChangeHandler = (event) => {
    const name = event.target.name
    const value = event.target.value

    setFormData(data => ({ ...data, [name]: value }))
  }

  const onSubmitHandler = async (event) => {
    event.preventDefault()
    try {
      if (!Array.isArray(cartItems) || cartItems.length === 0) {
        toast.error("Giỏ hàng trống");
        return;
      }

      const orderItemsRaw = await Promise.all(
        cartItems.map(async (cartItem) => {
          let productInfo = products.find(
            (product) => String(product._id) === String(cartItem.productId)
          );

          if (!productInfo) {
            const productRes = await axiosInstance.get(`/product/${cartItem.productId}`);
            if (productRes.success) {
              productInfo = productRes.product;
            }
          }

          if (!productInfo) return null;

          const stock = Number(productInfo.quantity) || 0;
          const need = Number(cartItem.quantity) || 0;
          if (stock < need) {
            throw new Error(
              `Sản phẩm "${productInfo.name}" không đủ hàng (còn ${stock}, cần ${need}).`
            );
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

      if (orderItems.length === 0) {
        toast.error("Không có sản phẩm hợp lệ để đặt hàng");
        return;
      }

      let orderData = {
        address: formData,
        items: orderItems,
        amount: getCartAmount() + delivery_fee,
      };
      // console.log(orderData);

      switch (method) {
        case "cod":
          // eslint-disable-next-line no-case-declarations
          const response = await axiosInstance.post(
            "/order/place",
            orderData,
          );
          if (response.success) {
            await clearCart();
            navigate("/orders");
          } else {
            toast.error(response.message);
          }
          break;

        case "stripe":
          // eslint-disable-next-line no-case-declarations
          const responseStripe = await axiosInstance.post(
            "/order/stripe",
            orderData,
          );
          if (responseStripe.success) {
            window.location.replace(responseStripe.session_url);
          } else {
            toast.error(responseStripe.message);
          }
          break;

        case "vnpay":
          toast.info("VNPAY chưa được kích hoạt");
          break;

        default:
          break;
      }


    } catch (error) {
      console.log(error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Đặt hàng thất bại"
      );
    }
  }

  const inputClass =
    "w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-800/15 focus:border-stone-400";

  return (
    <form
      onSubmit={onSubmitHandler}
      className="flex flex-col lg:flex-row justify-between gap-10 lg:gap-16 pt-8 sm:pt-12 pb-20 min-h-[80vh] border-t bg-gradient-to-b from-stone-50/50 to-white"
    >
      <div className="flex flex-col gap-4 w-full lg:max-w-[480px]">
        <div className="mb-1">
          <Title text1="GIAO HÀNG" text2="TỚI ĐÂU" />
          <p className="text-stone-500 text-sm mt-1">
            Điền địa chỉ nhận hàng chính xác để giao đúng hẹn.
          </p>
        </div>
        <div className="flex gap-3">
          <input
            required
            onChange={onChangeHandler}
            name="firstName"
            value={formData.firstName}
            className={inputClass}
            type="text"
            placeholder="Tên"
          />
          <input
            required
            onChange={onChangeHandler}
            name="lastName"
            value={formData.lastName}
            className={inputClass}
            type="text"
            placeholder="Họ"
          />
        </div>
        <input
          required
          onChange={onChangeHandler}
          name="email"
          value={formData.email}
          className={inputClass}
          type="email"
          placeholder="Email"
        />
        <input
          required
          onChange={onChangeHandler}
          name="street"
          value={formData.street}
          className={inputClass}
          type="text"
          placeholder="Địa chỉ (số nhà, đường)"
        />
        <div className="flex gap-3">
          <input
            required
            onChange={onChangeHandler}
            name="city"
            value={formData.city}
            className={inputClass}
            type="text"
            placeholder="Thành phố"
          />
          <input
            required
            onChange={onChangeHandler}
            name="state"
            value={formData.state}
            className={inputClass}
            type="text"
            placeholder="Quận / Tỉnh"
          />
        </div>
        <div className="flex gap-3">
          <input
            required
            onChange={onChangeHandler}
            name="zipcode"
            value={formData.zipcode}
            className={inputClass}
            type="text"
            inputMode="numeric"
            placeholder="Mã bưu điện"
          />
          <input
            required
            onChange={onChangeHandler}
            name="country"
            value={formData.country}
            className={inputClass}
            type="text"
            placeholder="Quốc gia"
          />
        </div>
        <input
          required
          onChange={onChangeHandler}
          name="phone"
          value={formData.phone}
          className={inputClass}
          type="tel"
          inputMode="tel"
          placeholder="Số điện thoại"
        />
      </div>

      <div className="w-full lg:max-w-md lg:pt-2">
        <div className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 shadow-sm">
          <CartTotal />
        </div>

        <div className="mt-10">
          <Title text1="THANH" text2="TOÁN" />
          <p className="text-stone-500 text-sm mt-1 mb-4">
            Chọn phương thức thanh toán phù hợp.
          </p>
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => setMethod("stripe")}
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors cursor-pointer ${
                method === "stripe"
                  ? "border-stone-900 bg-stone-50 ring-2 ring-stone-900/10"
                  : "border-stone-200 hover:border-stone-300 bg-white"
              }`}
            >
              <span
                className={`min-w-3.5 h-3.5 rounded-full border-2 shrink-0 ${
                  method === "stripe"
                    ? "border-stone-900 bg-stone-900"
                    : "border-stone-300"
                }`}
              />
              <img className="h-5" src={assets.stripe_logo} alt="Stripe" />
            </button>
            <button
              type="button"
              onClick={() => setMethod("vnpay")}
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors cursor-pointer ${
                method === "vnpay"
                  ? "border-stone-900 bg-stone-50 ring-2 ring-stone-900/10"
                  : "border-stone-200 hover:border-stone-300 bg-white"
              }`}
            >
              <span
                className={`min-w-3.5 h-3.5 rounded-full border-2 shrink-0 ${
                  method === "vnpay"
                    ? "border-stone-900 bg-stone-900"
                    : "border-stone-300"
                }`}
              />
              <span className="text-sm font-medium text-stone-800">VNPAY</span>
            </button>
            <button
              type="button"
              onClick={() => setMethod("cod")}
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors cursor-pointer ${
                method === "cod"
                  ? "border-stone-900 bg-stone-50 ring-2 ring-stone-900/10"
                  : "border-stone-200 hover:border-stone-300 bg-white"
              }`}
            >
              <span
                className={`min-w-3.5 h-3.5 rounded-full border-2 shrink-0 ${
                  method === "cod"
                    ? "border-stone-900 bg-stone-900"
                    : "border-stone-300"
                }`}
              />
              <span className="text-sm font-medium text-stone-700">
                Thanh toán khi nhận hàng (COD)
              </span>
            </button>
          </div>

          <div className="w-full mt-8 flex justify-end">
            <button
              type="submit"
              className="w-full sm:w-auto sm:min-w-[200px] py-3.5 px-10 rounded-xl bg-stone-900 text-white text-sm font-medium hover:bg-stone-800 transition-colors"
            >
              Đặt hàng
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

export default PlaceOrder