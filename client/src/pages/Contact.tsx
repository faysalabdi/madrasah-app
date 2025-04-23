import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import BackgroundPattern from "@/components/ui/BackgroundPattern";

export default function Contact() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.message) {
      toast({
        title: "Missing information",
        description: "Please fill out all required fields.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      // Simulate submission for now - in production this would actually send the data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Message sent!",
        description: "Thank you for contacting us. We'll respond to your message soon.",
      });
      
      // Reset form
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: ""
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "There was a problem sending your message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Contact Hero Section */}
      <section className="bg-primary-dark text-white py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 font-amiri">Contact Us</h1>
            <p className="text-lg mb-8">We'd love to hear from you. Reach out with any questions about our programs, admission process, or general inquiries.</p>
          </div>
        </div>
      </section>
      
      {/* Contact Information & Form */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row bg-white rounded-lg shadow-lg overflow-hidden max-w-5xl mx-auto">
            {/* Contact form */}
            <div className="md:w-1/2 p-8">
              <h3 className="text-xl font-bold text-primary mb-6 font-amiri">Send Us a Message</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block mb-1 font-medium">Name*</label>
                  <input 
                    type="text" 
                    id="name" 
                    name="name" 
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-neutral-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block mb-1 font-medium">Email*</label>
                  <input 
                    type="email" 
                    id="email" 
                    name="email" 
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-neutral-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label htmlFor="subject" className="block mb-1 font-medium">Subject</label>
                  <select 
                    id="subject" 
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-neutral-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                    disabled={isSubmitting}
                  >
                    <option value="">Select a subject</option>
                    <option value="admission">Admission Inquiry</option>
                    <option value="program">Program Information</option>
                    <option value="tuition">Tuition and Fees</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="message" className="block mb-1 font-medium">Message*</label>
                  <textarea 
                    id="message" 
                    name="message" 
                    value={formData.message}
                    onChange={handleChange}
                    rows={4} 
                    className="w-full px-4 py-2 border border-neutral-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                    disabled={isSubmitting}
                  ></textarea>
                </div>
                <button 
                  type="submit" 
                  className="bg-primary hover:bg-primary-dark text-white font-medium py-2 px-6 rounded shadow transition duration-300 disabled:opacity-70"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </button>
              </form>
            </div>
            
            {/* Contact information */}
            <div className="md:w-1/2 bg-primary text-white p-8">
              <h3 className="text-xl font-bold mb-6 font-amiri">Contact Information</h3>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <span className="material-icons mr-4 text-secondary">location_on</span>
                  <div>
                    <h4 className="font-bold mb-1">Address</h4>
                    <p>123 Islamic Education Street<br />
                       Anytown, ST 12345<br />
                       United States</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <span className="material-icons mr-4 text-secondary">phone</span>
                  <div>
                    <h4 className="font-bold mb-1">Phone</h4>
                    <p>(123) 456-7890</p>
                    <p className="text-sm">Monday-Friday: 8am-4pm</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <span className="material-icons mr-4 text-secondary">email</span>
                  <div>
                    <h4 className="font-bold mb-1">Email</h4>
                    <p>info@madrasa-abubakr.org</p>
                    <p className="text-sm">We aim to respond within 24 hours</p>
                  </div>
                </div>
                
                <div className="pt-6 border-t border-white border-opacity-20">
                  <h4 className="font-bold mb-3">Connect With Us</h4>
                  <div className="flex space-x-4">
                    <a href="#" className="bg-white bg-opacity-10 hover:bg-opacity-20 w-10 h-10 rounded-full flex items-center justify-center transition-colors" aria-label="Facebook">
                      <span className="material-icons">facebook</span>
                    </a>
                    <a href="#" className="bg-white bg-opacity-10 hover:bg-opacity-20 w-10 h-10 rounded-full flex items-center justify-center transition-colors" aria-label="Twitter">
                      <span className="material-icons">twitter</span>
                    </a>
                    <a href="#" className="bg-white bg-opacity-10 hover:bg-opacity-20 w-10 h-10 rounded-full flex items-center justify-center transition-colors" aria-label="Instagram">
                      <span className="material-icons">instagram</span>
                    </a>
                    <a href="#" className="bg-white bg-opacity-10 hover:bg-opacity-20 w-10 h-10 rounded-full flex items-center justify-center transition-colors" aria-label="YouTube">
                      <span className="material-icons">play_arrow</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Map and hours */}
      <section className="py-16 bg-neutral-light">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Map placeholder */}
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h3 className="text-xl font-bold text-primary mb-4 font-amiri">Find Us</h3>
                <div className="h-72 bg-neutral-background rounded flex items-center justify-center">
                  <div className="text-center">
                    <span className="material-icons text-primary text-5xl mb-4">map</span>
                    <p>Interactive map would be displayed here</p>
                    <a 
                      href="https://maps.google.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary-dark inline-flex items-center mt-4"
                    >
                      Get Directions
                      <span className="material-icons ml-1">open_in_new</span>
                    </a>
                  </div>
                </div>
              </div>
              
              {/* Office hours */}
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h3 className="text-xl font-bold text-primary mb-4 font-amiri">Hours of Operation</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold mb-2">Administrative Office</h4>
                    <ul className="space-y-2">
                      <li className="flex justify-between">
                        <span>Monday - Friday</span>
                        <span>8:00 AM - 4:00 PM</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Saturday</span>
                        <span>9:00 AM - 1:00 PM</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Sunday</span>
                        <span>Closed</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="pt-4 border-t border-neutral-border">
                    <h4 className="font-bold mb-2">Class Hours</h4>
                    <ul className="space-y-2">
                      <li className="flex justify-between">
                        <span>Early Learners</span>
                        <span>Mon-Thu, 9:00 AM - 12:00 PM</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Foundation Program</span>
                        <span>Mon-Fri, 4:00 PM - 6:00 PM</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Youth Program</span>
                        <span>Sat-Sun, 10:00 AM - 2:00 PM</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Hifz Program</span>
                        <span>Mon-Fri, 7:00 AM - 9:00 AM</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-primary mb-8 font-amiri text-center">Frequently Asked Questions</h2>
            
            <div className="space-y-4">
              <div className="bg-neutral-light p-6 rounded-lg">
                <h3 className="text-lg font-bold text-primary mb-2">What are your office hours?</h3>
                <p>Our administrative office is open Monday through Friday from 8:00 AM to 4:00 PM, and on Saturday from 9:00 AM to 1:00 PM. We are closed on Sunday.</p>
              </div>
              
              <div className="bg-neutral-light p-6 rounded-lg">
                <h3 className="text-lg font-bold text-primary mb-2">How can I schedule a visit to the madrasah?</h3>
                <p>We welcome visits from prospective students and their families. Please contact our office by phone or email to schedule a tour of our facilities and meet with our staff.</p>
              </div>
              
              <div className="bg-neutral-light p-6 rounded-lg">
                <h3 className="text-lg font-bold text-primary mb-2">How long does it take to get a response to inquiries?</h3>
                <p>We aim to respond to all inquiries within 24 hours during business days. For urgent matters, we recommend calling our office directly.</p>
              </div>
              
              <div className="bg-neutral-light p-6 rounded-lg">
                <h3 className="text-lg font-bold text-primary mb-2">Is there parking available at the madrasah?</h3>
                <p>Yes, we have a dedicated parking lot for parents and visitors. During drop-off and pick-up times, we implement a traffic flow system to ensure safety and efficiency.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Get in Touch CTA */}
      <BackgroundPattern height="h-auto">
        <div className="container mx-auto px-4 py-12 text-white text-center">
          <h2 className="text-3xl font-bold mb-4 font-amiri">Ready to Get in Touch?</h2>
          <p className="mb-8 max-w-2xl mx-auto">Whether you have questions about our programs, admission process, or anything else, we're here to help.</p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <a href="tel:1234567890" className="bg-white text-primary hover:bg-neutral-light font-medium py-3 px-6 rounded shadow transition duration-300 flex items-center justify-center">
              <span className="material-icons mr-2">call</span>
              Call Us
            </a>
            <a href="mailto:info@madrasa-abubakr.org" className="bg-secondary hover:bg-secondary-dark text-white font-medium py-3 px-6 rounded shadow transition duration-300 flex items-center justify-center">
              <span className="material-icons mr-2">email</span>
              Email Us
            </a>
          </div>
        </div>
      </BackgroundPattern>
    </>
  );
}
