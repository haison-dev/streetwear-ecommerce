import Navbar from '@/components/layout/Navbar';
import HomeRack from '@/components/home/HomeRack';
import FeaturedProducts from '@/components/FeaturedProducts';
import ShopCategories from '@/components/ShopCategories';
import Footer from '@/components/layout/Footer';

const Home = () => {
  return (
    <div className="home-page min-h-screen">
      <Navbar />
      <main>
        <HomeRack />
        <ShopCategories />
        <FeaturedProducts />
      </main>
      <Footer />
    </div>  
  ) 
}

export default Home
