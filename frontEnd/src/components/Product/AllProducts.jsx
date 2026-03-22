import React from 'react'
import ProductItems from './ProductItems'

const AllProducts = ({lastProducts}) => {
  return (
    <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6'>
      {
        lastProducts.map((item, index) => (
          <ProductItems key={index} productData={item} />
        ))
      }
    </div>
  )
}

export default AllProducts