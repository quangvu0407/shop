import React, { useState, useEffect } from 'react'
import axiosInstance from '../../customize/axios';
import Title from '../Title';
import ProductItems from './ProductItems';
import Pagination from '../Pagination';

const ProductPagination = ({ productsPerPage = 15 }) => {
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchProducts = async (page) => {
    try {
      setLoading(true);
      const data = await axiosInstance.get(`/product/listpage?page=${page}&limit=${productsPerPage}`);

      setProducts(data.data); // danh sách sản phẩm page hiện tại
      setTotalPages(data.totalPages); // tổng số page từ backend
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };
  console.log(currentPage, totalPages);

  // Reset về trang 1 khi danh sách product thay đổi
  useEffect(() => {
    fetchProducts(currentPage)
  }, [currentPage])

  if (loading) return <p className="text-center">Loading...</p>;
  if (products.length === 0) return <p className="text-center text-gray-400">No products found</p>;


  return (
    <>
      <div className='text-center pt-8 text-3xl'>
        <Title text1={'ALL'} text2={'PRODUCTS'} />
        {/* <p className='w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600'>
          Discover our newest clothing collections, stylish outfits, comfortable everyday wear, and premium fabrics. All products are carefully selected to ensure great fit, quality, and durability for your daily style.
        </p> */}
      </div>

      {/* pagination */}
      <Pagination totalPages={totalPages} currentPage={currentPage} setCurrentPage={setCurrentPage} />
      {/* Product grid */}
      <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 gap-y-6 pt-8'>
        {
          products.map(item => (
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

export default ProductPagination