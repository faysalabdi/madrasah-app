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
              </div>
              <div>
                <h3 className="font-bold text-primary">Contact Hours</h3>
                <p>
                  Monday - Tuesday: 5:00pm - 7:00pm
                  <br />
                  Saturday: 10:00am - 12:00pm
                </p>
              </div>
            </div>
            <div className="mt-8 max-w-xl mx-auto">
              <form action="https://formspree.io/f/xjkwkdrl" method="POST" className="bg-neutral-light p-6 rounded-lg shadow-md space-y-4">
                <h3 className="text-xl font-bold text-primary mb-4 font-amiri">Send us a message</h3>
                <div>
                  <label htmlFor="name" className="block text-left font-medium mb-1">Name</label>
                  <input type="text" id="name" name="name" required className="w-full border border-neutral-border rounded px-3 py-2" />
                </div>
                <div>
                  <label htmlFor="email" className="block text-left font-medium mb-1">Email</label>
                  <input type="email" id="email" name="email" required className="w-full border border-neutral-border rounded px-3 py-2" />
                </div>
                <div>
                  <label htmlFor="message" className="block text-left font-medium mb-1">Message</label>
                  <textarea id="message" name="message" rows={5} required className="w-full border border-neutral-border rounded px-3 py-2"></textarea>
                </div>
                <button type="submit" className="bg-primary hover:bg-primary-dark text-white font-medium py-2 px-6 rounded shadow transition duration-300">Send</button>
              </form>
            </div>
          </div>
          <div className="rounded-lg overflow-hidden shadow-sm h-full min-h-[400px]">
            <iframe
              title="Madrasah Location"
              src="https://www.google.com/maps?q=Shop+48+The+Mall,+Heidelberg+West+3081&output=embed"
              width="100%"
              height="100%"
              style={{ minHeight: '400px', border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </div>
    </main>
  );
}
