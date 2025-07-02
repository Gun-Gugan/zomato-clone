import { Link } from 'react-router-dom';
import ContactForm from '../pages/ContactForm';

const PrivacyPolicy = () => {
  return (
    <div className="bg-gray-100 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-6">
          Privacy Policy
        </h1>
        <p className="text-sm text-gray-600 mb-4">
          Last updated: june 5, 2025
        </p>

        <section className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-3">
            1. Introduction
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Zomato ("we," "our," or "us") operates the Zomato website and mobile app (the "Service"). This Privacy Policy outlines how we collect, use, disclose, and protect your personal information when you use our Service. By using our Service, you agree to the collection and use of information in accordance with this policy.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-3">
            2. Information We Collect
          </h2>
          <p className="text-gray-600 leading-relaxed">
            We collect the following types of information:
          </p>
          <ul className="list-disc pl-5 text-gray-600 leading-relaxed">
            <li>
              <strong>Personal Information</strong>: Name, email address and phone number information provided during account creation, orders, or customer support interactions.
            </li>
            <li>
              <strong>Usage Data</strong>: Information about how you use our Service, browser type, pages visited, time spent, and device information.
            </li>
            
          </ul>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-3">
            3. Contact Us
          </h2>
          <p className="text-gray-600 leading-relaxed">
            For questions about these Terms, please{' '}
            <Link
              to="/contact"
              className="text-red-500 hover:text-red-600 font-medium transition-colors duration-200"
            >
              contact us
            </Link>
            .
          </p>
        </section>

        <div className="text-center mt-8">
          <Link
            to="/"
            className="text-red-500 hover:text-red-600 font-medium transition-colors duration-200"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
