import React from 'react'
import ProductItems from '../Product/ProductItems'
import Pagination from '../Pagination'

const ProductGridWithPagination = ({ products, totalPages = 1, currentPage = 1, onPageChange }) => {
  if (products.length === 0) {
    return <p className="text-center text-gray-400">No products found</p>
  }

  return (
    <>
      <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6'>
        {products.map(item => (
          <ProductItems key={item._id} productData={item} />
        ))}
      </div>
      <Pagination totalPages={totalPages} currentPage={currentPage} setCurrentPage={onPageChange} />
    </>
  )
}

export default ProductGridWithPagination
