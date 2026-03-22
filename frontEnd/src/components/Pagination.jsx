import React from 'react'

const Pagination = ({totalPages, currentPage, setCurrentPage}) => {
  return (
    <>
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <button
            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded disabled:opacity-40 cursor-pointer"
          >
            Prev
          </button>

          {
            Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 border rounded cursor-pointer
                  ${currentPage === page ? 'bg-black text-white' : ''}`}
              >
                {page}
              </button>
            ))

          }

          <button
            onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded disabled:opacity-40 cursor-pointer"
          >
            Next
          </button>
        </div >
      )}
    </>
  )
}

export default Pagination