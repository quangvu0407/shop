import React from 'react'
import { useParams } from 'react-router-dom'
import ProductDetail from '../components/Product/ProductDetail';

const Product = () => {
  const { productId } = useParams();

  return (
    <>
      <ProductDetail productId={productId}/>
    </>
  )
}

export default Product