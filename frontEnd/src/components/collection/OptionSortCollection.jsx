import React from 'react'
import Title from '../Title'

const OptionSortCollection = ({ setSortType }) => {
  return (
    <>
      <div className='flex justify-between text-base sm:text-2xl mb-4 gap-3'>
        <Title text1={'ALL'} text2={'COLLECTIONS'} />
        {/* Products */}
        <select onChange={(ev) => setSortType(ev.target.value)} className='border-2 border-gray-300 text-sm px-2 rounded-md'>
          <option value="relavent">Sort by: Relavent</option>
          <option value="low-high">Sort by: Low to High</option>
          <option value="high-low">Sort by: High to Low</option>
        </select>
      </div>
    </>
  )
}

export default OptionSortCollection