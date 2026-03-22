import React from 'react'
import Title from '../Title'
import { assets } from '../../assets/assets';
import NewsletterBox from '../Contact/NewsletterBox'

const Abouts = () => {
  return (
    <div className="pb-8">
      <div className="text-center pt-10 sm:pt-12 border-t">
        <Title text1="VỀ" text2="CHÚNG TÔI" className="justify-center" />
        <p className="text-stone-500 text-sm mt-2 max-w-lg mx-auto">
          Cửa hàng thời trang hiện đại, mang đến phong cách và sự tự tin cho bạn mỗi ngày.
        </p>
      </div>

      <div className="my-12 flex flex-col md:flex-row gap-10 md:gap-16 items-start">
        <img
          className="w-full md:max-w-[450px] rounded-2xl shadow-md border border-stone-200 object-cover"
          src={assets.about_img}
          alt=""
        />
        <div className="flex flex-col justify-center gap-6 md:flex-1 text-stone-600 leading-relaxed">
          <p>
            Welcome to our fashion store – your go-to destination for trendy and high-quality clothing.
            We specialize in providing stylish outfits including t-shirts, shirts, dresses,
            jeans, and seasonal fashion items at affordable prices.
          </p>

          <p>
            Every piece in our collection is carefully selected to ensure comfort, quality,
            and modern design. Whether you are looking for casual wear, office outfits,
            or something special for an event, we have something for you.
          </p>

          <b className="text-stone-900 text-lg">Sứ mệnh</b>
          <p>
            Our mission is to help you express your personal style with confidence.
            We are committed to providing high-quality fashion products,
            easy and secure shopping experiences, fast delivery,
            and friendly customer support.
            Your satisfaction is our priority.
          </p>
        </div>
      </div>

      <div className="text-xl py-6">
        <Title text1="VÌ SAO" text2="CHỌN CHÚNG TÔI" />
      </div>

      <div className="flex flex-col md:flex-row text-sm mb-20 gap-4">
        <div className="flex-1 border border-stone-200 bg-white px-8 md:px-10 py-8 sm:py-12 flex flex-col gap-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <b className="text-lg text-stone-900">Thời trang xu hướng</b>
          <p>
            Cập nhật liên tục các mẫu quần áo mới nhất, phù hợp với phong cách hiện đại.
          </p>
        </div>

        <div className="flex-1 border border-stone-200 bg-white px-8 md:px-10 py-8 sm:py-12 flex flex-col gap-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <b className="text-lg text-stone-900">Chất lượng đảm bảo</b>
          <p>
            Chất liệu thoải mái, đường may chắc chắn, đảm bảo độ bền và sự dễ chịu khi mặc.
          </p>
        </div>

        <div className="flex-1 border border-stone-200 bg-white px-8 md:px-10 py-8 sm:py-12 flex flex-col gap-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <b className="text-lg text-stone-900">Dịch vụ tận tâm</b>
          <p>
            Hỗ trợ tư vấn chọn size, mix đồ và chăm sóc khách hàng nhanh chóng, chuyên nghiệp.
          </p>
        </div>
      </div>

      <NewsletterBox />
    </div>
  )
}

export default Abouts