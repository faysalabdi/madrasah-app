import React from "react";

export default function Contact() {
  return (
    <main className="min-h-screen py-16">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-primary mb-8 text-center font-amiri">
          Contact Us
        </h1>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold text-primary mb-4 font-amiri">
              Get in Touch
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-primary">Contact Person</h3>
                <p>Sheikh Abdul Qadir Jama</p>
                <p className="text-primary">0411 510 201</p>
              </div>
              <div>
                <h3 className="font-bold text-primary">Location</h3>
                <p>Shop 48, The Mall</p>
                <p>Heidelberg West 3081</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold text-primary mb-4 font-amiri">
              Parent Responsibilities
            </h2>
            <ul className="list-disc list-inside space-y-2">
              <li>
                Drop students off on time (5:30pm weekdays, 10am Saturdays)
              </li>
              <li>Pick up students on time and drive carefully</li>
              <li>
                Ensure student is in clean, neat and correct uniform with clean
                socks
              </li>
              <li>Check and sign Student's Record Book daily</li>
              <li>Ensure student has eaten before coming to Madrassah</li>
              <li>Ensure student uses toilet before Madrassah</li>
              <li>Ensure student has made wudhu before coming to Madrassah</li>
              <li>Complete homework the night before</li>
              <li>Attend Parent Teacher Interviews</li>
              <li>Submit Akhlaaq Project in Term 1 and Term 3</li>
              <li>Prepare students for examination in Term 2 and Term 4</li>
              <li>Send a water bottle in Term 1 and Term 4</li>
              <li>Provide a safe Islamic Environment for students</li>
              <li>Contact admin for early collection or extended absences</li>
              <li>
                Parents are responsible for cleaning toilet, vomiting or
                bleeding accidents
              </li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
