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
            <h1 className="text-3xl md:text-4xl font-bold text-primary mb-6 font-amiri text-center">
              Admission Process
            </h1>
            <p className="text-center mb-8">
              Join our community of learners and embark on a journey of Islamic
              knowledge and spiritual growth.
            </p>

            <div className="bg-secondary text-white py-3 px-4 rounded-lg mb-8">
              <div className="flex items-center justify-center">
                <span className="material-icons mr-2">campaign</span>
                <p className="font-medium">
                  Enrollment for Term 2 2025 is now open!{" "}
                  <Link
                    href="/apply"
                    className="underline font-bold hover:text-primary-dark"
                  >
                    Apply online
                  </Link>{" "}
                  or{" "}
                  <Link
                    href="#apply-now"
                    className="underline font-bold hover:text-primary-dark"
                  >
                    fill the form below
                  </Link>
                </p>
              </div>
            </div>

            <div
              ref={stepsRef}
              className={`flex flex-col md:flex-row mb-8 ${stepsEntry?.isIntersecting ? "animate-fadeIn" : ""}`}
            >
              <div className="md:w-1/2 md:pr-6 mb-6 md:mb-0">
                <h3 className="text-xl font-bold text-primary mb-4 font-amiri">
                  How to Apply
                </h3>
                <ol className="space-y-4">
                  <li className="flex">
                    <span className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0">
                      1
                    </span>
                    <div>
                      <h4 className="font-bold mb-1">
                        Complete Application Form
                      </h4>
                      <p className="text-sm">
                        Fill out our online application form or visit our office
                        to collect a physical copy.
                      </p>
                    </div>
                  </li>
                  <li className="flex">
                    <span className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0">
                      2
                    </span>
                    <div>
                      <h4 className="font-bold mb-1">Assessment</h4>
                      <p className="text-sm">
                        Students undergo a basic assessment to determine their
                        current level of knowledge.
                      </p>
                    </div>
                  </li>
                  <li className="flex">
                    <span className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0">
                      3
                    </span>
                    <div>
                      <h4 className="font-bold mb-1">Enrollment</h4>
                      <p className="text-sm">
                        Upon acceptance, complete the enrollment process and fee
                        payment.
                      </p>
                    </div>
                  </li>
                </ol>
              </div>

              <div
                ref={requirementsRef}
                className={`md:w-1/2 md:pl-6 border-t md:border-t-0 md:border-l border-neutral-border pt-6 md:pt-0 md:pl-12 ${requirementsEntry?.isIntersecting ? "animate-fadeIn" : ""}`}
              >
                <h3 className="text-xl font-bold text-primary mb-4 font-amiri">
                  Important Information for Parents
                </h3>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start">
                    <span className="material-icons text-secondary mr-2">
                      check_circle
                    </span>
                    <span>
                      Drop students off on time 5:30pm on weekdays and 10am on
                      Saturdays
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="material-icons text-secondary mr-2">
                      check_circle
                    </span>
                    <span>Pick up students on time. Drive carefully</span>
                  </li>
                  <li className="flex items-start">
                    <span className="material-icons text-secondary mr-2">
                      check_circle
                    </span>
                    <span>
                      Ensure student is in clean, neat and correct uniform and
                      clean socks
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="material-icons text-secondary mr-2">
                      check_circle
                    </span>
                    <span>
                      Student's Record Book is checked and signed daily
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="material-icons text-secondary mr-2">
                      check_circle
                    </span>
                    <span>Student has eaten before coming to Madrassah</span>
                  </li>
                  <li className="flex items-start">
                    <span className="material-icons text-secondary mr-2">
                      check_circle
                    </span>
                    <span>Student went to toilet before Madrassah</span>
                  </li>
                  <li className="flex items-start">
                    <span className="material-icons text-secondary mr-2">
                      check_circle
                    </span>
                    <span>Student made wudhu before coming to Madrassah</span>
                  </li>
                  <li className="flex items-start">
                    <span className="material-icons text-secondary mr-2">
                      check_circle
                    </span>
                    <span>Homework was completed the night before</span>
                  </li>
                </ul>

                <div
                  ref={feesRef}
                  className={`bg-primary-light bg-opacity-10 p-4 rounded-lg border border-primary-light ${feesEntry?.isIntersecting ? "animate-fadeIn" : ""}`}
                >
                  <h4 className="font-bold text-primary mb-2">
                    Fees Structure Per School Term – Due By Week 7
                  </h4>
                  <ul className="text-sm space-y-1">
                    <li>1 child: $180</li>
                    <li>2 Children: $330</li>
                    <li>3 Children: $450</li>
                    <li>4 Children: $505</li>
                    <li>5 Children: $555</li>
                  </ul>
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
            <h2 className="text-3xl font-bold text-primary mb-6 font-amiri text-center">
              Application Form
            </h2>

            <div className="bg-secondary-light text-primary-dark p-4 rounded-lg mb-8 text-center">
              <p className="font-medium flex items-center justify-center">
                <span className="material-icons mr-2">info</span>
                Our admissions team is available to assist you with the
                application process
              </p>
            </div>

            <div className="bg-neutral-light p-6 rounded-lg shadow-lg">
              <div className="w-full h-[1200px] overflow-hidden rounded-lg">
                <iframe
                  src="https://docs.google.com/forms/d/e/1FAIpQLSfE3a-8-BKwoSSfTVczKahEA9D8h-u1H-SjfcfPukZaHKW0JA/viewform?embedded=true"
                  width="100%"
                  height="100%"
                  style={{ border: "none" }}
                  title="Application Form"
                >
                  Loading Application Form...
                </iframe>
              </div>
            </div>

            <p className="text-center mt-6 text-sm">
              After submitting your application, our admissions team will
              contact you within 3-5 business days to schedule an assessment and
              interview.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ About Admission */}
      <section className="py-16 bg-neutral-light">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-primary mb-8 font-amiri text-center">
              Frequently Asked Questions
            </h2>

            <div className="space-y-4">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-bold text-primary mb-2">
                  Is there an age requirement for admission?
                </h3>
                <p>
                  Yes, our programs have specific age requirements. The Early
                  Learners program accepts children aged 4-6, the Foundation
                  Program is for ages 7-12, and the Youth Program is for ages
                  13-18. The Hifz Program accepts qualified students from all
                  age groups.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-bold text-primary mb-2">
                  Do you offer financial aid?
                </h3>
                <p>
                  Yes, we offer financial aid for families who demonstrate need.
                  We believe that Islamic education should be accessible to all
                  members of our community. Please contact our administrative
                  office for details on how to apply for financial assistance.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-bold text-primary mb-2">
                  Can students join mid-year?
                </h3>
                <p>
                  Yes, we accept students throughout the year, space permitting.
                  New students will undergo an assessment to determine their
                  current level of knowledge, and our teachers will develop a
                  plan to help them integrate into ongoing classes.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-bold text-primary mb-2">
                  What is the student-to-teacher ratio?
                </h3>
                <p>
                  We maintain small class sizes to ensure quality instruction.
                  Our typical student-to-teacher ratio is 10:1 for Early
                  Learners, 15:1 for the Foundation Program, and 12:1 for the
                  Youth Program. The Hifz Program offers more personalized
                  attention with a ratio of 6:1.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-bold text-primary mb-2">
                  Is prior Islamic knowledge required?
                </h3>
                <p>
                  No prior Islamic knowledge is required for admission. Our
                  programs are designed to accommodate students at various
                  levels of knowledge and experience. Each student will be
                  assessed to determine their appropriate placement.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact for Admission */}
      <section className="py-12 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4 font-amiri">
            Questions About Admission?
          </h2>
          <p className="mb-6 max-w-2xl mx-auto">
            Our admissions team is here to help. Contact us for more information
            about our programs and the application process.
          </p>
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
