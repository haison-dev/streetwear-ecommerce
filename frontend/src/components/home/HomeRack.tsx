import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, Pause, Play, RotateCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '@/components/ui/carousel';
import './home-rack.css';

const looks = [
  { slug: 'boxy-tee-bone', name: 'Boxy Tee', color: 'Bone' },
  { slug: 'heavyweight-hoodie-charcoal', name: 'Heavyweight Hoodie', color: 'Charcoal' },
  { slug: 'utility-cargo-olive', name: 'Utility Cargo', color: 'Olive' },
  { slug: 'work-jacket-rust', name: 'Work Jacket', color: 'Rust' },
];

const frameCount = 8;
const frameDelay = 225;
const endDelay = 1050;

export default function HomeRack() {
  const [api, setApi] = useState<CarouselApi>();
  const [selected, setSelected] = useState(0);
  const [frame, setFrame] = useState(0);
  const [ready, setReady] = useState<Record<string, boolean>>({});
  const [paused, setPaused] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [hidden, setHidden] = useState(() => document.hidden);
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const current = looks[selected];
  const currentReady = ready[current.slug];

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(preference.matches);
    const updateVisibility = () => setHidden(document.hidden);
    preference.addEventListener('change', update);
    document.addEventListener('visibilitychange', updateVisibility);
    return () => {
      preference.removeEventListener('change', update);
      document.removeEventListener('visibilitychange', updateVisibility);
    };
  }, []);

  useEffect(() => {
    if (!api) return;
    const select = () => {
      setSelected(api.selectedScrollSnap());
      setFrame(0);
    };
    const startDrag = () => setDragging(true);
    const endDrag = () => setDragging(false);
    api.on('select', select).on('reInit', select).on('pointerDown', startDrag).on('pointerUp', endDrag);
    select();
    return () => { api.off('select', select).off('reInit', select).off('pointerDown', startDrag).off('pointerUp', endDrag); };
  }, [api]);

  useEffect(() => {
    if (!api || paused || dragging || hidden || reducedMotion || currentReady === undefined) return;
    const timer = window.setTimeout(() => {
      if (currentReady && frame < frameCount) setFrame(frame + 1);
      else api.scrollNext();
    }, currentReady && frame < frameCount ? frameDelay : endDelay);
    return () => window.clearTimeout(timer);
  }, [api, currentReady, dragging, frame, hidden, paused, reducedMotion, selected]);

  const angle = frame % frameCount;
  const advanceAngle = () => {
    setPaused(true);
    setFrame((value) => (value + 1) % frameCount);
  };

  return (
    <section className="home-rack" aria-labelledby="home-rack-heading">
      <div className="rack-intro">
        <div>
          <p className="rack-eyebrow">Crownline / Streetwear</p>
          <h1 id="home-rack-heading">Streetwear<br />in motion.</h1>
        </div>
        <div className="rack-intro-action">
          <p>See the fit from every angle.</p>
          <Link className="store-action" to="/shop">
            Shop all products <ArrowUpRight size={17} aria-hidden="true" />
          </Link>
        </div>
      </div>

      <Carousel className="turntable" setApi={setApi} opts={{ loop: true, duration: reducedMotion ? 0 : 28 }}
        aria-labelledby="turntable-heading">
        <div className="turntable-header">
          <h2 id="turntable-heading">The rack / 360°</h2>
          <div className="turntable-nav">
            <button type="button" aria-label="Previous outfit" onClick={() => api?.scrollPrev(reducedMotion)}>
              <ArrowLeft size={17} aria-hidden="true" />
            </button>
            {!reducedMotion && (
              <button type="button" aria-label={paused ? 'Play turntable' : 'Pause turntable'} onClick={() => setPaused((value) => !value)}>
                {paused ? <Play size={16} aria-hidden="true" /> : <Pause size={16} aria-hidden="true" />}
              </button>
            )}
            <button type="button" aria-label="Next outfit" onClick={() => api?.scrollNext(reducedMotion)}>
              <ArrowRight size={17} aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="turntable-layout">
          <CarouselContent className="ml-0">
            {looks.map(({ slug, name }, index) => {
              const activeAngle = index === selected ? angle : 0;
              return (
                <CarouselItem key={slug} className="pl-0" aria-label={name}>
                  <div className="turntable-stage">
                    <div className="turntable-photo" role="img" aria-label={`Male model wearing the ${name}`}>
                      <img className="turntable-poster" src={`/lookbook/${slug}.jpg`} alt="" draggable={false} />
                      <img
                        className="turntable-sheet"
                        data-ready={ready[slug] === true}
                        src={`/lookbook/turntable/${slug}.jpg`}
                        alt=""
                        draggable={false}
                        onLoad={() => setReady((value) => ({ ...value, [slug]: true }))}
                        onError={() => setReady((value) => ({ ...value, [slug]: false }))}
                        style={{ transform: `translate(-${(activeAngle % 4) * 25}%, -${Math.floor(activeAngle / 4) * 50}%)` }}
                      />
                    </div>
                  </div>
                </CarouselItem>
              );
            })}
          </CarouselContent>

          <div className="turntable-details">
            <div>
              <p className="store-label mb-3">{current.color}</p>
              <h3>{current.name}</h3>
              <div className="turntable-actions">
                <Link className="store-action" to={`/product/crownline-${current.slug}`}>
                  Shop this look <ArrowUpRight size={16} aria-hidden="true" />
                </Link>
                <button type="button" className="turntable-angle" onClick={advanceAngle}
                  aria-label="Rotate outfit by 45 degrees" disabled={!currentReady}>
                  <RotateCw size={16} aria-hidden="true" /> {frame * 45}°
                </button>
              </div>
            </div>
            <div className="turntable-thumbnails" aria-label="Choose an outfit">
              {looks.map(({ slug, name }, index) => (
                <button type="button" key={slug} aria-label={name} aria-current={index === selected ? 'true' : undefined}
                  onClick={() => api?.scrollTo(index, reducedMotion)}>
                  <img src={`/lookbook/${slug}.jpg`} alt="" width="72" height="90" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </Carousel>
    </section>
  );
}
