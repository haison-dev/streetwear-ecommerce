import { Link } from "react-router-dom";
import { ArrowUpRight, ImageOff } from "lucide-react";
import type { Product } from "@/types";
import { formatVnd } from "@/lib/money";

export default function ProductCard({ product }: { product: Product }) {
  const image = product.images?.[0];
  const price = product.salePrice ?? product.price;

  return (
    <Link to={`/product/${product.slug}`} className="group flex h-full min-w-0 flex-col border border-border focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring">
      <div className="relative overflow-hidden bg-secondary">
        {image ? (
          <img src={image} alt="" className="aspect-[4/5] w-full object-cover motion-safe:transition-transform motion-safe:duration-300 group-hover:scale-105" loading="lazy" />
        ) : <div className="grid aspect-[4/5] place-items-center text-muted-foreground"><ImageOff aria-hidden="true" size={24} /></div>}
        {price < product.price && <span className="absolute left-2 top-2 border border-foreground bg-primary px-2 py-1 text-[10px] font-bold uppercase">Sale</span>}
      </div>
      <div className="flex flex-1 flex-col gap-1 border-t border-border p-3 group-hover:bg-secondary sm:p-4">
        {product.brandId?.name && <p className="store-label">{product.brandId.name}</p>}
        <h3 className="flex items-start justify-between gap-1 text-sm font-bold">
          <span>{product.name}</span><ArrowUpRight size={16} className="shrink-0" aria-hidden="true" />
        </h3>
        <div className="mt-auto flex flex-wrap gap-2 pt-1 text-sm">
          <span className="font-semibold">{formatVnd(price)}</span>
          {price < product.price && <span className="text-muted-foreground line-through">{formatVnd(product.price)}</span>}
        </div>
      </div>
    </Link>
  );
}
