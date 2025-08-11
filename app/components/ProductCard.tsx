import React from "react";
import { useId } from "react";
import { CheckCircle, AlertTriangle, Building2, Calendar, Package } from 'lucide-react';
import Link from 'next/link';

interface ProductCardProps {
  product: {
    prod_notif_no: string;
    prod_name: string;
    prod_brand?: string;
    prod_category?: string;
    holder_name?: string;
    holderApprovedCount?: number;
    prod_status_type?: string;
    prod_status_date?: string;
  };
  href?: string;
  isReference?: boolean;
  onSearchClick?: () => void;
}

export function ProductCard({ product, href, isReference = false, onSearchClick }: ProductCardProps) {
  const content = (
    <div className={`relative bg-gradient-to-b from-neutral-100 to-white dark:from-neutral-900 dark:to-neutral-950 p-6 rounded-3xl overflow-hidden transition-all duration-300 ${
      (href || onSearchClick) ? 'hover:shadow-lg hover:scale-[1.02] cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500' : ''
    } ${isReference ? 'border-2 border-purple-200' : 'border border-gray-200'}`}>
      <Grid size={20} />
      
      <div className="relative z-20">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <div className={`font-bold text-neutral-800 dark:text-white line-clamp-2 ${isReference ? 'text-lg' : 'text-base'}`}>
              {product.prod_name}
            </div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">{product.prod_notif_no}</div>
          </div>
          {product.prod_status_type ? (
            <div className="flex items-center gap-2">
              {product.prod_status_type === 'A' ? (
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 ${isReference ? 'text-sm' : 'text-xs'}`}>
                  <CheckCircle className={`${isReference ? 'w-4 h-4' : 'w-3 h-3'}`} /> Approved
                </span>
              ) : (
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 ${isReference ? 'text-sm' : 'text-xs'}`}>
                  <AlertTriangle className={`${isReference ? 'w-4 h-4' : 'w-3 h-3'}`} /> Cancelled
                </span>
              )}
              {product.prod_status_date && isReference && (
                <div className="flex items-center gap-1 text-sm text-neutral-500 dark:text-neutral-400">
                  <Calendar className="w-4 h-4" /> {new Date(product.prod_status_date).toLocaleDateString()}
                </div>
              )}
            </div>
          ) : null}
        </div>
        
        <div className="flex flex-wrap gap-2 text-sm text-neutral-600 dark:text-neutral-400 mb-3">
          {product.prod_brand && (
            <>
              <span className="flex items-center gap-1">
                <Package className="w-4 h-4" /> {product.prod_brand}
              </span>
              <span>•</span>
            </>
          )}
          {product.prod_category && (
            <>
              <span>{product.prod_category}</span>
              {product.holder_name && <span>•</span>}
            </>
          )}
          {product.holder_name && (
            <span className="flex items-center gap-1">
              <Building2 className="w-4 h-4" /> {product.holder_name}
            </span>
          )}
        </div>
        
        {product.holderApprovedCount !== undefined && (
          <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
            Trusted brand approvals: {product.holderApprovedCount}
          </div>
        )}
        
        {isReference && (
          <div className="text-sm text-purple-600 dark:text-purple-400 font-medium mt-2">
            Reference Product
          </div>
        )}
        
        {onSearchClick && (
          <div className="text-sm text-purple-600 dark:text-purple-400 font-medium mt-2">
            Click to search this product
          </div>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }

  if (onSearchClick) {
    return (
      <button
        type="button"
        onClick={onSearchClick}
        className="block w-full text-left"
        aria-label={`Search for ${product.prod_name}`}
      >
        {content}
      </button>
    );
  }

  return content;
}

export const Grid = ({
  pattern,
  size,
}: {
  pattern?: number[][];
  size?: number;
}) => {
  const p = pattern ?? [
    [Math.floor(Math.random() * 4) + 7, Math.floor(Math.random() * 6) + 1],
    [Math.floor(Math.random() * 4) + 7, Math.floor(Math.random() * 6) + 1],
    [Math.floor(Math.random() * 4) + 7, Math.floor(Math.random() * 6) + 1],
    [Math.floor(Math.random() * 4) + 7, Math.floor(Math.random() * 6) + 1],
    [Math.floor(Math.random() * 4) + 7, Math.floor(Math.random() * 6) + 1],
  ];
  return (
    <div className="pointer-events-none absolute left-1/2 top-0 -ml-20 -mt-2 h-full w-full [mask-image:linear-gradient(white,transparent)]">
      <div className="absolute inset-0 bg-gradient-to-r [mask-image:radial-gradient(farthest-side_at_top,white,transparent)] dark:from-zinc-900/30 from-zinc-100/30 to-zinc-300/30 dark:to-zinc-900/30 opacity-100">
        <GridPattern
          width={size ?? 20}
          height={size ?? 20}
          x="-12"
          y="4"
          squares={p}
          className="absolute inset-0 h-full w-full mix-blend-overlay dark:fill-white/10 dark:stroke-white/10 stroke-black/10 fill-black/10"
        />
      </div>
    </div>
  );
};

export function GridPattern({ width, height, x, y, squares, ...props }: any) {
  const patternId = useId();

  return (
    <svg aria-hidden="true" {...props}>
      <defs>
        <pattern
          id={patternId}
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
          x={x}
          y={y}
        >
          <path d={`M.5 ${height}V.5H${width}`} fill="none" />
        </pattern>
      </defs>
      <rect
        width="100%"
        height="100%"
        strokeWidth={0}
        fill={`url(#${patternId})`}
      />
      {squares && (
        <svg x={x} y={y} className="overflow-visible">
          {squares.map(([x, y]: any) => (
            <rect
              strokeWidth="0"
              key={`${x}-${y}`}
              width={width + 1}
              height={height + 1}
              x={x * width}
              y={y * height}
            />
          ))}
        </svg>
      )}
    </svg>
  );
} 