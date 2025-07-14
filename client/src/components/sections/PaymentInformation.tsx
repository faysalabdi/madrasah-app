import React from 'react';

const PaymentInformation = () => {
  return (
    <div className="mt-12 pt-8">
      <h2 className="text-3xl font-bold text-primary mb-6 font-amiri text-center">
        Step 2: Payment Information
      </h2>
      <div className="bg-secondary-light text-primary-dark p-6 rounded-lg shadow-sm text-center max-w-xl mx-auto">
        <p className="mb-4">
          Thank you for submitting your application! Please proceed with the payment to complete the enrolment process.
        </p>
        <p className="font-semibold">Payment Details:</p>
        <ul className="list-none mb-4 space-y-1">
          <li><strong>PayID:</strong> [0411510201]</li>
        </ul>
        <p>
          Please use your child's full name as the payment reference.
        </p>
        <p className="mt-4">
          After making the payment, please send a copy of the receipt to:
          <br />
          <a href="mailto:madrasahabubakr1@gmail.com" className="font-medium text-primary hover:underline">
          madrasahabubakr1@gmail.com
          </a>
        </p>
        <p className="mt-6 text-sm">
          Our team will contact you within 3-5 business days after confirming your application and payment.
        </p>
      </div>
    </div>
  );
};

export default PaymentInformation; 