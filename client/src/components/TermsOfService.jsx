import { Link } from 'react-router-dom';

const TermsOfService = () => {
  return (
    <div className="bg-gray-100 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-6">
          Terms of Service
        </h1>
        <p className="text-sm text-gray-600 mb-4">
          Last updated: June 5, 2025
        </p>

        <section className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-3">
            1. Acceptance of Terms
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Welcome to Zomato ("we," "our," or "us"). These Terms of Service ("Terms") govern your use of the Zomato website, mobile app, and related services (collectively, the "Service"). By accessing or using our Service, you agree to be bound by these Terms. If you do not agree, please do not use the Service.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-3">
            2. Eligibility
          </h2>
          <p className="text-gray-600 leading-relaxed">
            You must be at least 13 years old to use our Service. By using the Service, you represent and warrant that you meet this eligibility requirement and have the legal capacity to enter into these Terms.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-3">
            3. Use of the Service
          </h2>
          <p className="text-gray-600 leading-relaxed">
            You agree to use the Service only for lawful purposes and in accordance with these Terms. You may not:
          </p>
          <ul className="list-disc pl-5 text-gray-600 leading-relaxed">
            <li>Use the Service to engage in fraudulent or illegal activities.</li>
            <li>Attempt to bypass security measures or interfere with the Service's functionality.</li>
            <li>Post or transmit harmful content, including viruses or malicious code.</li>
            <li>Impersonate others or provide false information during registration or ordering.</li>
          </ul>
        </section> 

        <section className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-3">
            4. Changes to These Terms
          </h2>
          <p className="text-gray-600 leading-relaxed">
            We may update these Terms periodically. Changes will be posted on this page with an updated "Last updated" date. Your continued use of the Service constitutes acceptance of the updated Terms.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-3">
            5. Contact Us
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

export default TermsOfService;

