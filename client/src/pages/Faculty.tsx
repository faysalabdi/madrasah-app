import { useRef } from "react";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import { Link } from "wouter";
import BackgroundPattern from "@/components/ui/BackgroundPattern";

export default function Faculty() {
  const teachersRef = useRef<HTMLDivElement>(null);
  const principalRef = useRef<HTMLDivElement>(null);
  const valuesRef = useRef<HTMLDivElement>(null);

  const teachersEntry = useIntersectionObserver(teachersRef, {});
  const principalEntry = useIntersectionObserver(principalRef, {});
  const valuesEntry = useIntersectionObserver(valuesRef, {});

  return (
    <>
      {/* Faculty Hero Section */}
      <section className="bg-primary-dark text-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 font-amiri">
              Our Faculty
            </h1>
            <p className="text-lg mb-8">
              Meet our dedicated teachers who bring years of experience in
              Islamic education and a passion for nurturing young Muslims.
            </p>
          </div>
        </div>
      </section>

      {/* Principal Message */}
      <section
        ref={principalRef}
        className={`py-16 bg-white ${principalEntry?.isIntersecting ? "animate-fadeIn" : ""}`}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-neutral-light p-8 rounded-lg shadow-sm">
              <div className="flex flex-col md:flex-row items-center md:items-start">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-primary-light mb-6 md:mb-0 md:mr-8 flex items-center justify-center">
                  <span className="material-icons text-white text-6xl">
                    person
                  </span>
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-primary mb-4 font-amiri text-center md:text-left">
                    Message from the Principal
                  </h2>
                  <h3 className="text-xl font-bold text-secondary mb-2 font-amiri text-center md:text-left">
                    Sheikh Abdullah Rahman
                  </h3>
                  <p className="italic text-sm mb-4 text-center md:text-left">
                    Principal & Quran Teacher
                  </p>
                  <div className="space-y-4">
                    <p>
                      Assalamu Alaikum wa Rahmatullahi wa Barakatuh (Peace,
                      mercy and blessings of Allah be upon you),
                    </p>
                    <p>
                      At Madrasah Abubakr As-Siddiq, we are committed to
                      providing a nurturing environment where children can
                      develop a deep love for the Quran and Islamic knowledge.
                      Our mission is to guide students in becoming confident
                      Muslims who embody Islamic values in their daily lives.
                    </p>
                    <p>
                      Our dedicated team of teachers brings passion, expertise,
                      and a genuine care for each student's spiritual and
                      academic growth. We believe in a balanced approach that
                      engages students through interactive teaching methods
                      while maintaining the authenticity of traditional Islamic
                      education.
                    </p>
                    <p>
                      We invite you to visit our madrasah and see firsthand the
                      vibrant learning community we have created. May Allah
                      bless our efforts in nurturing the next generation of
                      Muslims.
                    </p>
                    <p className="font-arabic text-right text-lg">
                      والسلام عليكم ورحمة الله وبركاته
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Teaching Values */}
      <section
        ref={valuesRef}
        className={`py-16 bg-neutral-light ${valuesEntry?.isIntersecting ? "animate-fadeIn" : ""}`}
      >
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-primary mb-12 font-amiri text-center">
            Our Teaching Philosophy
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-border text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4 mx-auto">
                <span className="material-icons text-white text-2xl">
                  psychology
                </span>
              </div>
              <h3 className="text-xl font-bold text-primary mb-3 font-amiri">
                Engaging Instruction
              </h3>
              <p>
                We use interactive teaching methods that engage students and
                make learning enjoyable while maintaining educational rigor.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-border text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4 mx-auto">
                <span className="material-icons text-white text-2xl">
                  person_search
                </span>
              </div>
              <h3 className="text-xl font-bold text-primary mb-3 font-amiri">
                Individual Attention
              </h3>
              <p>
                We recognize each student's unique learning style and pace,
                providing personalized attention to help every student thrive.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-border text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4 mx-auto">
                <span className="material-icons text-white text-2xl">
                  volunteer_activism
                </span>
              </div>
              <h3 className="text-xl font-bold text-primary mb-3 font-amiri">
                Nurturing Environment
              </h3>
              <p>
                We create a supportive atmosphere where students feel safe,
                respected, and encouraged to ask questions and express
                themselves.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Faculty Members */}
      <section
        ref={teachersRef}
        className={`py-16 bg-white ${teachersEntry?.isIntersecting ? "animate-fadeIn" : ""}`}
      >
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-primary mb-12 font-amiri text-center">
            Meet Our Teachers
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Teacher 1 */}
            <div className="bg-neutral-background rounded-lg overflow-hidden shadow-md border border-neutral-border text-center">
              <div className="h-56 bg-neutral-light relative">
                <div className="w-32 h-32 rounded-full bg-primary-light mx-auto mt-8 flex items-center justify-center">
                  <span className="material-icons text-white text-5xl">
                    person
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-primary mb-1 font-amiri">
                  Sheikh Abdullah Rahman
                </h3>
                <p className="text-secondary mb-3 font-medium">
                  Principal & Quran Teacher
                </p>
                <p className="mb-4 text-sm">
                  Sheikh Abdullah has over 15 years of experience teaching Quran
                  and Islamic studies. He holds an Ijazah in Quran recitation
                  and has memorized the entire Quran.
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
              <div className="h-56 bg-neutral-light relative">
                <div className="w-32 h-32 rounded-full bg-primary-light mx-auto mt-8 flex items-center justify-center">
                  <span className="material-icons text-white text-5xl">
                    person
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-primary mb-1 font-amiri">
                  Ustadha Aisha Malik
                </h3>
                <p className="text-secondary mb-3 font-medium">
                  Islamic Studies Teacher
                </p>
                <p className="mb-4 text-sm">
                  Ustadha Aisha specializes in teaching Islamic studies and
                  Arabic to young children. She has a degree in Islamic
                  Education and 8 years of teaching experience.
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
              <div className="h-56 bg-neutral-light relative">
                <div className="w-32 h-32 rounded-full bg-primary-light mx-auto mt-8 flex items-center justify-center">
                  <span className="material-icons text-white text-5xl">
                    person
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-primary mb-1 font-amiri">
                  Ustadh Mohammed Ali
                </h3>
                <p className="text-secondary mb-3 font-medium">
                  Arabic Language Teacher
                </p>
                <p className="mb-4 text-sm">
                  Ustadh Mohammed is a native Arabic speaker with a passion for
                  teaching the language to young Muslims. He has 10 years of
                  experience and a certificate in Arabic pedagogy.
                </p>
                <div className="border-t border-neutral-border pt-4 mt-4">
                  <p className="text-sm italic">
                    "Understanding Arabic opens the door to a deeper connection
                    with the Quran."
                  </p>
                </div>
              </div>
            </div>

            {/* Teacher 4 */}
            <div className="bg-neutral-background rounded-lg overflow-hidden shadow-md border border-neutral-border text-center">
              <div className="h-56 bg-neutral-light relative">
                <div className="w-32 h-32 rounded-full bg-primary-light mx-auto mt-8 flex items-center justify-center">
                  <span className="material-icons text-white text-5xl">
                    person
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-primary mb-1 font-amiri">
                  Ustadh Bilal Hassan
                </h3>
                <p className="text-secondary mb-3 font-medium">
                  Hifz Program Instructor
                </p>
                <p className="mb-4 text-sm">
                  Ustadh Bilal is a hafiz (has memorized the entire Quran) and
                  specializes in teaching memorization techniques. He has guided
                  numerous students to complete their hifz.
                </p>
                <div className="border-t border-neutral-border pt-4 mt-4">
                  <p className="text-sm italic">
                    "Memorizing the Quran requires dedication, but the reward is
                    immeasurable."
                  </p>
                </div>
              </div>
            </div>

            {/* Teacher 5 */}
            <div className="bg-neutral-background rounded-lg overflow-hidden shadow-md border border-neutral-border text-center">
              <div className="h-56 bg-neutral-light relative">
                <div className="w-32 h-32 rounded-full bg-primary-light mx-auto mt-8 flex items-center justify-center">
                  <span className="material-icons text-white text-5xl">
                    person
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-primary mb-1 font-amiri">
                  Ustadha Fatima Khan
                </h3>
                <p className="text-secondary mb-3 font-medium">
                  Early Learners Teacher
                </p>
                <p className="mb-4 text-sm">
                  Ustadha Fatima has specialized training in early childhood
                  education and Islamic studies. She makes learning fun and
                  engaging for our youngest students.
                </p>
                <div className="border-t border-neutral-border pt-4 mt-4">
                  <p className="text-sm italic">
                    "The early years are the foundation for a lifetime of
                    Islamic learning."
                  </p>
                </div>
              </div>
            </div>

            {/* Teacher 6 */}
            <div className="bg-neutral-background rounded-lg overflow-hidden shadow-md border border-neutral-border text-center">
              <div className="h-56 bg-neutral-light relative">
                <div className="w-32 h-32 rounded-full bg-primary-light mx-auto mt-8 flex items-center justify-center">
                  <span className="material-icons text-white text-5xl">
                    person
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-primary mb-1 font-amiri">
                  Ustadh Yusuf Ahmed
                </h3>
                <p className="text-secondary mb-3 font-medium">
                  Islamic History & Ethics
                </p>
                <p className="mb-4 text-sm">
                  Ustadh Yusuf has a background in Islamic history and
                  contemporary Islamic studies. He helps students understand how
                  to apply Islamic principles in modern life.
                </p>
                <div className="border-t border-neutral-border pt-4 mt-4">
                  <p className="text-sm italic">
                    "Understanding our history helps us navigate our future with
                    confidence."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Qualifications */}
      <section className="py-16 bg-neutral-light">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-primary mb-8 font-amiri text-center">
              Teacher Qualifications
            </h2>

            <div className="bg-white p-8 rounded-lg shadow-sm">
              <p className="mb-6">
                At Madrasah Abubakr As-Siddiq, we maintain high standards for
                our teaching staff. All of our teachers:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                    <span className="material-icons text-white">school</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-primary mb-2">
                      Academic Credentials
                    </h3>
                    <p className="text-sm">
                      Hold degrees or certification in Islamic studies, Arabic
                      language, or education from reputable institutions.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                    <span className="material-icons text-white">
                      history_edu
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-primary mb-2">
                      Religious Knowledge
                    </h3>
                    <p className="text-sm">
                      Possess comprehensive knowledge of the Quran, Hadith,
                      Fiqh, and other Islamic sciences relevant to their
                      teaching area.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                    <span className="material-icons text-white">
                      psychology
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-primary mb-2">
                      Teaching Experience
                    </h3>
                    <p className="text-sm">
                      Have practical teaching experience and demonstrate
                      effective instructional skills and classroom management.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                    <span className="material-icons text-white">
                      verified_user
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-primary mb-2">
                      Background Checks
                    </h3>
                    <p className="text-sm">
                      Undergo thorough background checks to ensure the safety
                      and well-being of our students.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                    <span className="material-icons text-white">update</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-primary mb-2">
                      Continuous Development
                    </h3>
                    <p className="text-sm">
                      Participate in ongoing professional development to enhance
                      their teaching skills and knowledge.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                    <span className="material-icons text-white">favorite</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-primary mb-2">
                      Character & Conduct
                    </h3>
                    <p className="text-sm">
                      Exemplify Islamic values and ethics in their personal
                      conduct and serve as role models for students.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Join Our Team CTA */}
      <section className="py-12 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4 font-amiri">
            Join Our Teaching Team
          </h2>
          <p className="mb-8 max-w-2xl mx-auto">
            We're always looking for qualified and passionate educators to join
            our faculty. If you're dedicated to Islamic education and want to
            make a difference in young Muslims' lives, we'd love to hear from
            you.
          </p>
          <Link
            href="/contact"
            className="bg-white text-primary hover:bg-neutral-light font-medium py-3 px-8 rounded shadow transition duration-300"
          >
            Contact Us About Teaching Opportunities
          </Link>
        </div>
      </section>
    </>
  );
}
