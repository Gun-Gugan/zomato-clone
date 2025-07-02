import { FaFacebook, FaInstagram, FaTwitter, FaYoutube } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; 

const Footer = () => {
  const { user } = useAuth(); 

  return (
    <footer className="bg-gray-800 text-white py-10 mt-10">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
      
        {/* Brand */}
        <div>
             <Link to="/" className="text-xl sm:text-2xl font-extrabold text-red-500 hover:text-red-600 transition-colors duration-200">
            Zomato Clone
          </Link>
          <p className="mt-2 text-sm sm:text-base text-gray-400">
            Discover the best food & drinks in your city.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h2 className="text-lg sm:text-xl font-semibold mb-2">Quick Links</h2>
          <ul className="space-y-1 text-sm sm:text-base text-gray-400">
            <li><Link to="/" className="hover:text-white">Home</Link></li>
            <li><Link to="/restaurants" className="hover:text-white">Restaurants</Link></li>
            {!user && ( // Hide if logged in
              <>
                <li><Link to="/login" className="hover:text-white">Login</Link></li>
                <li><Link to="/register" className="hover:text-white">Register</Link></li>
              </>
            )}
          </ul>
        </div>

        {/* Support */}
        <div>
          <h2 className="text-lg sm:text-xl font-semibold mb-2">Support</h2>
          <ul className="space-y-1 text-sm sm:text-base text-gray-400">
            <li><Link to="/contact" className="hover:text-white">Contact Us</Link></li>
            <li><Link to="/privacy-policy" className="hover:text-white">Privacy Policy</Link></li>
            <li><Link to="/terms" className="hover:text-white">Terms of Service</Link></li>
          </ul>
        </div>

        {/* Social Media */}
        <div>
          <h2 className="text-lg sm:text-xl font-semibold mb-2">Follow Us</h2>
          <div className="flex flex-wrap gap-4 text-red-400 text-xl">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><FaFacebook /></a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"><FaTwitter /></a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer"><FaYoutube /></a>
          </div>
        </div>
      </div>

      {/* Bottom Line */}
      <div className="mt-10 border-t border-gray-700 pt-4 text-center text-xs sm:text-sm text-gray-500">
        &copy; {new Date().getFullYear()} Zomato Clone. Built by Guganraj R.
      </div>
    </footer>
  );
};

export default Footer;
