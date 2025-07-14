import React, { useState } from "react";
import { toast } from "@/hooks/use-toast";

export default function Contact() {
  // Contact form state
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleContactInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContactForm(prev => ({ ...prev, [name]: value }));
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      toast({
        title: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const formData = {
        access_key: '0d1a51cf-4e51-4254-adcf-0cd9af908071',
        name: contactForm.name,
        email: contactForm.email,
        message: contactForm.message,
        subject: 'Contact Form Submission - Contact Page',
        from_name: contactForm.name,
        to_email: contactForm.email,
      };

      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Message sent successfully!",
          description: "Thank you for your message. We'll get back to you soon.",
        });
        setContactForm({ name: '', email: '', message: '' });
      } else {
        throw new Error(result.message || 'Message sending failed');
      }
    } catch (error) {
      console.error('Contact form submission error:', error);
      toast({
        title: "Error",
        description: "There was an error sending your message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
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
              <form id="contact-form" onSubmit={handleContactSubmit} className="bg-neutral-light p-6 rounded-lg shadow-md space-y-4">
                <h3 className="text-xl font-bold text-primary mb-4 font-amiri">Send us a message</h3>
                <div>
                  <label htmlFor="name" className="block text-left font-medium mb-1">Name</label>
                  <input 
                    type="text" 
                    id="name" 
                    name="name" 
                    value={contactForm.name}
                    onChange={handleContactInputChange}
                    disabled={isSubmitting}
                    required 
                    className="w-full border border-neutral-border rounded px-3 py-2" 
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-left font-medium mb-1">Email</label>
                  <input 
                    type="email" 
                    id="email" 
                    name="email" 
                    value={contactForm.email}
                    onChange={handleContactInputChange}
                    disabled={isSubmitting}
                    required 
                    className="w-full border border-neutral-border rounded px-3 py-2" 
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-left font-medium mb-1">Message</label>
                  <textarea 
                    id="message" 
                    name="message" 
                    rows={5} 
                    value={contactForm.message}
                    onChange={handleContactInputChange}
                    disabled={isSubmitting}
                    required 
                    className="w-full border border-neutral-border rounded px-3 py-2"
                  ></textarea>
                </div>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-primary hover:bg-primary-dark text-white font-medium py-2 px-6 rounded shadow transition duration-300 disabled:opacity-70"
                >
                  {isSubmitting ? "Sending..." : "Send"}
                </button>
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
