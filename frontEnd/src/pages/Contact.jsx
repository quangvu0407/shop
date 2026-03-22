import React from "react";
import Title from "../components/Title";
import { assets } from "../assets/assets";
import NewsletterBox from "../components/Contact/NewsletterBox";

const Contact = () => {
  return (
    <div className="border-t pb-8">
      <div className="text-center pt-10 sm:pt-12 pb-4">
        <Title text1="LIÊN" text2="HỆ" className="justify-center" />
        <p className="text-stone-500 text-sm mt-2 max-w-md mx-auto">
          Ghé cửa hàng hoặc liên hệ qua điện thoại và email — chúng tôi luôn sẵn sàng hỗ trợ.
        </p>
      </div>

      <div className="my-10 flex flex-col justify-center md:flex-row gap-10 md:gap-14 mb-20 items-stretch">
        <div className="w-full md:max-w-[480px] shrink-0">
          <img
            className="w-full rounded-2xl shadow-md border border-stone-200 object-cover aspect-[4/3] md:aspect-auto md:h-full md:min-h-[320px]"
            src={assets.contact_img}
            alt="Cửa hàng"
          />
        </div>
        <div className="flex flex-col justify-center gap-6 md:flex-1 text-stone-600">
          <div>
            <p className="font-semibold text-lg text-stone-900">Cửa hàng</p>
            <p className="mt-2 text-stone-600 leading-relaxed">
              Tòa 21A Tố Hữu
              <br />
              Cầu Giấy, Hà Nội, Việt Nam
            </p>
          </div>
          <div>
            <p className="font-semibold text-lg text-stone-900">Liên hệ</p>
            <p className="mt-2 text-stone-600 leading-relaxed">
              Tel: (+84) 312324395
              <br />
              Email: trantuyenquang001@gmail.com
            </p>
          </div>
          <div>
            <p className="font-semibold text-lg text-stone-900">Tuyển dụng</p>
            <p className="mt-1 text-stone-600">
              Tìm hiểu thêm về đội ngũ và vị trí đang tuyển.
            </p>
            <button
              type="button"
              className="mt-4 border border-stone-900 text-stone-900 px-8 py-3 text-sm font-medium rounded-xl hover:bg-stone-900 hover:text-white transition-colors duration-300"
            >
              Tuyển dụng
            </button>
          </div>
        </div>
      </div>

      <NewsletterBox />
    </div>
  );
};

export default Contact;
