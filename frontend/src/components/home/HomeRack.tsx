import { lazy, Suspense, useState } from 'react';
import { ArrowUpRight, MousePointer2, Rotate3D } from 'lucide-react';
import { Link } from 'react-router-dom';
import teeImage from '@/assets/rack/tee.png';
import hoodieImage from '@/assets/rack/hoodie.png';
import cargoImage from '@/assets/rack/cargo.png';
import jacketImage from '@/assets/rack/jacket.png';
import type { GarmentKind } from './garmentModel';
import './home-rack.css';

const GarmentPreview = lazy(() => import('./GarmentPreview'));

const garments = [
  { kind: 'tee', name: 'Boxy Tee', color: 'Bone', image: teeImage },
  { kind: 'hoodie', name: 'Heavyweight Hoodie', color: 'Charcoal', image: hoodieImage },
  { kind: 'cargo', name: 'Utility Cargo', color: 'Olive', image: cargoImage },
  { kind: 'jacket', name: 'Work Jacket', color: 'Rust', image: jacketImage },
] satisfies { kind: GarmentKind; name: string; color: string; image: string }[];

export default function HomeRack() {
  const [hovered, setHovered] = useState<GarmentKind>();
  const [selected, setSelected] = useState<GarmentKind>();

  return (
    <section className="home-rack" aria-labelledby="home-rack-heading">
      <div className="rack-intro">
        <div>
          <p className="rack-eyebrow">Crownline / Streetwear</p>
          <h1 id="home-rack-heading">Streetwear<br />in motion.</h1>
        </div>
        <div className="rack-intro-action">
          <p>Everyday layers. Relaxed silhouettes. Explore the Crownline rack in 3D.</p>
          <Link className="rack-shop-link" to="/shop">
            Shop all products <ArrowUpRight size={17} aria-hidden="true" />
          </Link>
        </div>
      </div>

      <div className="rack-showroom">
        <div className="rack-showroom-top">
          <h2>The rack</h2>
          <span className="rack-desktop-hint">
            <MousePointer2 size={13} aria-hidden="true" /> Hover to move
          </span>
          <span className="rack-touch-hint">Swipe to browse · Tap to move</span>
        </div>

        <div className="rack-scroll">
          <div className="rack-grid">
            <div className="rack-rail" aria-hidden="true" />
            {garments.map(({ kind, name, color, image }) => {
              const active = (hovered ?? selected) === kind;
              return (
                <button
                  key={kind}
                  type="button"
                  className="rack-garment"
                  aria-pressed={selected === kind}
                  onPointerEnter={(event) => {
                    if (event.pointerType !== 'touch') setHovered(kind);
                  }}
                  onPointerLeave={() => setHovered(undefined)}
                  onBlur={() => setHovered(undefined)}
                  onClick={() => setSelected((current) => current === kind ? undefined : kind)}
                >
                  <span className="rack-visual" data-active={active}>
                    <Suspense fallback={null}>
                      <GarmentPreview kind={kind} active={active} />
                    </Suspense>
                    <img className="rack-fallback" src={image} alt="" />
                  </span>
                  <span className="rack-caption">
                    <span><strong>{name}</strong><small>{color}</small></span>
                    <Rotate3D size={17} aria-hidden="true" />
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
