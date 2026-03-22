import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../../context/ShopContext'
import Title from '../Title';
import ProductItems from './ProductItems';
import AllProducts from './AllProducts';

const BestSeller = () => {

  const { products } = useContext(ShopContext);
  const [bestSeller, setBestSeller] = useState([]);

  useEffect(() => {
    const bestProduct = products.filter((item) => (item.bestseller));
    setBestSeller(bestProduct.slice(0, 10));
  }, [products])
  return (
    <div className='my-10'>
      <div className='text-center text-3xl py-8'>
        <Title text1={'BEST'} text2={'SELLER'} />
        <p className='w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600'>
          Check out our best-selling clothing collection, featuring customer favorites, trendy outfits, and high-quality fabrics. Experience top-rated styles, comfortable fits, and long-lasting quality that everyone loves at great prices.
        </p>
      </div>

      <AllProducts lastProducts={bestSeller} />
    </div>
  )
}

export default BestSeller