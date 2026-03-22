import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../../context/ShopContext';
import Title from '../Title';
import AllProducts from './AllProducts';

const LastestCollection = () => {

  const { products } = useContext(ShopContext);

  const [lastProducts, setLastProducts] = useState([]);

  useEffect(() => {
    setLastProducts(products.slice(0, 10));
  }, [products])

  return (
    <div className='my-10'>
      <div className='text-center py-8 text-3xl'>
        <Title text1={'LATEST'} text2={'PRODUCTS'} />
        <p className='w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600'>
          Discover our newest clothing collections, stylish outfits, comfortable everyday wear, and premium fabrics. All products are carefully selected to ensure great fit, quality, and durability for your daily style.
        </p>
      </div>

      {/* gọi sản phẩm */}
      <AllProducts lastProducts={lastProducts} />
    </div>
  )
}

export default LastestCollection