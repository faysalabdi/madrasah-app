import Hero from "@/components/sections/Hero";
import Features from "@/components/sections/Features";
import { Link } from "wouter";
import Testimonials from "@/components/sections/Testimonials";
import FAQ from "@/components/sections/FAQ";
import BackgroundPattern from "@/components/ui/BackgroundPattern";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import { useRef, useState } from "react";
import { toast } from "@/hooks/use-toast";
import dugsiImg from "../assets/dugsi.jpg";

// Import faculty images
import abdulqadirJama from "@/assets/abdulqadir-jama.jpg";
import ahmedHassan from "@/assets/ahmed-hassan.jpg";
import sadiqAbdulle from "@/assets/sadiq-abdulle.jpg";

export default function Home() {
  const aboutRef = useRef<HTMLElement>(null);
  const programsRef = useRef<HTMLElement>(null);
  const teachersRef = useRef<HTMLElement>(null);
  
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
        subject: 'Contact Form Submission - Home Page',
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

  const aboutEntry = useIntersectionObserver(aboutRef, {});
  const programsEntry = useIntersectionObserver(programsRef, {});
  const teachersEntry = useIntersectionObserver(teachersRef, {});

  return (
    <>
      <Hero />

      <Features />

      {/* About section */}
      <section
        ref={aboutRef}
        id="about"
        className={`py-16 bg-neutral-light ${aboutEntry?.isIntersecting ? "animate-fadeIn" : ""}`}
      >
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/2 md:pr-8 mb-8 md:mb-0">
              <h2 className="text-3xl font-bold text-primary mb-6 font-amiri">
                About Our Madrasah
              </h2>
              <p className="mb-4">
                Madrasah Abubakr As-Siddiq was established in 2025 with a vision
                to provide quality Islamic education that nurtures the
                spiritual, moral, and intellectual growth of our students.
              </p>
              <p className="mb-4">
                Named after the first khalifah of Islam, our madrasah aims to
                instill the values of truthfulness, integrity, and devotion that
                Abu Bakr As-Siddiq exemplified.
              </p>
              <p className="mb-6">
                Our mission is to develop well mannered young Muslims who are
                grounded in their faith and prepared to contribute
                positively to society.
              </p>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-border">
                <h3 className="text-xl font-bold text-primary mb-3 font-amiri">
                  Our Core Values
                </h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Excellence in Islamic education and quran recitation</li>
                  <li>Good manners and akhlaaq</li>
                  <li>Love for the Quran</li>
                  <li>Partnership with parents and the wider community</li>
                </ul>
              </div>

              <div className="mt-6">
                <Link
                  href="/about"
                  className="text-primary hover:text-primary-dark font-medium flex items-center"
                >
                  Learn more about us
                  <span className="material-icons ml-1">arrow_forward</span>
                </Link>
              </div>
            </div>

            <div className="md:w-1/2">
              {/* Quran class image */}
              <div className="rounded-lg overflow-hidden shadow-lg mb-6 bg-neutral-light h-64">
  <img
    className="w-full h-full object-cover"
    src={dugsiImg}
    alt="Madrasah class in session"
  />
</div>

              {/* Timeline */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-border">
                <h3 className="text-xl font-bold text-primary mb-4 font-amiri">
                  Our Journey
                </h3>
                <div className="space-y-4">
                  <div className="flex">
                    <div className="flex flex-col items-center mr-4">
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                        1
                      </div>
                      <div className="h-full w-0.5 bg-primary-light"></div>
                    </div>
                    <div className="pb-4">
                      <h4 className="text-lg font-bold">2025: Foundation</h4>
                      <p>Established with just 15 students and 3 teachers.</p>
                    </div>
                  </div>

                  <div className="flex">
                    <div className="flex flex-col items-center mr-4">
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                        2
                      </div>
                      <div className="h-full w-0.5 bg-primary-light"></div>
                    </div>
                    <div className="pb-4">
                      <h4 className="text-lg font-bold">2026: Growth</h4>
                      <p>...</p>
                    </div>
                  </div>

                  <div className="flex">
                    <div className="flex flex-col items-center mr-4">
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                        3
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-bold">2027</h4>
                      <p>...</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Programs preview section */}
      <section
        ref={programsRef}
        id="programs-preview"
        className={`py-16 bg-white ${programsEntry?.isIntersecting ? "animate-fadeIn" : ""}`}
      >
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-primary mb-4 font-amiri">
            Our Programs
          </h2>
          <p className="text-center mb-12 max-w-3xl mx-auto">
            We offer a range of programs designed to meet the educational needs
            of Muslim children at different ages and stages of development.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Program 1 */}
            <div className="bg-neutral-background rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow border border-neutral-border">
              <div className="h-48 bg-primary-light relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="material-icons text-white text-6xl">
                    menu_book
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-primary mb-2 font-amiri">
                  Quran Studies
                </h3>
                <p className="mb-4">
                  Students are grouped by grade level for focused Quran reading
                  and writing instruction.
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-sm bg-primary-light text-white py-1 px-3 rounded-full">
                    All Ages
                  </span>
                  <Link
                    href="/programs#quran-studies"
                    className="text-primary hover:text-primary-dark font-medium flex items-center"
                  >
                    Learn more
                    <span className="material-icons ml-1">arrow_forward</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Program 2 */}
            <div className="bg-neutral-background rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow border border-neutral-border">
              <div className="h-48 bg-primary relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="material-icons text-white text-6xl">
                    school
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-primary mb-2 font-amiri">
                  Foundational Islamic Studies
                </h3>
                <p className="mb-4">
                  Core Islamic studies program for intermediate students.
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-sm bg-primary text-white py-1 px-3 rounded-full">
                    Grade 3-4
                  </span>
                  <Link
                    href="/programs#islamic-studies"
                    className="text-primary hover:text-primary-dark font-medium flex items-center"
                  >
                    Learn more
                    <span className="material-icons ml-1">arrow_forward</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Program 3 */}
            <div className="bg-neutral-background rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow border border-neutral-border">
              <div className="h-48 bg-primary-dark relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="material-icons text-white text-6xl">
                    auto_stories
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-primary mb-2 font-amiri">
                  Shafi'i Fiqh
                </h3>
                <p className="mb-4">
                  Advanced Islamic jurisprudence studies for senior students.
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-sm bg-primary-dark text-white py-1 px-3 rounded-full">
                    Grade 5-6
                  </span>
                  <Link
                    href="/programs#shafii-fiqh"
                    className="text-primary hover:text-primary-dark font-medium flex items-center"
                  >
                    Learn more
                    <span className="material-icons ml-1">arrow_forward</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link
              href="/programs"
              className="bg-primary hover:bg-primary-dark text-white font-medium py-3 px-8 rounded shadow transition duration-300 inline-flex items-center"
            >
              View All Programs
              <span className="material-icons ml-2">arrow_forward</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Faculty preview section */}
      <section
        ref={teachersRef}
        id="faculty-preview"
        className={`py-16 bg-neutral-light ${teachersEntry?.isIntersecting ? "animate-fadeIn" : ""}`}
      >
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-primary mb-4 font-amiri">
            Our Faculty
          </h2>
          <p className="text-center mb-12 max-w-3xl mx-auto">
            Meet our dedicated teachers who bring years of experience in Islamic
            education and a passion for nurturing young Muslims.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Teacher 1 */}
            <div className="bg-neutral-background rounded-lg overflow-hidden shadow-md border border-neutral-border text-center">
              <div className="h-56 bg-neutral-light flex items-center justify-center p-4">
                <img 
                  src={abdulqadirJama}
                  alt="Sheikh Abdul Qadir Jama"
                  className="w-40 h-40 rounded-full object-cover border-4 border-white shadow-md"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-primary mb-1 font-amiri">
                  Sheikh Abdul Qadir Jama
                </h3>
                <p className="text-secondary mb-3 font-medium">
                  Director & Imam - Islamic Studies Teacher
                </p>
                <p className="mb-4 text-sm">
                  Sheikh Abdul Qadir has over 10 years of experience teaching
                  Quran and Islamic studies. He has a degree in Islamic Studies
                  and 8 years of teaching experience.
                </p>
                <div className="border-t border-neutral-border pt-4 mt-4">
                  <p className="text-sm italic">
                    "My goal is to inspire a love for the Quran in every
                    student's heart."
                  </p>
                </div>
              </div>
            </div>

            {/* Teacher 2 */}
            <div className="bg-neutral-background rounded-lg overflow-hidden shadow-md border border-neutral-border text-center">
              <div className="h-56 bg-neutral-light flex items-center justify-center p-4">
                <img 
                  src={ahmedHassan}
                  alt="Ustadh Ahmed Hassan"
                  className="w-40 h-40 rounded-full object-cover border-4 border-white shadow-md"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-primary mb-1 font-amiri">
                  Ustadh Ahmed Hassan
                </h3>
                <p className="text-secondary mb-3 font-medium">Quran Teacher</p>
                <p className="mb-4 text-sm">
                  Ustadh Ahmed has memorised the entire Quran and has been
                  teaching it for years.
                </p>
                <div className="border-t border-neutral-border pt-4 mt-4">
                  <p className="text-sm italic">
                    "Children learn best when education is engaging and
                    meaningful to their lives."
                  </p>
                </div>
              </div>
            </div>

            {/* Teacher 3 */}
            <div className="bg-neutral-background rounded-lg overflow-hidden shadow-md border border-neutral-border text-center">
              <div className="h-56 bg-neutral-light flex items-center justify-center p-4">
                <img 
                  src={sadiqAbdulle}
                  alt="Ustadh Sadiq Abdulle"
                  className="w-40 h-40 rounded-full object-cover border-4 border-white shadow-md"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-primary mb-1 font-amiri">
                  Ustadh Sadiq Abdulle
                </h3>
                <p className="text-secondary mb-3 font-medium">Quran Teacher</p>
                <p className="mb-4 text-sm">
                  Ustadh Sadiq is a hafidh and studying currently degree in
                  teaching. He is very passionate about passing on the Quran to
                  the next generation
                </p>
                <div className="border-t border-neutral-border pt-4 mt-4">
                  <p className="text-sm italic">
                    "We must all strive to have a connection with the Quran."
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            {/* <Link
              href="/faculty"
              className="text-primary hover:text-primary-dark font-medium flex items-center justify-center"
            >
              View all faculty members
              <span className="material-icons ml-1">arrow_forward</span>
            </Link> */}
          </div>
        </div>
      </section>

      <Testimonials />

      <FAQ />

      {/* Contact section preview */}
      <section id="contact-preview" className="py-16 bg-neutral-background">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-primary mb-6 font-amiri">
            Contact Us
          </h2>
          <p className="mb-8 max-w-3xl mx-auto">
            Have questions about our programs or want to schedule a visit? We'd
            love to hear from you!
          </p>

          <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-6">
            <div className="flex items-center">
              <span className="material-icons text-primary text-2xl mr-2">
                email
              </span>
              <span>Contact: Sheikh Abdul Qadir Jama</span>
            </div>
            <div className="flex items-center">
              <span className="material-icons text-primary text-2xl mr-2">
                location_on
              </span>
              <span>Shop 48 The Mall, Heidelberg West 3081</span>
            </div>
          </div>

          <div className="mt-8 max-w-xl mx-auto">
            <form onSubmit={handleContactSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4">
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
      </section>
    </>
  );
}
