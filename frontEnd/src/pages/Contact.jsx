import React from "react";
import Title from "../components/Title";
import { assets } from "../assets/assets";
import NewsletterBox from "../components/Contact/NewsletterBox";

const Contact = () => {
  return (
    <div className="border-t pb-8">
      <div className="text-center pt-10 sm:pt-12 pb-4">
        <Title text1="CONTACT" text2="US" className="justify-center" />
        <p className="text-stone-500 text-sm mt-2 max-w-md mx-auto">
          Visit our store or contact us by phone and email — we're always ready to help.
        </p>
      </div>

      <div className="my-10 flex flex-col justify-center md:flex-row gap-10 md:gap-14 mb-20 items-stretch">
        <div className="w-full md:max-w-[480px] shrink-0">
          <img
            className="w-full rounded-2xl shadow-md border border-stone-200 object-cover aspect-[4/3] md:aspect-auto md:h-full md:min-h-[320px]"
            src={assets.contact_img}
            alt="Store"
          />
        </div>
        <div className="flex flex-col justify-center gap-6 md:flex-1 text-stone-600">
          <div>
            <p className="font-semibold text-lg text-stone-900">Our Store</p>
            <p className="mt-2 text-stone-600 leading-relaxed">
              Building 21A To Huu
              <br />
              Cau Giay, Hanoi, Vietnam
            </p>
          </div>
          <div>
            <p className="font-semibold text-lg text-stone-900">Contact</p>
            <p className="mt-2 text-stone-600 leading-relaxed">
              Tel: (+84) 312324395
              <br />
              Email: trantuyenquang001@gmail.com
            </p>
          </div>
          <div>
            <p className="font-semibold text-lg text-stone-900">Careers</p>
            <p className="mt-1 text-stone-600">
              Learn more about our team and open positions.
            </p>
            <button
              type="button"
              className="mt-4 border border-stone-900 text-stone-900 px-8 py-3 text-sm font-medium rounded-xl hover:bg-stone-900 hover:text-white transition-colors duration-300"
            >
              Careers
            </button>
          </div>
        </div>
      </div>

      <NewsletterBox />
    </div>
  );
};

export default Contact;
