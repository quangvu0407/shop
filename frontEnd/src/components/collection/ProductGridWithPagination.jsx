import React, { useEffect, useState } from 'react'
import ProductItems from '../Product/ProductItems'
import Pagination from '../Pagination'

const ProductGridWithPagination = ({ products, productsPerPage = 8 }) => {
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.ceil(products.length / productsPerPage)

  const indexOfLastProduct = currentPage * productsPerPage
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage

  const currentProducts = products.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  )

  // Reset về trang 1 khi danh sách product thay đổi
  useEffect(() => {
    setCurrentPage(1)
  }, [products])

  if (products.length === 0) {
    return <p className="text-center text-gray-400">No products found</p>
  }

  return (
    <>
      {/* Product grid */}
      <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6'>
        {
          currentProducts.map(item => (
            <ProductItems
              key={item._id}
              productData={item}
            />
          ))
        }
      </div>

      {/* Pagination */}
      <Pagination totalPages={totalPages} currentPage={currentPage} setCurrentPage={setCurrentPage} />
    </>
  )
}

export default ProductGridWithPagination
