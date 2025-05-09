import { useState, useRef } from "react";
import { Link } from "wouter"; // Assuming wouter is used for Link, adjust if not

export default function GoogleForm() {
  const paymentRef = useRef<HTMLDivElement>(null);
  const [formSubmitted, setFormSubmitted] = useState(false);

  return (
    <>
      {/* Google Form Hero Section */}
      <section className="bg-primary-dark text-white py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 font-amiri">Application Form</h1>
            <p className="text-lg mb-8">Follow the steps below to apply for admission to Madrasah Abubakr As-Siddiq.</p>
          </div>
        </div>
      </section>
      
      {/* Google Form Embed / Payment Info Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            {!formSubmitted ? (
              <>
                <h2 className="text-3xl font-bold text-primary mb-6 font-amiri text-center">
                  Step 1: Complete the Application Form
                </h2>
                <div className="bg-neutral-light p-6 rounded-lg shadow-md">
                  <div className="w-full h-[1000px] md:h-[1200px] overflow-hidden rounded-lg">
                    <iframe 
                      src="https://docs.google.com/forms/d/e/1FAIpQLSfE3a-8-BKwoSSfTVczKahEA9D8h-u1H-SjfcfPukZaHKW0JA/viewform?embedded=true" 
                      width="100%" 
                      height="100%" 
                      style={{ border: "none" }}
                      title="Google Form"
                    >
                      Loading Google Form...
                    </iframe>
                  </div>
                </div>
                <div className="mt-8 text-center">
                  <p className="text-sm text-neutral-text mb-4">
                    If you have any issues accessing the form, you can 
                    <a 
                      href="https://docs.google.com/forms/d/e/1FAIpQLSfE3a-8-BKwoSSfTVczKahEA9D8h-u1H-SjfcfPukZaHKW0JA/viewform" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary-dark ml-1"
                    >
                      open it directly on Google Forms.
                    </a>
                  </p>
                  <p className="text-center mt-6 text-sm">
                    After submitting the form above, please click the button below to proceed to payment.
                  </p>
                  <button
                    onClick={() => {
                      setFormSubmitted(true);
                      setTimeout(() => paymentRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
                    }}
                    className="bg-primary hover:bg-primary-dark text-white font-medium py-3 px-8 rounded shadow transition duration-300 inline-flex items-center"
                  >
                    Proceed to Payment Information
                    <span className="material-icons ml-2">arrow_forward</span>
                  </button>
                </div>
              </>
            ) : (
              <div ref={paymentRef} className="pt-8">
                <h2 className="text-3xl font-bold text-primary mb-6 font-amiri text-center">
                  Step 2: Payment Information
                </h2>
                <div className="bg-secondary-light text-primary-dark p-6 rounded-lg shadow-sm text-center max-w-xl mx-auto">
                  <p className="mb-4">
                    Thank you for submitting your application! Please proceed with the payment to complete the enrolment process.
                  </p>
                  <p className="font-semibold">Payment Details:</p>
                  <ul className="list-none mb-4 space-y-1">
                    <li><strong>BSB:</strong> [Your BSB Number]</li>
                    <li><strong>Account Number:</strong> [Your Account Number]</li>
                    <li><strong>Account Name:</strong> Madrasah Abubakr As-Siddiq</li>
                  </ul>
                  <p>
                    Please use your child's full name as the payment reference.
                  </p>
                  <p className="mt-4">
                    After making the payment, please send a copy of the receipt to:
                    <br />
                    <a href="mailto:payments@madrasahabubakr.com.au" className="font-medium text-primary hover:underline">
                      payments@madrasahabubakr.com.au
                    </a>
                  </p>
                  <p className="mt-6 text-sm">
                    Our team will contact you within 3-5 business days after confirming your application and payment.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}