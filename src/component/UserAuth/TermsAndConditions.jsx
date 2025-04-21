import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

function TermsAndConditions() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="mr-4 text-gray-600 hover:text-gray-900"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="text-xl" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Terms and Conditions</h1>
        </div>

        {/* Content */}
        <div className="bg-white shadow rounded-lg p-6 md:p-8">
          <div className="prose max-w-none">
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="mb-4">
              By accessing and using the NIFES Mentorship Program platform, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, please do not use our platform.
            </p>

            <h2 className="text-2xl font-semibold mb-4">2. User Accounts</h2>
            <p className="mb-4">
              You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.
            </p>

            <h2 className="text-2xl font-semibold mb-4">3. User Conduct</h2>
            <p className="mb-4">
              Users must maintain professional conduct at all times. Any form of harassment, discrimination, or inappropriate behavior will not be tolerated and may result in account termination.
            </p>

            <h2 className="text-2xl font-semibold mb-4">4. Mentorship Guidelines</h2>
            <p className="mb-4">
              Both mentors and mentees are expected to:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Maintain professional boundaries</li>
              <li>Respect each other's time and commitments</li>
              <li>Communicate clearly and professionally</li>
              <li>Follow the platform's scheduling and meeting guidelines</li>
            </ul>

            <h2 className="text-2xl font-semibold mb-4">5. Payment Terms</h2>
            <p className="mb-4">
              All payments are processed securely through our payment partners. Refunds are subject to our refund policy and may be considered on a case-by-case basis.
            </p>

            <h2 className="text-2xl font-semibold mb-4">6. Intellectual Property</h2>
            <p className="mb-4">
              All content on the platform, including but not limited to text, graphics, logos, and software, is the property of NIFES Mentorship Program and is protected by intellectual property laws.
            </p>

            <h2 className="text-2xl font-semibold mb-4">7. Limitation of Liability</h2>
            <p className="mb-4">
              The platform is provided "as is" without any warranties. We are not liable for any damages arising from your use of or inability to use the platform.
            </p>

            <h2 className="text-2xl font-semibold mb-4">8. Changes to Terms</h2>
            <p className="mb-4">
              We reserve the right to modify these terms at any time. Users will be notified of any significant changes.
            </p>

            <h2 className="text-2xl font-semibold mb-4">9. Contact Information</h2>
            <p className="mb-4">
              For any questions regarding these terms, please contact us at support@nifesmentorship.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TermsAndConditions; 