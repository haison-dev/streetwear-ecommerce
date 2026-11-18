import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, Pause, Play } from "lucide-react";
import { Link } from "react-router-dom";
import ProductCard from "./ProductCard";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";
import { useFeaturedProductsQuery } from "@/hooks/useFeaturedProductsQuery";

export default function FeaturedProducts() {
  const { data, isError, isLoading } = useFeaturedProductsQuery();
  const products = data?.products ?? [];
  const [api, setApi] = useState<CarouselApi>();
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [canSlide, setCanSlide] = useState(false);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(preference.matches);
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!api) return;
    const update = () => setCanSlide(api.scrollSnapList().length > 1);
    update();
    api.on("reInit", update);
    return () => { api.off("reInit", update); };
  }, [api, products.length]);

  useEffect(() => {
    if (!api || !canSlide || paused || hovered || focused || reducedMotion) return;
    const interval = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      if (api.canScrollNext()) api.scrollNext();
      else api.scrollTo(0);
    }, 3600);
    return () => window.clearInterval(interval);
  }, [api, canSlide, paused, hovered, focused, reducedMotion]);

  if (isError || (!isLoading && products.length === 0)) return null;

  const previous = () => {
    if (!api) return;
    if (api.canScrollPrev()) api.scrollPrev(reducedMotion);
    else api.scrollTo(api.scrollSnapList().length - 1, reducedMotion);
  };

  const next = () => {
    if (!api) return;
    if (api.canScrollNext()) api.scrollNext(reducedMotion);
    else api.scrollTo(0, reducedMotion);
  };

  return (
    <section className="store-container py-12 md:py-16" aria-labelledby="featured-heading">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="store-label mb-2">Crownline / Lookbook</p>
          <h2 id="featured-heading" className="store-title">Shop the looks.</h2>
        </div>
        <Link to="/shop" className="store-action">View all products <ArrowUpRight size={16} aria-hidden="true" /></Link>
      </div>
      {isLoading ? (
        <p role="status" className="text-sm text-muted-foreground">Loading the lookbook…</p>
      ) : (
        <Carousel
          aria-labelledby="featured-heading"
          setApi={setApi}
          opts={{ align: "start", loop: true, duration: reducedMotion ? 0 : 32 }}
          onPointerEnter={(event) => { if (event.pointerType === "mouse") setHovered(true); }}
          onPointerLeave={() => setHovered(false)}
          onFocusCapture={() => setFocused(true)}
          onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}
        >
          <CarouselContent>
            {products.map((product, index) => (
              <CarouselItem key={product._id} className="basis-[77%] sm:basis-1/2 lg:basis-1/3"
                aria-label={`${index + 1} of ${products.length}`}>
                <ProductCard product={product} />
              </CarouselItem>
            ))}
          </CarouselContent>
          {canSlide && (
            <div className="mt-4 flex items-center justify-end gap-2">
              <button type="button" className="grid size-10 place-items-center border border-border hover:bg-primary"
                onClick={previous} aria-label="Previous look"><ArrowLeft size={17} /></button>
              {!reducedMotion && (
                <button type="button" className="grid size-10 place-items-center border border-border hover:bg-primary"
                  onClick={() => setPaused((value) => !value)} aria-label={paused ? "Play slideshow" : "Pause slideshow"}>
                  {paused ? <Play size={16} /> : <Pause size={16} />}
                </button>
              )}
              <button type="button" className="grid size-10 place-items-center border border-border hover:bg-primary"
                onClick={next} aria-label="Next look"><ArrowRight size={17} /></button>
            </div>
          )}
        </Carousel>
      )}
    </section>
  );
}
