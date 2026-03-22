import React, { useContext, useEffect, useState, useCallback } from 'react'
import { ShopContext } from '../../context/ShopContext'
import { assets } from '../../assets/assets';
import RelatedProduct from './RelatedProduct';
import axiosInstance from '../../customize/axios';
import { toast } from 'react-toastify';

const StarRow = ({ value, max = 5, sizeClass = 'w-3.5 h-3.5' }) => (
  <span className="inline-flex items-center gap-0.5">
    {Array.from({ length: max }, (_, i) => (
      <img
        key={i}
        src={i < value ? assets.star_icon : assets.star_dull_icon}
        alt=""
        className={sizeClass}
      />
    ))}
  </span>
);

const ProductDetail = ({ productId }) => {
  const { products, currency, addToCart, token, navigate } = useContext(ShopContext);
  const [productData, setProductData] = useState(false);
  const [image, setImage] = useState('');
  const [size, setSize] = useState('');
  const [activeTab, setActiveTab] = useState('description');
  const [comments, setComments] = useState([]);
  const [reviewText, setReviewText] = useState('');
  const [reviewRate, setReviewRate] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchProductData = async () => {
    try {
      const data = await axiosInstance(`/product/${productId}`);

      if (data.success) {
        setProductData(data.product)
        if (data.product.image && data.product.image.length > 0) {
          setImage(data.product.image[0]);
        }
      }
      else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message);
    }


  }

  const fetchComments = useCallback(async () => {
    if (!productId) return;
    try {
      const data = await axiosInstance.get(`/comment/list/${productId}`);
      if (data.success) {
        setComments(Array.isArray(data.comments) ? data.comments : []);
      }
      else {
        toast.error("error")
      }
    } catch {
      setComments([]);
    }
  }, [productId]);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    fetchProductData();
  }, [productId])

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const avgRate =
    comments.length === 0
      ? null
      : comments.reduce((s, c) => s + (Number(c.rate) || 0), 0) / comments.length;

  const displayStars = avgRate == null ? 0 : Math.round(avgRate);

  const submitReview = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.info("Vui lòng đăng nhập để bình luận");
      navigate("/login");
      return;
    }
    const text = reviewText.trim();
    if (!text) {
      toast.error("Nhập nội dung bình luận");
      return;
    }
    const r = Math.round(Number(reviewRate));
    if (Number.isNaN(r) || r < 0 || r > 5) {
      toast.error("Đánh giá từ 0 đến 5 sao");
      return;
    }
    setSubmittingReview(true);
    try {
      const res = await axiosInstance.post("/comment/add", {
        Id: productId,
        description: text,
        rate: r,
      });
      if (res.success) {
        toast.success(res.message || "Đã gửi bình luận");
        setReviewText("");
        setReviewRate(5);
        fetchComments();
      } else {
        toast.error(res.message || "Gửi bình luận thất bại");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || "Gửi bình luận thất bại");
    } finally {
      setSubmittingReview(false);
    }
  };
  return productData ? (
    <div className='border-t-2 pt-10 transition-opacity ease-in duration-500 opacity-100'>
      <div className='flex gap-12 sm:gap-12 flex-col sm:flex-row'>
        {/* Product Image */}
        <div className='flex-1 flex flex-col-reverse gap-3 sm:flex-row'>
          <div className='flex sm:flex-col overflow-x-auto justify-between sm:justify-normal sm:w-[18.7%] w-full'>
            {
              productData.image.map((item, index) => (
                <img onClick={() => setImage(item)} src={item} alt='' key={index} className={`border border-gray-300 w-[24%] sm:w-full sm:mb-3 flex-shrink-0 cursor-pointer ${item === image ? 'border border-red-500' : ''}`} />
              ))
            }
          </div>

          <div className='w-full sm:w-[80%]'>
            <img className='w-full h-auto border ' src={image} alt='' />
          </div>
        </div>

        {/* chi tiết sản phẩm  */}

        <div className='flex-1'>
          <h1 className='font-medium text-2xl mt-2'>{productData.name}</h1>
          <div className='flex items-center mt-2 gap-2 flex-wrap'>
            <p className='font-medium text-stone-700'>Rate: </p>
            <StarRow value={displayStars} />
            <p className='pl-1 text-stone-500 text-sm'>
              {comments.length === 0
                ? "Chưa có đánh giá"
                : `${avgRate.toFixed(1)}/5 · ${comments.length} bình luận`}
            </p>
          </div>
          <p className='font-medium text-3xl mt-5 text-gray-400 text-green-700'>Price: {currency}  {productData.price}</p>
          <p className='text-xl mt-5 text-gray-500 md:w-4/5'>
            <span className='text-gray-700'>Description: </span>
            {productData.description}
          </p>
          <p className='text-xl mt-3 text-gray-700'>
            <span className='text-gray-700'>Quantity: </span>
            {productData.quantity}
          </p>

          <div className='flex flex-col gap-4 my-8'>
            <p className='font-medium text-xl'>Select Size:</p>
            <div className='flex gap-4'>
              {productData.sizes.map((item, index) => (
                <button onClick={() => setSize(item)} className={`border border-gray-200 px-4 py-2 ${item === size ? 'border-orange-500 text-orange-500' : ''}`} key={index}>{item}</button>
              ))}
            </div>
          </div>
          <button onClick={() => addToCart(productData._id, size)} className='border border-black-200 rounded-lg bg-orange-200 text-black px-8 py-3 text-sm active:bg-blue-500'>ADD TO CART</button>
          <hr className='mt-8 sm:w-4/5' />
          <div className='text-sm text-gray-500 mt-5 flex flex-col gap-1'>
            <p>100% Original Product</p>
            <p>Cash on delivery is available on this product</p>
            <p>Easy return and exchange policy within 7 days</p>
          </div>

        </div>

      </div>
      {/* Mô tả chi tiết và bình luận */}
      <div className='mt-20'>
        {/* Tab Buttons */}
        <div className='flex gap-2 items-center'>
          <button
            onClick={() => setActiveTab('description')}
            className={`px-6 py-3 text-sm font-medium transition-all duration-300 border rounded-t-lg cursor-pointer ${activeTab === 'description'
              ? 'border-orange-600 bg-white text-orange-600 z-10'
              : 'border-black text-gray-500'
              }`}
          >
            Description
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-6 py-3 text-sm font-medium transition-all duration-300 border rounded-t-lg -ml-px cursor-pointer ${activeTab === 'reviews'
              ? 'border-orange-600 bg-white text-orange-600 z-10'
              : 'border border-black text-gray-500'
              }`}
          >
            Đánh giá ({comments.length})
          </button>
        </div>

        {/* Tab Content Area */}
        <div className='border border-gray-200 px-8 py-8 text-sm text-gray-600 rounded-b-xl rounded-tr-xl bg-white shadow-sm -mt-[1px] mt-4'>

          {/* Nội dung Description */}
          {activeTab === 'description' && (
            <div className='flex flex-col gap-5 leading-relaxed animate-fadeIn'>
              <p>
                This device is equipped with a high-capacity battery that delivers stable and long-lasting performance throughout the day.
                With fast-charging support, you can quickly recharge and get back to using your phone without long interruptions.
                The optimized power management system helps conserve energy, ensuring efficient usage even during extended screen time.
              </p>

              <p>
                Designed for modern lifestyles, the phone also supports high-quality audio accessories such as wireless and wired earphones.
                It provides clear sound output, stable connectivity, and low latency for music, calls, and gaming.
                Whether you're charging your device or enjoying your favorite audio through headphones, this product offers convenience, reliability, and smooth everyday performance.
              </p>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="flex flex-col gap-8 animate-fadeIn">
              <form onSubmit={submitReview} className="rounded-xl border border-stone-200 bg-stone-50/60 p-4 sm:p-5 space-y-4">
                <p className="font-medium text-stone-800">Viết đánh giá</p>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm text-stone-600">Số sao (0–5):</span>
                  <div className="flex gap-1">
                    {[0, 1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setReviewRate(n)}
                        className={`min-w-9 px-2 py-1.5 text-sm rounded-lg border transition-colors ${reviewRate === n
                            ? "border-orange-500 bg-orange-50 text-orange-700 font-medium"
                            : "border-stone-200 bg-white text-stone-600 hover:border-stone-300"
                          }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                  <span className="text-sm text-stone-500 inline-flex items-center gap-1">
                    <StarRow value={reviewRate} sizeClass="w-4 h-4" />
                  </span>
                </div>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  rows={4}
                  className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500/25"
                  placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm…"
                />
                <div className="flex flex-wrap items-center justify-between gap-3">
                  {!token && (
                    <p className="text-sm text-stone-500">
                      <button
                        type="button"
                        className="text-orange-600 font-medium hover:underline"
                        onClick={() => navigate("/login")}
                      >
                        Đăng nhập
                      </button>{" "}
                      để gửi bình luận.
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="ml-auto px-6 py-2.5 rounded-xl bg-stone-900 text-white text-sm font-medium hover:bg-stone-800 disabled:opacity-60"
                  >
                    {submittingReview ? "Đang gửi…" : "Gửi đánh giá"}
                  </button>
                </div>
              </form>

              <div className="space-y-4">
                {comments.length === 0 ? (
                  <p className="text-center text-stone-500 text-sm py-8">
                    Chưa có bình luận nào. Hãy là người đầu tiên đánh giá sản phẩm.
                  </p>
                ) : (
                  comments.map((c) => (
                    <div
                      key={c._id}
                      className="rounded-xl border border-stone-100 bg-white px-4 py-3 shadow-sm"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <StarRow value={Math.round(Number(c.rate) || 0)} sizeClass="w-4 h-4" />
                        <span className="text-xs text-stone-400">
                          {new Date(c.date).toLocaleString("vi-VN")}
                        </span>
                      </div>
                      <p className="text-sm text-stone-700 whitespace-pre-wrap">{c.description}</p>
                      <p className="text-xs text-stone-400 mt-2">Người dùng · {String(c.userId).slice(-6)}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        {/* Sản phẩm tương tự */}
        <RelatedProduct category={productData.category} subCategory={productData.subCategory} />
      </div>
    </div>
  ) :
    <div className='opacity-0'></div>
}

export default ProductDetail