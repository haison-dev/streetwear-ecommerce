import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-footer-bg text-footer-fg py-16">
      <div className="mx-auto w-full max-w-[1400px] px-4 md:px-8 lg:px-10 text-center md:text-left">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <h3 className="font-display text-4xl mb-4">CROWNLINE</h3>
            <p className="font-body text-sm opacity-70">
              100% Independent • Label • Distributor • Publisher
            </p>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-body text-xs tracking-widest uppercase opacity-50 mb-4">Company</h4>
            <ul className="space-y-3 font-body text-sm">
              <li><span className="hover:opacity-70 transition-opacity cursor-pointer">Contact Us</span></li>
              <li><span className="hover:opacity-70 transition-opacity cursor-pointer">About</span></li>
              <li><span className="hover:opacity-70 transition-opacity cursor-pointer">Careers</span></li>
            </ul>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-body text-xs tracking-widest uppercase opacity-50 mb-4">Shop</h4>
            <ul className="space-y-3 font-body text-sm">
              <li><Link to="/shop" className="hover:opacity-70 transition-opacity">All Products</Link></li>
              <li><Link to="/shop?collection=vinyls" className="hover:opacity-70 transition-opacity">Music</Link></li>
              <li><Link to="/shop?collection=hoodies-sweatshirts" className="hover:opacity-70 transition-opacity">Clothing</Link></li>
              <li><Link to="/shop?collection=accessories" className="hover:opacity-70 transition-opacity">Accessories</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-body text-xs tracking-widest uppercase opacity-50 mb-4">Legal</h4>
            <ul className="space-y-3 font-body text-sm">
              <li><span className="hover:opacity-70 transition-opacity cursor-pointer">Privacy Policy</span></li>
              <li><span className="hover:opacity-70 transition-opacity cursor-pointer">Terms of Service</span></li>
              <li><span className="hover:opacity-70 transition-opacity cursor-pointer">Cookie Policy</span></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-footer-fg/10 mt-12 pt-8 flex justify-center md:justify-start">
          <p className="font-body text-xs opacity-40">© 2026 CROWNLINE. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
