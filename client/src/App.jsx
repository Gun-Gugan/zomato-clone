import { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import RestaurantList from './pages/RestaurantList';
import Register from './pages/Register';
import Login from './pages/Login';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Orders from './pages/Orders';
import Profile from './pages/Profile';
import Checkout from './pages/Checkout';
import Cart from './pages/Cart';
import NotFound from './pages/NotFound';
import Footer from './components/Footer';
import ForgotPassword from './pages/ForgotPassword';
import ContactForm from './pages/ContactForm';
import TermsOfService from './components/TermsOfService';
import PrivacyPolicy from './components/PrivacyPolicy';
import Preloader from './components/Preloader'; 

function App() {
  const location = useLocation();
  const hideFooterRoutes = ['/login', '/register'];
  const shouldHideFooter = hideFooterRoutes.includes(location.pathname);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 1000); 
    return () => clearTimeout(timer);
  }, [location.pathname]);

  if (loading) {
    return <Preloader />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      {!shouldHideFooter && <Navbar />}

      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/restaurants" element={<RestaurantList />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/forgot-password" element={<ProtectedRoute><ForgotPassword /></ProtectedRoute>} />
          <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
          <Route path="/contact" element={<ContactForm />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      {!shouldHideFooter && <Footer />}
    </div>
  );
}

export default App;

