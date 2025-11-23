import React from "react";
import { Link as WouterLink, useLocation } from "wouter";

export default function Programs() {
  // const [location] = useLocation(); // Remove if only used for scrolling effect

  return (
    <main className="min-h-screen py-16">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-primary mb-8 text-center font-amiri">
          Our Programs
        </h1>

        <div className="grid gap-8">

        {/* Program A Schedule */}
        <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold text-primary mb-2 font-amiri">
              Program A Schedule
            </h2>
            <p className="text-sm text-gray-600 mb-4">Saturday, Tuesday, Thursday</p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead className="bg-primary text-white">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Day</th>
                    <th className="py-3 px-4 font-semibold">Time</th>
                    <th className="py-3 px-4 font-semibold">Subject</th>
                    <th className="py-3 px-4 font-semibold">Grouping</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td rowSpan={2} className="py-3 px-4 border-r align-top">Saturday</td>
                    <td className="py-3 px-4">10:00 AM - 11:00 AM</td>
                    <td className="py-3 px-4">Quran/Iqra</td>
                    <td className="py-3 px-4">By Level</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">11:00 AM - 12:00 PM</td>
                    <td className="py-3 px-4">Islamic Studies (Course Book & Workbook)</td>
                    <td className="py-3 px-4">By Grade</td>
                  </tr>
                  <tr className="border-b bg-neutral-background">
                    <td colSpan={4} className="py-1 px-4"></td>
                  </tr>
                  <tr className="border-b">
                    <td rowSpan={2} className="py-3 px-4 border-r align-top">Tuesday</td>
                    <td className="py-3 px-4">5:30 PM - 6:30 PM</td>
                    <td className="py-3 px-4">Quran/Iqra</td>
                    <td className="py-3 px-4">By Level</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">6:30 PM - 7:30 PM</td>
                    <td className="py-3 px-4">Surahs/Dua Memorisation</td>
                    <td className="py-3 px-4">By Grade</td>
                  </tr>
                  <tr className="border-b bg-neutral-background">
                    <td colSpan={4} className="py-1 px-4"></td>
                  </tr>
                  <tr className="border-b">
                    <td rowSpan={2} className="py-3 px-4 border-r align-top">Thursday</td>
                    <td className="py-3 px-4">5:30 PM - 6:30 PM</td>
                    <td className="py-3 px-4">Quran/Iqra</td>
                    <td className="py-3 px-4">By Level</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">6:30 PM - 7:30 PM</td>
                    <td className="py-3 px-4">Fiqh</td>
                    <td className="py-3 px-4">By Grade</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Program B Schedule */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold text-primary mb-2 font-amiri">
              Program B Schedule
            </h2>
            <p className="text-sm text-gray-600 mb-4">Monday, Wednesday, Friday</p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead className="bg-primary text-white">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Day</th>
                    <th className="py-3 px-4 font-semibold">Time</th>
                    <th className="py-3 px-4 font-semibold">Subject</th>
                    <th className="py-3 px-4 font-semibold">Grouping</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td rowSpan={2} className="py-3 px-4 border-r align-top">Monday</td>
                    <td className="py-3 px-4">5:30 PM - 6:30 PM</td>
                    <td className="py-3 px-4">Quran/Iqra</td>
                    <td className="py-3 px-4">By Level</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">6:30 PM - 7:30 PM</td>
                    <td className="py-3 px-4">Surahs/Dua Memorisation</td>
                    <td className="py-3 px-4">By Grade</td>
                  </tr>
                  <tr className="border-b bg-neutral-background">
                    <td colSpan={4} className="py-1 px-4"></td>
                  </tr>
                  <tr className="border-b">
                    <td rowSpan={2} className="py-3 px-4 border-r align-top">Wednesday</td>
                    <td className="py-3 px-4">5:30 PM - 6:30 PM</td>
                    <td className="py-3 px-4">Quran/Iqra</td>
                    <td className="py-3 px-4">By Level</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">6:30 PM - 7:30 PM</td>
                    <td className="py-3 px-4">Fiqh</td>
                    <td className="py-3 px-4">By Grade</td>
                  </tr>
                  <tr className="border-b bg-neutral-background">
                    <td colSpan={4} className="py-1 px-4"></td>
                  </tr>
                  <tr className="border-b">
                    <td rowSpan={2} className="py-3 px-4 border-r align-top">Friday</td>
                    <td className="py-3 px-4">5:30 PM - 6:30 PM</td>
                    <td className="py-3 px-4">Quran/Iqra</td>
                    <td className="py-3 px-4">By Level</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">6:30 PM - 7:30 PM</td>
                    <td className="py-3 px-4">Islamic Studies (Course Book & Workbook)</td>
                    <td className="py-3 px-4">By Grade</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <div id="quran-studies" className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold text-primary mb-4 font-amiri">
              Quran Studies (All Ages)
            </h2>
            <div className="space-y-4">
              <p className="text-lg">
                Students are grouped by proficiency level for focused Quran and iqra reading
                and writing instruction.
              </p>
              <div className="pl-4">
                <h3 className="font-bold text-primary mb-2">
                  Schedule:
                </h3>
                <ul className="list-disc pl-4 space-y-1 text-sm">
                  <li><strong>Program A:</strong> Saturday 10:00 AM - 11:00 AM, Tuesday 5:30 PM - 7:30 PM, Thursday 5:30 PM - 7:30 PM (By Level)</li>
                  <li><strong>Program B:</strong> Monday 5:30 PM - 7:30 PM, Wednesday 5:30 PM - 7:30 PM, Friday 5:30 PM - 7:30 PM (By Level)</li>
                </ul>
              </div>
              <div className="pl-4 mt-4">
                <h3 className="font-bold text-primary mb-2">
                  Program Features:
                </h3>
                <ul className="list-disc pl-4 space-y-2">
                  <li>Proper Quran recitation (Tajweed)</li>
                  <li>Arabic letter recognition and writing</li>
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
              Foundational Islamic Studies
            </h2>
            <div className="space-y-4">
              <p className="text-lg">
                Core Islamic studies program using course books and workbooks.
              </p>
              <div className="pl-4">
                <h3 className="font-bold text-primary mb-2">
                  Schedule:
                </h3>
                <ul className="list-disc pl-4 space-y-1 text-sm">
                  <li><strong>Program A:</strong> Saturday 11:00 AM - 12:00 PM (Grouped by Grade)</li>
                  <li><strong>Program B:</strong> Friday 6:30 PM - 7:30 PM (Grouped by Grade)</li>
                </ul>
              </div>
              <div className="pl-4 mt-4">
                <h3 className="font-bold text-primary mb-2">
                  Curriculum Includes:
                </h3>
                <ul className="list-disc pl-4 space-y-2">
                  <li>Basic Islamic beliefs (Aqeedah)</li>
                  <li>Islamic manners and character building</li>
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
              Shafi'i Fiqh
            </h2>
            <div className="space-y-4">
              <p className="text-lg">
                Advanced Islamic jurisprudence studies following the Shafi'i
                school of thought.
              </p>
              <div className="pl-4">
                <h3 className="font-bold text-primary mb-2">
                  Schedule:
                </h3>
                <ul className="list-disc pl-4 space-y-1 text-sm">
                  <li><strong>Program A:</strong> Thursday 6:30 PM - 7:30 PM (Grouped by Grade)</li>
                  <li><strong>Program B:</strong> Wednesday 6:30 PM - 7:30 PM (Grouped by Grade)</li>
                </ul>
              </div>
              <div className="pl-4 mt-4">
                <h3 className="font-bold text-primary mb-2">Course Content:</h3>
                <ul className="list-disc pl-4 space-y-2">
                  <li>Fundamentals of Islamic worship</li>
                  <li>Prayer and purification rules</li>
                  <li>Fasting guidelines</li>
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
              Surahs & Dua Memorisation
            </h2>
            <div className="space-y-4">
              <p className="text-lg">
                Program focusing on memorising essential Surahs and Islamic supplications (Duas) with their meanings.
              </p>
              <div className="pl-4">
                <h3 className="font-bold text-primary mb-2">
                  Schedule:
                </h3>
                <ul className="list-disc pl-4 space-y-1 text-sm">
                  <li><strong>Program A:</strong> Tuesday 6:30 PM - 7:30 PM (Grouped by Grade)</li>
                  <li><strong>Program B:</strong> Monday 6:30 PM - 7:30 PM (Grouped by Grade)</li>
                </ul>
              </div>
              <div className="pl-4 mt-4">
                <h3 className="font-bold text-primary mb-2">
                  Program Components:
                </h3>
                <ul className="list-disc pl-4 space-y-2">
                  <li>Memorisation of selected Surahs</li>
                  <li>Daily prayers and supplications</li>
                  <li>Morning and evening adhkar</li>
                  <li>Understanding the virtues and meanings of Duas</li>
                  <li>Etiquettes of dua</li>
                  <li>Interactive learning methods</li>
                </ul>
              </div>
              <div className="bg-neutral-background p-4 rounded-lg mt-4">
                <p className="italic">
                  This program helps students develop a strong connection with Allah through memorising the Quran and daily remembrance.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
