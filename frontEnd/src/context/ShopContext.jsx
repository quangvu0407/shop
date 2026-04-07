import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../customize/axios";

export const ShopContext = createContext();

const ShopContextProvider = (props) => {

  const currency = '$';
  const delivery_fee = 10;
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [token, setToken] = useState('');
  const navigate = useNavigate();

  const addToCart = async (itemId, size) => {
    if (!size) {
      toast.error("Please Choose size of product!");
      return;
    }

    // 1. Cập nhật Local State (để giao diện thay đổi ngay lập tức - Optimistic Update)
    let cartData = [...cartItems]; // Giả sử cartItems lúc này là một Array

    const itemIndex = cartData.findIndex(
      (item) => item.productId === itemId && item.size === size
    );

    if (itemIndex > -1) {
      // Nếu đã có trong mảng, tăng số lượng
      cartData[itemIndex].quantity += 1;
    } else {
      // Nếu chưa có, thêm Object mới vào mảng
      cartData.push({ productId: itemId, size, quantity: 1 });
    }

    setCartItems(cartData);

    // 2. Gửi dữ liệu lên Backend qua Axios
    if (token) {
      try {
        // Đảm bảo URL này khớp với route bạn đã đặt ở Backend
        const response = await axiosInstance.post('/cart/add', { itemId, size });
        if (response.success) {
          toast.success("Added to cart!");
        }
      } catch (error) {
        console.log(error);
        toast.error(error.response?.data?.message || "Failed to add to cart");
      }
    }
  };

  const getUserCart = async () => {
    try {
      const response = await axiosInstance.get("/cart/get", {});
      if (response.success) {
        setCartItems(response.cartData);
        // Fetch các product trong cart mà chưa có trong products state
        if (response.cartData?.length > 0) {
          const missingIds = response.cartData
            .map((i) => i.productId)
            .filter((id) => !products.some((p) => String(p._id) === String(id)));
          if (missingIds.length > 0) {
            const batchRes = await axiosInstance.post("/product/batch", { ids: missingIds });
            if (batchRes.success && batchRes.products?.length > 0) {
              setProducts((prev) => {
                const existingIds = new Set(prev.map((p) => String(p._id)));
                const newOnes = batchRes.products.filter((p) => !existingIds.has(String(p._id)));
                return [...prev, ...newOnes];
              });
            }
          }
        }
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Failed to load cart");
    }
  };

  const clearCart = async () => {
    try {
      const response = await axiosInstance.post("/cart/clear", {});
      if (response.success) {
        setCartItems([]);
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Failed to clear cart");
    }
  };

  const getCartCount = () => {
    if (!Array.isArray(cartItems)) return 0;
    return cartItems.reduce((total, item) => total + (Number(item.quantity) || 0), 0);
  }
  const getProductsData = async () => {
    try {
      // Load only first page for homepage instead of full list to reduce payload.
      const data = await axiosInstance.get("/product/listpage?page=1&limit=20");
      if (data.success) {
        setProducts(data.data || []);
        return;
      }
      toast.error(data.message || "Failed to load products");
    } catch (firstError) {
      try {
        // Retry once to reduce intermittent gateway/service hiccups.
        const retryData = await axiosInstance.get("/product/listpage?page=1&limit=20");
        if (retryData.success) {
          setProducts(retryData.data || []);
          return;
        }
        toast.error(retryData.message || "Failed to load products");
      } catch (retryError) {
        console.error("Load products failed twice:", retryError);
        toast.error(retryError?.response?.data?.message || "Cannot load products right now");
      }
      console.error("First load attempt failed:", firstError);
    }
  };

  useEffect(() => {
    getProductsData();
  }, [])

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken && storedToken !== "undefined" && storedToken !== "null") {
      setToken(storedToken);
    }
  }, []);

  useEffect(() => {
    if (token) {
      getUserCart();
    }
  }, [token]);

  const updateQuantity = async (itemId, size, quantity) => {
    let cartData = structuredClone(cartItems);
    const itemIndex = cartData.findIndex(
      (item) => item.productId === itemId && item.size === size
    );

    if (itemIndex === -1) return;

    if (quantity === 0) {
      cartData.splice(itemIndex, 1);
    } else {
      cartData[itemIndex].quantity = quantity;
    }

    setCartItems(cartData);

    if (token) {
      try {
        await axiosInstance.post(
          "/cart/update",
          { itemId, size, quantity },
        );
      } catch (error) {
        console.log(error);
        toast.error(error.message);
      }
    }
  }

  const getCartAmount = () => {
    if (!Array.isArray(cartItems)) return 0;
    return cartItems.reduce((total, item) => {
      const product = products.find(
        (p) => String(p._id) === String(item.productId)
      );
      if (!product) return total;
      return total + product.price * (Number(item.quantity) || 0);
    }, 0);
  };

  const value = {
    products, currency, delivery_fee,
    search, setSearch, showSearch, setShowSearch,
    cartItems, addToCart, getCartCount, updateQuantity,
    getCartAmount, navigate, setToken, token, getUserCart, setCartItems, clearCart
  }


  return (
    <ShopContext.Provider value={value}>
      {
        props.children
      }
    </ShopContext.Provider>
  )
}

export default ShopContextProvider