import { useState, useRef } from "react";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import BackgroundPattern from "@/components/ui/BackgroundPattern";
import { Link } from "wouter";

export default function Admission() {
  const stepsRef = useRef<HTMLDivElement>(null);
  const requirementsRef = useRef<HTMLDivElement>(null);
  const feesRef = useRef<HTMLDivElement>(null);
  
  const stepsEntry = useIntersectionObserver(stepsRef, {});
  const requirementsEntry = useIntersectionObserver(requirementsRef, {});
  const feesEntry = useIntersectionObserver(feesRef, {});

  return (
    <>
      {/* Admission Hero Section */}
      <section className="bg-neutral-background islamic-pattern py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-primary mb-6 font-amiri text-center">Admission Process</h1>
            <p className="text-center mb-8">Join our community of learners and embark on a journey of Islamic knowledge and spiritual growth.</p>
            
            <div className="bg-secondary text-white py-3 px-4 rounded-lg mb-8">
              <div className="flex items-center justify-center">
                <span className="material-icons mr-2">campaign</span>
                <p className="font-medium">Enrollment for Fall 2023 is now open! <Link href="#apply-now" className="underline font-bold hover:text-primary-dark">Apply today</Link></p>
              </div>
            </div>
            
            <div ref={stepsRef} className={`flex flex-col md:flex-row mb-8 ${stepsEntry?.isIntersecting ? 'animate-fadeIn' : ''}`}>
              <div className="md:w-1/2 md:pr-6 mb-6 md:mb-0">
                <h3 className="text-xl font-bold text-primary mb-4 font-amiri">How to Apply</h3>
                <ol className="space-y-4">
                  <li className="flex">
                    <span className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0">1</span>
                    <div>
                      <h4 className="font-bold mb-1">Complete Application Form</h4>
                      <p className="text-sm">Fill out our online application form or visit our office to collect a physical copy.</p>
                    </div>
                  </li>
                  <li className="flex">
                    <span className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0">2</span>
                    <div>
                      <h4 className="font-bold mb-1">Assessment</h4>
                      <p className="text-sm">Students undergo a basic assessment to determine their current level of knowledge.</p>
                    </div>
                  </li>
                  <li className="flex">
                    <span className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0">3</span>
                    <div>
                      <h4 className="font-bold mb-1">Interview</h4>
                      <p className="text-sm">Parents and students meet with our administration for a brief interview.</p>
                    </div>
                  </li>
                  <li className="flex">
                    <span className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0">4</span>
                    <div>
                      <h4 className="font-bold mb-1">Enrollment</h4>
                      <p className="text-sm">Upon acceptance, complete the enrollment process and fee payment.</p>
                    </div>
                  </li>
                </ol>
              </div>
              
              <div ref={requirementsRef} className={`md:w-1/2 md:pl-6 border-t md:border-t-0 md:border-l border-neutral-border pt-6 md:pt-0 md:pl-12 ${requirementsEntry?.isIntersecting ? 'animate-fadeIn' : ''}`}>
                <h3 className="text-xl font-bold text-primary mb-4 font-amiri">Required Documents</h3>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start">
                    <span className="material-icons text-secondary mr-2">description</span>
                    <span>Completed application form</span>
                  </li>
                  <li className="flex items-start">
                    <span className="material-icons text-secondary mr-2">description</span>
                    <span>Birth certificate (copy)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="material-icons text-secondary mr-2">description</span>
                    <span>Recent photograph</span>
                  </li>
                  <li className="flex items-start">
                    <span className="material-icons text-secondary mr-2">description</span>
                    <span>Previous school records (if applicable)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="material-icons text-secondary mr-2">description</span>
                    <span>Immunization records</span>
                  </li>
                </ul>
                
                <div ref={feesRef} className={`bg-primary-light bg-opacity-10 p-4 rounded-lg border border-primary-light ${feesEntry?.isIntersecting ? 'animate-fadeIn' : ''}`}>
                  <h4 className="font-bold text-primary mb-2">Tuition Fees</h4>
                  <p className="text-sm mb-2">Our programs are affordably priced with options for financial aid:</p>
                  <ul className="text-sm space-y-1">
                    <li>Early Learners: $75/month</li>
                    <li>Foundation Program: $100/month</li>
                    <li>Youth Program: $125/month</li>
                    <li>Hifz Program: $150/month</li>
                  </ul>
                  <p className="text-xs mt-3 italic">Registration fee: $50 (one-time, non-refundable). Discounts available for siblings.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Application Form Section */}
      <section id="apply-now" className="py-16 bg-white scroll-mt-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-primary mb-8 font-amiri text-center">Application Form</h2>
            
            <form className="bg-neutral-light p-8 rounded-lg shadow-sm">
              <div className="mb-8">
                <h3 className="text-xl font-bold text-primary mb-4 font-amiri">Student Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block mb-2 font-medium">First Name*</label>
                    <input 
                      type="text" 
                      id="firstName" 
                      className="w-full px-4 py-2 border border-neutral-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block mb-2 font-medium">Last Name*</label>
                    <input 
                      type="text" 
                      id="lastName" 
                      className="w-full px-4 py-2 border border-neutral-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="dob" className="block mb-2 font-medium">Date of Birth*</label>
                    <input 
                      type="date" 
                      id="dob" 
                      className="w-full px-4 py-2 border border-neutral-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="gender" className="block mb-2 font-medium">Gender*</label>
                    <select 
                      id="gender" 
                      className="w-full px-4 py-2 border border-neutral-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    >
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="mb-8">
                <h3 className="text-xl font-bold text-primary mb-4 font-amiri">Program Selection</h3>
                <div>
                  <label htmlFor="program" className="block mb-2 font-medium">Select Program*</label>
                  <select 
                    id="program" 
                    className="w-full px-4 py-2 border border-neutral-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  >
                    <option value="">Select a program</option>
                    <option value="early-learners">Early Learners (Ages 4-6)</option>
                    <option value="foundation">Foundation Program (Ages 7-12)</option>
                    <option value="youth">Youth Program (Ages 13-18)</option>
                    <option value="hifz">Hifz Program</option>
                  </select>
                </div>
              </div>
              
              <div className="mb-8">
                <h3 className="text-xl font-bold text-primary mb-4 font-amiri">Parent/Guardian Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="parentName" className="block mb-2 font-medium">Full Name*</label>
                    <input 
                      type="text" 
                      id="parentName" 
                      className="w-full px-4 py-2 border border-neutral-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="relationship" className="block mb-2 font-medium">Relationship to Student*</label>
                    <input 
                      type="text" 
                      id="relationship" 
                      className="w-full px-4 py-2 border border-neutral-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block mb-2 font-medium">Email*</label>
                    <input 
                      type="email" 
                      id="email" 
                      className="w-full px-4 py-2 border border-neutral-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block mb-2 font-medium">Phone Number*</label>
                    <input 
                      type="tel" 
                      id="phone" 
                      className="w-full px-4 py-2 border border-neutral-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="mb-8">
                <h3 className="text-xl font-bold text-primary mb-4 font-amiri">Additional Information</h3>
                <div>
                  <label htmlFor="previousIslamic" className="block mb-2 font-medium">Previous Islamic Education (if any)</label>
                  <textarea 
                    id="previousIslamic" 
                    rows={3}
                    className="w-full px-4 py-2 border border-neutral-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  ></textarea>
                </div>
              </div>
              
              <div className="flex items-center mb-6">
                <input 
                  type="checkbox" 
                  id="agreement" 
                  className="w-4 h-4 text-primary rounded focus:ring-primary"
                  required
                />
                <label htmlFor="agreement" className="ml-2 text-sm">
                  I confirm that all information provided is accurate and I agree to follow the school's policies and procedures.
                </label>
              </div>
              
              <div className="text-center">
                <button 
                  type="submit" 
                  className="bg-primary hover:bg-primary-dark text-white font-medium py-3 px-8 rounded shadow transition duration-300"
                >
                  Submit Application
                </button>
              </div>
            </form>
            
            <p className="text-center mt-6 text-sm">
              After submitting your application, our admissions team will contact you within 3-5 business days to schedule an assessment and interview.
            </p>
          </div>
        </div>
      </section>
      
      {/* FAQ About Admission */}
      <section className="py-16 bg-neutral-light">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-primary mb-8 font-amiri text-center">Frequently Asked Questions</h2>
            
            <div className="space-y-4">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-bold text-primary mb-2">Is there an age requirement for admission?</h3>
                <p>Yes, our programs have specific age requirements. The Early Learners program accepts children aged 4-6, the Foundation Program is for ages 7-12, and the Youth Program is for ages 13-18. The Hifz Program accepts qualified students from all age groups.</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-bold text-primary mb-2">Do you offer financial aid?</h3>
                <p>Yes, we offer financial aid for families who demonstrate need. We believe that Islamic education should be accessible to all members of our community. Please contact our administrative office for details on how to apply for financial assistance.</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-bold text-primary mb-2">Can students join mid-year?</h3>
                <p>Yes, we accept students throughout the year, space permitting. New students will undergo an assessment to determine their current level of knowledge, and our teachers will develop a plan to help them integrate into ongoing classes.</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-bold text-primary mb-2">What is the student-to-teacher ratio?</h3>
                <p>We maintain small class sizes to ensure quality instruction. Our typical student-to-teacher ratio is 10:1 for Early Learners, 15:1 for the Foundation Program, and 12:1 for the Youth Program. The Hifz Program offers more personalized attention with a ratio of 6:1.</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-bold text-primary mb-2">Is prior Islamic knowledge required?</h3>
                <p>No prior Islamic knowledge is required for admission. Our programs are designed to accommodate students at various levels of knowledge and experience. Each student will be assessed to determine their appropriate placement.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Contact for Admission */}
      <section className="py-12 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4 font-amiri">Questions About Admission?</h2>
          <p className="mb-6 max-w-2xl mx-auto">Our admissions team is here to help. Contact us for more information about our programs and the application process.</p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-8">
            <div className="flex items-center">
              <span className="material-icons mr-2">email</span>
              <span>admissions@madrasa-abubakr.org</span>
            </div>
            <div className="flex items-center">
              <span className="material-icons mr-2">call</span>
              <span>(123) 456-7890 ext. 2</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
