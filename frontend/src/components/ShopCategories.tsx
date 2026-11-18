import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { useCollectionsQuery } from "@/hooks/useCollectionQueries";

export default function ShopCategories() {
  const { data: collections } = useCollectionsQuery();
  if (!collections?.length) return null;

  return (
    <section className="store-container py-12 md:py-16" aria-labelledby="collection-heading">
      <h2 id="collection-heading" className="store-title mb-6">Collections.</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {collections.slice(0, 4).map((collection) => (
          <Link className="group store-panel flex flex-col overflow-hidden" key={collection._id} to={`/shop?collection=${encodeURIComponent(collection.slug)}`}>
            {collection.heroImage && <img className="aspect-[4/3] w-full object-cover" src={collection.heroImage} alt="" loading="lazy" />}
            <div className="flex flex-1 justify-between gap-2 p-4 text-sm font-bold group-hover:bg-primary">
              {collection.name}<ArrowUpRight size={17} aria-hidden="true" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
