import React from "react";
import { Link } from "react-router-dom";

export default function Programs() {
  // Add scroll into view behavior when component mounts
  React.useEffect(() => {
    // Get the hash from the URL
    const hash = window.location.hash;
    if (hash) {
      // Remove the # from the hash
      const element = document.getElementById(hash.slice(1));
      if (element) {
        // Wait a bit for the page to render and then scroll
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  }, []);

  return (
    <main className="min-h-screen py-16">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-primary mb-8 text-center font-amiri">
          Our Programs
        </h1>

        <div className="grid gap-8">
          <div id="quran-studies" className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold text-primary mb-4 font-amiri">
              Quran Studies (All Ages)
            </h2>
            <div className="space-y-4">
              <p className="text-lg">
                Students are grouped by grade level for focused Quran reading
                and writing instruction.
              </p>
              <div className="pl-4">
                <h3 className="font-bold text-primary mb-2">
                  Program Features:
                </h3>
                <ul className="list-disc pl-4 space-y-2">
                  <li>Proper Quran recitation (Tajweed)</li>
                  <li>Arabic letter recognition and writing</li>
                  <li>Memorization techniques</li>
                  <li>Understanding basic meanings</li>
                  <li>Progressive learning path from beginners to advanced</li>
                </ul>
              </div>
              <div className="bg-neutral-background p-4 rounded-lg mt-4">
                <p className="italic">
                  Our Quran studies program caters to all skill levels, ensuring
                  each student progresses at their own pace while maintaining
                  high standards of learning.
                </p>
              </div>
            </div>
          </div>

          <div
            id="foundation-program"
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <h2 className="text-2xl font-bold text-primary mb-4 font-amiri">
              Foundational Islamic Studies (Grade 3-4)
            </h2>
            <div className="space-y-4">
              <p className="text-lg">
                Core Islamic studies program designed specifically for
                intermediate students.
              </p>
              <div className="pl-4">
                <h3 className="font-bold text-primary mb-2">
                  Curriculum Includes:
                </h3>
                <ul className="list-disc pl-4 space-y-2">
                  <li>Basic Islamic beliefs (Aqeedah)</li>
                  <li>Islamic manners and character building</li>
                  <li>Introduction to Prophet's life (Seerah)</li>
                  <li>Basic Islamic practices</li>
                  <li>Interactive learning activities</li>
                </ul>
              </div>
              <div className="bg-neutral-background p-4 rounded-lg mt-4">
                <p className="italic">
                  This program builds a strong foundation in Islamic knowledge,
                  preparing students for advanced studies in later years.
                </p>
              </div>
            </div>
          </div>

          <div id="shafii-fiqh" className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold text-primary mb-4 font-amiri">
              Shafi'i Fiqh (Grade 5-6)
            </h2>
            <div className="space-y-4">
              <p className="text-lg">
                Advanced Islamic jurisprudence studies following the Shafi'i
                school of thought.
              </p>
              <div className="pl-4">
                <h3 className="font-bold text-primary mb-2">Course Content:</h3>
                <ul className="list-disc pl-4 space-y-2">
                  <li>Fundamentals of Islamic worship</li>
                  <li>Prayer and purification rules</li>
                  <li>Fasting guidelines</li>
                  <li>Basic transactions in Islam</li>
                  <li>Family relations in Islam</li>
                </ul>
              </div>
              <div className="bg-neutral-background p-4 rounded-lg mt-4">
                <p className="italic">
                  Students learn practical application of Islamic rulings in
                  their daily lives according to the Shafi'i madhab.
                </p>
              </div>
            </div>
          </div>

          <div id="duas-program" className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold text-primary mb-4 font-amiri">
              Duas Program (Grade 1-2)
            </h2>
            <div className="space-y-4">
              <p className="text-lg">
                Early education program focusing on essential Islamic
                supplications and their meanings.
              </p>
              <div className="pl-4">
                <h3 className="font-bold text-primary mb-2">
                  Program Components:
                </h3>
                <ul className="list-disc pl-4 space-y-2">
                  <li>Daily prayers and supplications</li>
                  <li>Morning and evening adhkar</li>
                  <li>Etiquettes of dua</li>
                  <li>Simple Arabic vocabulary</li>
                  <li>Interactive learning methods</li>
                </ul>
              </div>
              <div className="bg-neutral-background p-4 rounded-lg mt-4">
                <p className="italic">
                  A foundational program that helps young students develop a
                  strong connection with Allah through daily remembrance and
                  supplications.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold text-primary mb-4 font-amiri">
              Class Schedule
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-primary text-white">
                    <th className="py-3 px-4 text-left">Day</th>
                    <th className="py-3 px-4 text-left">Time</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-3 px-4">Tuesday & Thursday</td>
                    <td className="py-3 px-4">5:00 PM - 7:00 PM</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Saturday</td>
                    <td className="py-3 px-4">10:00 AM - 12:00 PM</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
