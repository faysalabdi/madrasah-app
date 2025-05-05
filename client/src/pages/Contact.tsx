import React from "react";

export default function Contact() {
  return (
    <main className="min-h-screen py-16">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-primary mb-8 text-center font-amiri">
          Contact Us
        </h1>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold text-primary mb-4 font-amiri">
              Get in Touch
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-primary">Contact Person</h3>
                <p>Sheikh Abdul Qadir Jama</p>
                <p className="text-primary">0411 510 201</p>
              </div>
              <div>
                <h3 className="font-bold text-primary">Location</h3>
                <p>Shop 48, The Mall</p>
                <p>Heidelberg West 3081</p>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </main>
  );
}
