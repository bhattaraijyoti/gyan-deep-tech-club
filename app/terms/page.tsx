

"use client";

import React from "react";

export default function TermsPage() {
  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-8">
        <h1 className="text-4xl font-bold mb-6 text-center text-gray-900">Terms of Service</h1>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2 text-gray-800">1. Acceptance of Terms</h2>
          <p className="text-gray-700">
            By accessing and using Gyan Tech Club, you accept and agree to be bound by these terms. If you do not agree, you must not use our services.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2 text-gray-800">2. Use of Services</h2>
          <p className="text-gray-700">
            You agree to use our platform responsibly and not engage in activities that could harm or interfere with the platform or other users.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2 text-gray-800">3. Intellectual Property</h2>
          <p className="text-gray-700">
            All content, features, and functionality are the property of Gyan Tech Club and protected by intellectual property laws.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2 text-gray-800">4. Limitation of Liability</h2>
          <p className="text-gray-700">
            Gyan Tech Club is not liable for any direct, indirect, incidental, or consequential damages resulting from the use of our services.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2 text-gray-800">5. User Accounts</h2>
          <p className="text-gray-700">
            Users may be required to create an account to access certain features. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2 text-gray-800">6. Privacy</h2>
          <p className="text-gray-700">
            Your use of our services is also governed by our Privacy Policy. We collect, store, and process personal information as outlined in the Privacy Policy.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2 text-gray-800">7. Termination</h2>
          <p className="text-gray-700">
            We reserve the right to suspend or terminate your access to our services at any time, without prior notice, for violations of these terms or other policies.
          </p>
        </section>
      </div>
    </div>
  );
}