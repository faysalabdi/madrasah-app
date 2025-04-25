
import { Link } from "react-router-dom";

export default function Programs() {
  return (
    <main className="min-h-screen py-16">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-primary mb-8 text-center font-amiri">Our Programs</h1>

        <div className="grid gap-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold text-primary mb-4 font-amiri">Class Schedule</h2>
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

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold text-primary mb-4 font-amiri">Daily Schedule</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-primary">First Hour</h3>
                <p>Quran reading and writing (Students must prepare their new lesson for each class)</p>
              </div>
              <div>
                <h3 className="font-bold text-primary">Second Hour</h3>
                <p>Separate program instruction based on grade level</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold text-primary mb-4 font-amiri">Programs Offered</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-primary">Quran Studies (All Ages)</h3>
                <p>Students are grouped by grade level for focused Quran reading and writing instruction.</p>
              </div>
              <div>
                <h3 className="font-bold text-primary">Foundational Islamic Studies</h3>
                <p>Grade 3-4</p>
              </div>
              <div>
                <h3 className="font-bold text-primary">Shafii Fiqh</h3>
                <p>Grade 5-6</p>
              </div>
              <div>
                <h3 className="font-bold text-primary">Duas</h3>
                <p>Grade 1-2</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold text-primary mb-4 font-amiri">Fee Structure (Per School Term)</h2>
            <p className="mb-4 font-bold">Due by Week 7</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-neutral-background rounded">
                <p>1 child: $180</p>
              </div>
              <div className="p-4 bg-neutral-background rounded">
                <p>2 Children: $330</p>
              </div>
              <div className="p-4 bg-neutral-background rounded">
                <p>3 Children: $450</p>
              </div>
              <div className="p-4 bg-neutral-background rounded">
                <p>4 Children: $505</p>
              </div>
              <div className="p-4 bg-neutral-background rounded">
                <p>5 Children: $555</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold text-primary mb-4 font-amiri">Parent Responsibilities</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Drop students off on time 5:30pm on weekdays and 10am on Saturdays</li>
              <li>Pick up students on time. Drive carefully</li>
              <li>Ensure student is in clean, neat and correct uniform and clean socks</li>
              <li>Student's Record Book is checked and signed daily</li>
              <li>Student has eaten before coming to Madrassah</li>
              <li>Student went to toilet before Madrassah</li>
              <li>Student made wudhu before coming to Madrassah</li>
              <li>Homework was completed the night before</li>
              <li>Attend Parent Teacher Interviews</li>
              <li>Submit Akhlaaq Project in Term 1 and Term 3</li>
              <li>Prepare students for examination in Term 2 and Term 4</li>
              <li>Send a water bottle in Term 1 and Term 4</li>
              <li>Provide a safe Islamic Environment for students</li>
              <li>Contact admin if parent will be collecting student early</li>
              <li>Contact admin if student will be absent for an extended period</li>
              <li>Toilet, vomiting or bleeding accidents to be cleaned by parents</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold text-primary mb-4 font-amiri">Uniform Policy</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-bold text-primary mb-2">Girls</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>White/Black Jilbaab</li>
                  <li>Black Abaya</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-primary mb-2">Boys</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>White Thobe</li>
                  <li>White Sunnah Cap</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
