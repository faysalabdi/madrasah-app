import { useRef, useState } from "react";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import BackgroundPattern from "@/components/ui/BackgroundPattern";
import { Link } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Programs() {
  const programsRef = useRef<HTMLDivElement>(null);
  const scheduleRef = useRef<HTMLDivElement>(null);
  const curriculumRef = useRef<HTMLDivElement>(null);
  
  const programsEntry = useIntersectionObserver(programsRef, {});
  const scheduleEntry = useIntersectionObserver(scheduleRef, {});
  const curriculumEntry = useIntersectionObserver(curriculumRef, {});

  return (
    <>
      {/* Programs Hero Section */}
      <section className="bg-primary-dark text-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 font-amiri">Our Programs</h1>
            <p className="text-lg mb-8">Comprehensive Islamic education programs designed for students of all ages, focusing on Quranic studies, Islamic knowledge, and character development.</p>
          </div>
        </div>
      </section>
      
      {/* Programs Overview */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div ref={programsRef} className={`max-w-5xl mx-auto ${programsEntry?.isIntersecting ? 'animate-fadeIn' : ''}`}>
            <h2 className="text-3xl font-bold text-primary mb-12 font-amiri text-center">Programs Overview</h2>
            
            <div className="space-y-16">
              {/* Early Learners Program */}
              <div id="early-learners" className="scroll-mt-24">
                <div className="bg-neutral-background rounded-lg overflow-hidden shadow-md border border-neutral-border">
                  <div className="md:flex">
                    <div className="md:w-1/3 bg-primary-light p-8 text-white flex items-center justify-center">
                      <div className="text-center">
                        <span className="material-icons text-6xl mb-4">child_care</span>
                        <h3 className="text-2xl font-bold font-amiri">Early Learners</h3>
                        <p className="mt-2">Ages 4-6</p>
                        <div className="mt-4 inline-block bg-white text-primary-dark py-1 px-3 rounded-full text-sm">
                          Weekdays: 9am-12pm
                        </div>
                      </div>
                    </div>
                    <div className="md:w-2/3 p-8">
                      <h4 className="text-xl font-bold text-primary mb-4 font-amiri">Program Description</h4>
                      <p className="mb-4">A gentle introduction to Islam through stories, nasheeds, and basic Quranic letters, designed specifically for our youngest students.</p>
                      
                      <h4 className="text-lg font-bold text-primary mt-6 mb-3 font-amiri">Key Components</h4>
                      <ul className="space-y-2">
                        <li className="flex items-start">
                          <span className="material-icons text-secondary mr-2">check_circle</span>
                          <span>Interactive learning through play and engaging activities</span>
                        </li>
                        <li className="flex items-start">
                          <span className="material-icons text-secondary mr-2">check_circle</span>
                          <span>Arabic alphabet recognition and simple words</span>
                        </li>
                        <li className="flex items-start">
                          <span className="material-icons text-secondary mr-2">check_circle</span>
                          <span>Basic Islamic etiquettes and daily prayers</span>
                        </li>
                        <li className="flex items-start">
                          <span className="material-icons text-secondary mr-2">check_circle</span>
                          <span>Stories of the prophets and companions</span>
                        </li>
                        <li className="flex items-start">
                          <span className="material-icons text-secondary mr-2">check_circle</span>
                          <span>Islamic nasheeds and memorization of short surahs</span>
                        </li>
                      </ul>
                      
                      <div className="mt-8 flex justify-end">
                        <Link href="/admission" className="bg-primary hover:bg-primary-dark text-white font-medium py-2 px-6 rounded shadow transition duration-300">
                          Apply Now
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Foundation Program */}
              <div id="foundation-program" className="scroll-mt-24">
                <div className="bg-neutral-background rounded-lg overflow-hidden shadow-md border border-neutral-border">
                  <div className="md:flex">
                    <div className="md:w-1/3 bg-primary p-8 text-white flex items-center justify-center">
                      <div className="text-center">
                        <span className="material-icons text-6xl mb-4">school</span>
                        <h3 className="text-2xl font-bold font-amiri">Foundation Program</h3>
                        <p className="mt-2">Ages 7-12</p>
                        <div className="mt-4 inline-block bg-white text-primary-dark py-1 px-3 rounded-full text-sm">
                          Weekdays: 4pm-6pm
                        </div>
                      </div>
                    </div>
                    <div className="md:w-2/3 p-8">
                      <h4 className="text-xl font-bold text-primary mb-4 font-amiri">Program Description</h4>
                      <p className="mb-4">Our core program focusing on Quran memorization, understanding, and comprehensive Islamic studies for elementary and middle school students.</p>
                      
                      <h4 className="text-lg font-bold text-primary mt-6 mb-3 font-amiri">Key Components</h4>
                      <ul className="space-y-2">
                        <li className="flex items-start">
                          <span className="material-icons text-secondary mr-2">check_circle</span>
                          <span>Quran recitation with proper tajweed rules</span>
                        </li>
                        <li className="flex items-start">
                          <span className="material-icons text-secondary mr-2">check_circle</span>
                          <span>Memorization of selected surahs and duas</span>
                        </li>
                        <li className="flex items-start">
                          <span className="material-icons text-secondary mr-2">check_circle</span>
                          <span>Islamic beliefs (Aqeedah) and practices (Fiqh)</span>
                        </li>
                        <li className="flex items-start">
                          <span className="material-icons text-secondary mr-2">check_circle</span>
                          <span>Arabic language fundamentals and vocabulary</span>
                        </li>
                        <li className="flex items-start">
                          <span className="material-icons text-secondary mr-2">check_circle</span>
                          <span>Islamic history and character development</span>
                        </li>
                      </ul>
                      
                      <div className="mt-8 flex justify-end">
                        <Link href="/admission" className="bg-primary hover:bg-primary-dark text-white font-medium py-2 px-6 rounded shadow transition duration-300">
                          Apply Now
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Youth Program */}
              <div id="youth-program" className="scroll-mt-24">
                <div className="bg-neutral-background rounded-lg overflow-hidden shadow-md border border-neutral-border">
                  <div className="md:flex">
                    <div className="md:w-1/3 bg-primary-dark p-8 text-white flex items-center justify-center">
                      <div className="text-center">
                        <span className="material-icons text-6xl mb-4">menu_book</span>
                        <h3 className="text-2xl font-bold font-amiri">Youth Program</h3>
                        <p className="mt-2">Ages 13-18</p>
                        <div className="mt-4 inline-block bg-white text-primary-dark py-1 px-3 rounded-full text-sm">
                          Weekends: 10am-2pm
                        </div>
                      </div>
                    </div>
                    <div className="md:w-2/3 p-8">
                      <h4 className="text-xl font-bold text-primary mb-4 font-amiri">Program Description</h4>
                      <p className="mb-4">Advanced Islamic studies for teenagers, with a focus on deeper understanding and application of Islamic principles in contemporary life.</p>
                      
                      <h4 className="text-lg font-bold text-primary mt-6 mb-3 font-amiri">Key Components</h4>
                      <ul className="space-y-2">
                        <li className="flex items-start">
                          <span className="material-icons text-secondary mr-2">check_circle</span>
                          <span>Advanced Quran study with tafsir (interpretation)</span>
                        </li>
                        <li className="flex items-start">
                          <span className="material-icons text-secondary mr-2">check_circle</span>
                          <span>Hadith studies and principles of Islamic jurisprudence</span>
                        </li>
                        <li className="flex items-start">
                          <span className="material-icons text-secondary mr-2">check_circle</span>
                          <span>Islamic history and civilization</span>
                        </li>
                        <li className="flex items-start">
                          <span className="material-icons text-secondary mr-2">check_circle</span>
                          <span>Contemporary Islamic issues and critical thinking</span>
                        </li>
                        <li className="flex items-start">
                          <span className="material-icons text-secondary mr-2">check_circle</span>
                          <span>Leadership development and community service</span>
                        </li>
                      </ul>
                      
                      <div className="mt-8 flex justify-end">
                        <Link href="/admission" className="bg-primary hover:bg-primary-dark text-white font-medium py-2 px-6 rounded shadow transition duration-300">
                          Apply Now
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Hifz Program */}
              <div id="hifz-program" className="scroll-mt-24">
                <div className="bg-neutral-background rounded-lg overflow-hidden shadow-md border border-neutral-border">
                  <div className="md:flex">
                    <div className="md:w-1/3 bg-secondary p-8 text-white flex items-center justify-center">
                      <div className="text-center">
                        <span className="material-icons text-6xl mb-4">bookmark</span>
                        <h3 className="text-2xl font-bold font-amiri">Hifz Program</h3>
                        <p className="mt-2">Selected Students</p>
                        <div className="mt-4 inline-block bg-white text-secondary-dark py-1 px-3 rounded-full text-sm">
                          Weekdays: 7am-9am
                        </div>
                      </div>
                    </div>
                    <div className="md:w-2/3 p-8">
                      <h4 className="text-xl font-bold text-primary mb-4 font-amiri">Program Description</h4>
                      <p className="mb-4">Intensive Quran memorization program for dedicated students who wish to memorize the entire Quran with proper tajweed and understanding.</p>
                      
                      <h4 className="text-lg font-bold text-primary mt-6 mb-3 font-amiri">Key Components</h4>
                      <ul className="space-y-2">
                        <li className="flex items-start">
                          <span className="material-icons text-secondary mr-2">check_circle</span>
                          <span>Systematic memorization of the Quran</span>
                        </li>
                        <li className="flex items-start">
                          <span className="material-icons text-secondary mr-2">check_circle</span>
                          <span>Regular revision of memorized portions</span>
                        </li>
                        <li className="flex items-start">
                          <span className="material-icons text-secondary mr-2">check_circle</span>
                          <span>Advanced tajweed rules and proper pronunciation</span>
                        </li>
                        <li className="flex items-start">
                          <span className="material-icons text-secondary mr-2">check_circle</span>
                          <span>Basic understanding of memorized portions</span>
                        </li>
                        <li className="flex items-start">
                          <span className="material-icons text-secondary mr-2">check_circle</span>
                          <span>Personalized attention and progress tracking</span>
                        </li>
                      </ul>
                      
                      <div className="mt-8 flex justify-end">
                        <Link href="/admission" className="bg-primary hover:bg-primary-dark text-white font-medium py-2 px-6 rounded shadow transition duration-300">
                          Apply Now
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Class Schedule */}
      <section className="py-16 bg-neutral-light">
        <div className="container mx-auto px-4">
          <div ref={scheduleRef} className={`max-w-4xl mx-auto ${scheduleEntry?.isIntersecting ? 'animate-fadeIn' : ''}`}>
            <h2 className="text-3xl font-bold text-primary mb-12 font-amiri text-center">Class Schedule</h2>
            
            <div className="bg-white p-8 rounded-lg shadow-sm mb-8">
              <div className="overflow-x-auto">
                <table className="min-w-full border border-neutral-border">
                  <thead>
                    <tr>
                      <th className="py-3 px-4 bg-primary text-white text-left">Program</th>
                      <th className="py-3 px-4 bg-primary text-white text-left">Days</th>
                      <th className="py-3 px-4 bg-primary text-white text-left">Times</th>
                      <th className="py-3 px-4 bg-primary text-white text-left">Age Group</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-neutral-border">
                      <td className="py-3 px-4 font-medium">Early Learners</td>
                      <td className="py-3 px-4">Monday - Thursday</td>
                      <td className="py-3 px-4">9:00 AM - 12:00 PM</td>
                      <td className="py-3 px-4">Ages 4-6</td>
                    </tr>
                    <tr className="border-b border-neutral-border bg-neutral-background">
                      <td className="py-3 px-4 font-medium">Foundation Program</td>
                      <td className="py-3 px-4">Monday - Friday</td>
                      <td className="py-3 px-4">4:00 PM - 6:00 PM</td>
                      <td className="py-3 px-4">Ages 7-12</td>
                    </tr>
                    <tr className="border-b border-neutral-border">
                      <td className="py-3 px-4 font-medium">Youth Program</td>
                      <td className="py-3 px-4">Saturday - Sunday</td>
                      <td className="py-3 px-4">10:00 AM - 2:00 PM</td>
                      <td className="py-3 px-4">Ages 13-18</td>
                    </tr>
                    <tr className="bg-neutral-background">
                      <td className="py-3 px-4 font-medium">Hifz Program</td>
                      <td className="py-3 px-4">Monday - Friday</td>
                      <td className="py-3 px-4">7:00 AM - 9:00 AM</td>
                      <td className="py-3 px-4">Selected students</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-sm italic mt-4 text-center">Prayer breaks are observed during class hours. The schedule may be adjusted during Ramadan.</p>
            </div>
            
            <div className="bg-primary-light bg-opacity-10 p-6 rounded-lg border border-primary-light">
              <h3 className="text-xl font-bold text-primary mb-4 font-amiri">Academic Calendar Highlights</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded shadow-sm">
                  <h4 className="font-bold mb-2">Fall Semester</h4>
                  <p className="text-sm">September 5 - December 15</p>
                </div>
                <div className="bg-white p-4 rounded shadow-sm">
                  <h4 className="font-bold mb-2">Spring Semester</h4>
                  <p className="text-sm">January 10 - May 31</p>
                </div>
                <div className="bg-white p-4 rounded shadow-sm">
                  <h4 className="font-bold mb-2">Summer Intensive</h4>
                  <p className="text-sm">June 15 - August 15</p>
                </div>
                <div className="bg-white p-4 rounded shadow-sm">
                  <h4 className="font-bold mb-2">Ramadan Program</h4>
                  <p className="text-sm">Special schedule during Ramadan</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Curriculum Approach */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div ref={curriculumRef} className={`max-w-4xl mx-auto ${curriculumEntry?.isIntersecting ? 'animate-fadeIn' : ''}`}>
            <h2 className="text-3xl font-bold text-primary mb-8 font-amiri text-center">Our Curriculum Approach</h2>
            <p className="text-center mb-12 max-w-3xl mx-auto">Our curriculum is designed to provide a comprehensive Islamic education that nurtures both knowledge and character while being engaging and age-appropriate.</p>
            
            <Tabs defaultValue="quran">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="quran">Quranic Studies</TabsTrigger>
                <TabsTrigger value="islamic">Islamic Studies</TabsTrigger>
                <TabsTrigger value="arabic">Arabic Language</TabsTrigger>
                <TabsTrigger value="character">Character Development</TabsTrigger>
              </TabsList>
              <TabsContent value="quran" className="p-6 bg-neutral-light rounded-lg mt-4">
                <h3 className="text-xl font-bold text-primary mb-4 font-amiri">Quranic Studies</h3>
                <p className="mb-4">Our Quranic studies curriculum focuses on teaching proper recitation, memorization, and understanding of the Quran.</p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="material-icons text-secondary mr-2">check_circle</span>
                    <span>Proper pronunciation (makharij) and tajweed rules</span>
                  </li>
                  <li className="flex items-start">
                    <span className="material-icons text-secondary mr-2">check_circle</span>
                    <span>Systematic memorization of surahs</span>
                  </li>
                  <li className="flex items-start">
                    <span className="material-icons text-secondary mr-2">check_circle</span>
                    <span>Basic understanding of meanings and context</span>
                  </li>
                  <li className="flex items-start">
                    <span className="material-icons text-secondary mr-2">check_circle</span>
                    <span>Regular revision and reinforcement</span>
                  </li>
                </ul>
              </TabsContent>
              <TabsContent value="islamic" className="p-6 bg-neutral-light rounded-lg mt-4">
                <h3 className="text-xl font-bold text-primary mb-4 font-amiri">Islamic Studies</h3>
                <p className="mb-4">Our Islamic studies curriculum covers the essential knowledge every Muslim needs to understand their faith.</p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="material-icons text-secondary mr-2">check_circle</span>
                    <span>Islamic beliefs (Aqeedah) and the pillars of faith</span>
                  </li>
                  <li className="flex items-start">
                    <span className="material-icons text-secondary mr-2">check_circle</span>
                    <span>Islamic practices (Fiqh) and the pillars of Islam</span>
                  </li>
                  <li className="flex items-start">
                    <span className="material-icons text-secondary mr-2">check_circle</span>
                    <span>Life of the Prophet Muhammad (peace be upon him)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="material-icons text-secondary mr-2">check_circle</span>
                    <span>Stories of the prophets and companions</span>
                  </li>
                  <li className="flex items-start">
                    <span className="material-icons text-secondary mr-2">check_circle</span>
                    <span>Islamic history and civilization</span>
                  </li>
                </ul>
              </TabsContent>
              <TabsContent value="arabic" className="p-6 bg-neutral-light rounded-lg mt-4">
                <h3 className="text-xl font-bold text-primary mb-4 font-amiri">Arabic Language</h3>
                <p className="mb-4">Our Arabic language curriculum helps students develop the skills to understand the language of the Quran.</p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="material-icons text-secondary mr-2">check_circle</span>
                    <span>Arabic alphabet and pronunciation</span>
                  </li>
                  <li className="flex items-start">
                    <span className="material-icons text-secondary mr-2">check_circle</span>
                    <span>Vocabulary building and common phrases</span>
                  </li>
                  <li className="flex items-start">
                    <span className="material-icons text-secondary mr-2">check_circle</span>
                    <span>Basic grammar and sentence structure</span>
                  </li>
                  <li className="flex items-start">
                    <span className="material-icons text-secondary mr-2">check_circle</span>
                    <span>Reading and writing skills</span>
                  </li>
                  <li className="flex items-start">
                    <span className="material-icons text-secondary mr-2">check_circle</span>
                    <span>Conversation practice and comprehension</span>
                  </li>
                </ul>
              </TabsContent>
              <TabsContent value="character" className="p-6 bg-neutral-light rounded-lg mt-4">
                <h3 className="text-xl font-bold text-primary mb-4 font-amiri">Character Development</h3>
                <p className="mb-4">Our character development curriculum focuses on nurturing Islamic values and ethics in daily life.</p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="material-icons text-secondary mr-2">check_circle</span>
                    <span>Islamic manners and etiquettes (Adab)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="material-icons text-secondary mr-2">check_circle</span>
                    <span>Moral values and ethical decision-making</span>
                  </li>
                  <li className="flex items-start">
                    <span className="material-icons text-secondary mr-2">check_circle</span>
                    <span>Building positive relationships</span>
                  </li>
                  <li className="flex items-start">
                    <span className="material-icons text-secondary mr-2">check_circle</span>
                    <span>Community responsibility and service</span>
                  </li>
                  <li className="flex items-start">
                    <span className="material-icons text-secondary mr-2">check_circle</span>
                    <span>Islamic identity in contemporary society</span>
                  </li>
                </ul>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>
      
      {/* Apply Now CTA */}
      <section className="py-12 bg-secondary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4 font-amiri text-white">Ready to Join Our Programs?</h2>
          <p className="mb-8 text-white max-w-2xl mx-auto">Enrollment is now open for all our programs. Secure your child's place in our nurturing educational environment.</p>
          <Link 
            href="/admission" 
            className="bg-white text-secondary hover:bg-neutral-light font-medium py-3 px-8 rounded shadow transition duration-300 inline-flex items-center"
          >
            Apply for Admission
            <span className="material-icons ml-2">arrow_forward</span>
          </Link>
        </div>
      </section>
    </>
  );
}
