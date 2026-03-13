import Navbar from '@/components/layout/Navbar';
import HeroSlider from '@/components/HeroSlider';
import FeaturedProducts from '@/components/FeaturedProducts';
import ShopCategories from '@/components/ShopCategories';
import Footer from '@/components/layout/Footer';

const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSlider />
      <ShopCategories />
      <FeaturedProducts />
      <Footer />
    </div>  
  ) 
}

export default Home