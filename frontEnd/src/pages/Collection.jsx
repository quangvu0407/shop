import React from "react";
import AllProductCollection from "../components/collection/AllProductCollection";

const Collection = () => {
  return (
    <div className="flex flex-col sm:flex-row gap-1 sm:gap-10 pt-8 sm:pt-10 pb-16 border-t bg-gradient-to-b from-stone-50/40 to-white min-h-[50vh]">
      <AllProductCollection />
    </div>
  );
};

export default Collection