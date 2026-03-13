import React from "react";

const ProductCardSkeleton: React.FC = () => (
  <div className="card-luxury flex flex-col overflow-hidden" aria-hidden="true">
    <div className="skeleton aspect-[3/4]" />
    <div className="p-5 flex flex-col gap-3">
      <div className="skeleton h-5 w-3/4" />
      <div className="skeleton h-4 w-1/2" />
      <div className="flex gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton h-7 w-10" />
        ))}
      </div>
      <div className="skeleton h-6 w-1/3 mt-2" />
      <div className="skeleton h-10 w-full mt-1" />
    </div>
  </div>
);

export default ProductCardSkeleton;
