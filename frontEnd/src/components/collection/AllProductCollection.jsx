import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../../context/ShopContext'
import { assets } from '../../assets/assets';
import Title from '../Title';
import ProductItems from '../Product/ProductItems';
import FilterByCategories from './FilterByCategories';
import FilterByWear from './FilterByWear';
import OptionSortCollection from './OptionSortCollection';
import ProductGridWithPagination from './ProductGridWithPagination'

const AllProductCollection = () => {
  const { products, search, showSearch } = useContext(ShopContext);
  const [showFilter, setShowFilter] = useState(true);
  const [filterProduct, setFilterProduct] = useState([]);

  const [category, setCategory] = useState([]);
  const [subCategory, setSubCategory] = useState([]);

  const [sortType, setSortType] = useState('relevent');

  const toggleCategory = (ev) => {
    if (category.includes(ev.target.value)) {
      setCategory(prev => prev.filter(item => item != ev.target.value))
    }
    else {
      setCategory(prev => [...prev, ev.target.value])
    }
  }

  const toggleSubCategory = (ev) => {
    if (subCategory.includes(ev.target.value)) {
      setSubCategory(prev => prev.filter(item => item != ev.target.value))
    }
    else {
      setSubCategory(prev => [...prev, ev.target.value])
    }
  }

  const sortProduct = () => {
    let fpCopy = filterProduct.slice();
    switch (sortType) {
      case 'low-high':
        setFilterProduct(fpCopy.sort((a, b) => (a.price - b.price)));
        break;
      case 'high-low':
        setFilterProduct(fpCopy.sort((a, b) => (b.price - a.price)));
        break;
      default:
        applyFilter();
        break;
    }
  }
  const applyFilter = () => {
    let productCopy = products.slice()

    if (showSearch && search) {
      productCopy = productCopy.filter(item => item.name.toLowerCase().includes(search.toLowerCase()))
    }

    if (category.length > 0) {
      productCopy = productCopy.filter(item => category.includes(item.category));
    }

    if (subCategory.length > 0) {
      productCopy = productCopy.filter(item => subCategory.includes(item.subCategory));
    }
    console.log(products);
    setFilterProduct(productCopy)
  }

  useEffect(() => {
    setFilterProduct(products);
  }, [products])

  useEffect(() => {
    applyFilter();
  }, [category, subCategory, search, showSearch])

  useEffect(() => {
    sortProduct();
  }, [sortType])
  return (
    <>
      {/* Options */}
      <div className='min-w-60'>
        <p className='my-2 text-xl flex items-center cursor-pointer gap-2'>FILTERS
          <img onClick={() => setShowFilter(!showFilter)} className={`h-3 sm:hidden ${showFilter ? 'rotate-90' : ''}`} src={assets.dropdown_icon} />
        </p>
        {/* Filter Theo Danh mục*/}
        <FilterByCategories showFilter={showFilter} toggleCategory={toggleCategory} />
        {/* Filter Theo Quần áo */}
        <FilterByWear showFilter={showFilter} toggleSubCategory={toggleSubCategory} />
      </div>

      {/* Right slide */}

      <div className='flex-1'>

        <OptionSortCollection setSortType={setSortType} />

        {/* Product list */}
        <ProductGridWithPagination
          products={filterProduct}
          productsPerPage={8}
        />
      </div>
    </>
  )
}

export default AllProductCollection