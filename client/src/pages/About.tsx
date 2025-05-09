import { useRef } from "react";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import BackgroundPattern from "@/components/ui/BackgroundPattern";

export default function About() {
  const missionRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);
  const valuesRef = useRef<HTMLDivElement>(null);

  const missionEntry = useIntersectionObserver(missionRef, {});
  const historyEntry = useIntersectionObserver(historyRef, {});
  const valuesEntry = useIntersectionObserver(valuesRef, {});

  return (
    <>
      {/* About Hero Section */}
      <section className="bg-primary-dark text-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 font-amiri">
              About Our Madrasah
            </h1>
            <p className="text-xl mb-6 font-arabic text-center">
              بسم الله الرحمن الرحيم
            </p>
            <p className="text-lg mb-8">
              Nurturing the future of our Ummah through quality Islamic
              education, character development, and spiritual growth.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div
            ref={missionRef}
            className={`max-w-4xl mx-auto ${missionEntry?.isIntersecting ? "animate-fadeIn" : ""}`}
          >
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-primary mb-8 font-amiri">
                Our Mission & Vision
              </h2>

              <div className="bg-neutral-light p-8 rounded-lg shadow-sm mb-8">
                <h3 className="text-2xl font-bold text-primary mb-4 font-amiri">
                  Our Mission
                </h3>
                <p className="text-lg">
                  To provide comprehensive Islamic education that nurtures
                  imaan, with a major focus on good manners, in order to prepare
                  students to thrive as confident respectful Muslims in society.
                </p>
              </div>

              <div className="bg-neutral-light p-8 rounded-lg shadow-sm">
                <h3 className="text-2xl font-bold text-primary mb-4 font-amiri">
                  Our Vision
                </h3>
                <p className="text-lg">
                  To be a center of excellence in Islamic education that
                  nurtures the intellectual, spiritual, and moral development of
                  students, empowering them to become upright Muslims who
                  positively contribute to society.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-16">
              <div className="bg-white rounded-lg shadow-md p-6 border border-neutral-border">
                <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mb-4 mx-auto md:mx-0">
                  <span className="material-icons text-white text-2xl">
                    school
                  </span>
                </div>
                <h3 className="text-xl font-bold text-primary mb-3 font-amiri text-center md:text-left">
                  Holistic Education
                </h3>
                <p>
                  We focus on developing our students in various aspects, from proficiency in reading and writing, to good manners, to knowledge of the Quran and Islamic studies.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 border border-neutral-border">
                <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mb-4 mx-auto md:mx-0">
                  <span className="material-icons text-white text-2xl">
                    diversity_3
                  </span>
                </div>
                <h3 className="text-xl font-bold text-primary mb-3 font-amiri text-center md:text-left">
                  Community Focus
                </h3>
                <p>
                  We strive to create a supportive community where parents,
                  teachers, and students work together to nurture a love for
                  Islamic learning and practice in daily life.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our History */}
      <section className="py-16 bg-neutral-background">
        <div className="container mx-auto px-4">
          <div
            ref={historyRef}
            className={`max-w-4xl mx-auto ${historyEntry?.isIntersecting ? "animate-fadeIn" : ""}`}
          >
            <h2 className="text-3xl font-bold text-primary mb-12 font-amiri text-center">
              Our History and goals for the future inshaAllah.
            </h2>

            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-0 md:left-1/2 transform md:translate-x-[-50%] h-full w-1 bg-primary-light"></div>

              {/* Timeline events */}
              <div className="space-y-12">
                <div className="flex flex-col md:flex-row items-center">
                  <div className="md:w-1/2 md:pr-12 mb-4 md:mb-0 md:text-right">
                    <h3 className="text-2xl font-bold text-primary mb-2 font-amiri">
                      2025: Foundation
                    </h3>
                    <p>
                      Madrasah Abubakr As-Siddiq was established in recognition of the need for
                      quality Islamic education. Starting with just a handful of students
                      and 3 teachers in a small rented space.
                    </p>
                  </div>
                  <div className="relative z-10 bg-primary rounded-full w-12 h-12 flex items-center justify-center text-white font-bold mb-4 md:mb-0">
                    2025
                  </div>
                  <div className="md:w-1/2 md:pl-12 md:text-left"></div>
                </div>

                <div className="flex flex-col md:flex-row items-center">
                  <div className="md:w-1/2 md:pr-12 mb-4 md:mb-0 md:text-right order-1 md:order-1"></div>
                  <div className="relative z-10 bg-primary rounded-full w-12 h-12 flex items-center justify-center text-white font-bold mb-4 md:mb-0 order-2 md:order-2">
                    2027
                  </div>
                  <div className="md:w-1/2 md:pl-12 md:text-left order-3 md:order-3">
                    <h3 className="text-2xl font-bold text-primary mb-2 font-amiri">
                      2027: Curriculum Development
                    </h3>
                    <p>
                      Develop a comprehensive curriculum integrating Quranic
                      studies, Islamic knowledge, Arabic language, and akhlaaq.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row items-center">
                  <div className="md:w-1/2 md:pr-12 mb-4 md:mb-0 md:text-right">
                    <h3 className="text-2xl font-bold text-primary mb-2 font-amiri">
                      2028: New Facility
                    </h3>
                    <p>
                      Move to a purpose-built facility, allowing us
                      to expand our programs and accommodate more students.
                      Introduce specialised programs for different age groups.
                    </p>
                  </div>
                  <div className="relative z-10 bg-primary rounded-full w-12 h-12 flex items-center justify-center text-white font-bold mb-4 md:mb-0">
                    2028
                  </div>
                  <div className="md:w-1/2 md:pl-12 md:text-left"></div>
                </div>

                <div className="flex flex-col md:flex-row items-center">
                  <div className="md:w-1/2 md:pr-12 mb-4 md:mb-0 md:text-right order-1 md:order-1"></div>
                  <div className="relative z-10 bg-primary rounded-full w-12 h-12 flex items-center justify-center text-white font-bold mb-4 md:mb-0 order-2 md:order-2">
                    2029
                  </div>
                  <div className="md:w-1/2 md:pl-12 md:text-left order-3 md:order-3">
                    <h3 className="text-2xl font-bold text-primary mb-2 font-amiri">
                      2029: More Teachers
                    </h3>
                    <p>
                      We aim to have more teachers to ensure that we can provide
                      a more personalised and quality education to our students.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row items-center">
                  <div className="md:w-1/2 md:pr-12 mb-4 md:mb-0 md:text-right">
                    <h3 className="text-2xl font-bold text-primary mb-2 font-amiri">
                      And beyond...
                    </h3>
                    <p>
                      We aim to expand our programs and enhance the quality of Islamic education we provide to our
                      community. Come with us on this journey inshaAllah.
                    </p>
                  </div>
                  <div className="relative z-10 bg-primary rounded-full w-12 h-12 flex items-center justify-center text-white font-bold mb-4 md:mb-0">
                    2023
                  </div>
                  <div className="md:w-1/2 md:pl-12 md:text-left"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div
            ref={valuesRef}
            className={`max-w-4xl mx-auto ${valuesEntry?.isIntersecting ? "animate-fadeIn" : ""}`}
          >
            <h2 className="text-3xl font-bold text-primary mb-12 font-amiri text-center">
              Our Core Values
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-neutral-light p-6 rounded-lg shadow-sm border border-neutral-border">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mr-4">
                    <span className="material-icons text-white">
                      auto_stories
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-primary font-amiri">
                    Excellence in Education
                  </h3>
                </div>
                <p>
                  We strive for excellence in all aspects of our educational
                  programs, maintaining high standards for teaching and
                  learning.
                </p>
              </div>

              <div className="bg-neutral-light p-6 rounded-lg shadow-sm border border-neutral-border">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mr-4">
                    <span className="material-icons text-white">favorite</span>
                  </div>
                  <h3 className="text-xl font-bold text-primary font-amiri">
                    Good Manners
                  </h3>
                </div>
                <p>
                  We emphasize the development of good manners and akhlaaq in all our students, teaching them to embody Islamic
                  values.
                </p>
              </div>

              <div className="bg-neutral-light p-6 rounded-lg shadow-sm border border-neutral-border">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mr-4">
                    <span className="material-icons text-white">
                      diversity_1
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-primary font-amiri">
                    Love for the Quran
                  </h3>
                </div>
                <p>
                  We love the Quran and teach our students the importance of
                  learning it, memorising it and reciting it.
                </p>
              </div>

              <div className="bg-neutral-light p-6 rounded-lg shadow-sm border border-neutral-border">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mr-4">
                    <span className="material-icons text-white">
                      volunteer_activism
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-primary font-amiri">
                    Community Service
                  </h3>
                </div>
                <p>
                  We foster a spirit of service and social responsibility,
                  encouraging students to contribute positively to their
                  communities.
                </p>
              </div>

              <div className="bg-neutral-light p-6 rounded-lg shadow-sm border border-neutral-border">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mr-4">
                    <span className="material-icons text-white">
                      family_restroom
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-primary font-amiri">
                    Family Partnership
                  </h3>
                </div>
                <p>
                  We believe in strong partnerships with parents and families,
                  recognizing that education is a shared responsibility.
                </p>
              </div>

              <div className="bg-neutral-light p-6 rounded-lg shadow-sm border border-neutral-border">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mr-4">
                    <span className="material-icons text-white">
                      psychology
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-primary font-amiri">
                    Critical Thinking
                  </h3>
                </div>
                <p>
                  We encourage critical thinking and reflection within an
                  Islamic framework, helping students navigate contemporary
                  challenges.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4 font-amiri">
            Join Our Community
          </h2>
          <p className="mb-8 max-w-2xl mx-auto">
            We invite you to be part of our vibrant community of learners,
            educators, and parents committed to nurturing the next generation of
            Muslims.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <a
              href="/admission"
              className="bg-white text-primary hover:bg-neutral-light font-medium py-3 px-8 rounded shadow transition duration-300"
            >
              Apply for Admission
            </a>
            <a
              href="/contact"
              className="bg-secondary hover:bg-secondary-dark text-white font-medium py-3 px-8 rounded shadow transition duration-300"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
