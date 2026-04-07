import { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../../context/ShopContext'
import { assets } from '../../assets/assets';
import FilterByCategories from './FilterByCategories';
import FilterByWear from './FilterByWear';
import OptionSortCollection from './OptionSortCollection';
import ProductGridWithPagination from './ProductGridWithPagination'
import axiosInstance from '../../customize/axios'

const AllProductCollection = () => {
  const { search, showSearch } = useContext(ShopContext);
  const [showFilter, setShowFilter] = useState(true);
  const [filterProduct, setFilterProduct] = useState([]);
  const [category, setCategory] = useState([]);
  const [subCategory, setSubCategory] = useState([]);
  const [sortType, setSortType] = useState('relevent');
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });

  const fetchProducts = (page = 1) => {
    const params = new URLSearchParams({ page, limit: 8 });
    if (category.length > 0) params.set('category', category.join(','));
    if (subCategory.length > 0) params.set('subCategory', subCategory.join(','));
    if (showSearch && search) params.set('search', search);
    if (sortType !== 'relevent') params.set('sort', sortType);

    axiosInstance.get(`/product/listpage?${params}`).then(data => {
      if (data.success) {
        setFilterProduct(data.data || []);
        setPagination({ page: data.page, totalPages: data.totalPages });
      }
    }).catch(console.error);
  };

  const toggleCategory = (ev) => {
    setCategory(prev =>
      prev.includes(ev.target.value) ? prev.filter(i => i !== ev.target.value) : [...prev, ev.target.value]
    );
  };

  const toggleSubCategory = (ev) => {
    setSubCategory(prev =>
      prev.includes(ev.target.value) ? prev.filter(i => i !== ev.target.value) : [...prev, ev.target.value]
    );
  };

  useEffect(() => { fetchProducts(1); }, [category, subCategory, sortType, search, showSearch]);

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
          totalPages={pagination.totalPages}
          currentPage={pagination.page}
          onPageChange={(page) => fetchProducts(page)}
        />
      </div>
    </>
  )
}

export default AllProductCollection