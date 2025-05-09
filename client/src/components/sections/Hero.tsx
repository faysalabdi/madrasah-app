import { Link } from "wouter";
import reading from "../../assets/reading-quran.webp";

export default function Hero() {
  return (
    <section id="home" className="relative bg-neutral-background">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-8 md:mb-0 md:pr-8">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4 font-amiri">
              Welcome to Madrasah Abubakr As-Siddiq
            </h2>
            <p className="text-xl mb-6 font-arabic text-center md:text-left">
              بسم الله الرحمن الرحيم
            </p>
            <p className="mb-6 text-lg">
              Nurturing young Muslims with knowledge, character, and spiritual
              growth in a supportive Islamic environment.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Link
                href="/admission#apply-now"
                className="bg-secondary hover:bg-secondary-dark text-white font-medium py-3 px-6 rounded shadow text-center transition duration-300"
              >
                Apply Now
              </Link>
              <Link
                href="/admission"
                className="bg-primary hover:bg-primary-dark text-white font-medium py-3 px-6 rounded shadow text-center transition duration-300"
              >
                Admission Info
              </Link>
              <Link
                href="/programs"
                className="border border-primary text-primary hover:bg-primary-light hover:text-white font-medium py-3 px-6 rounded shadow text-center transition duration-300"
              >
                Explore Programs
              </Link>
            </div>
          </div>
          <div className="md:w-1/2">
            <div className="relative rounded-lg overflow-hidden shadow-xl h-[400px] bg-neutral-light transform hover:scale-[1.02] transition-transform duration-300">
              <img
                src={reading}
                alt="Students studying Quran"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/60 flex items-end">
                <div className="p-6 text-white w-full backdrop-blur-sm bg-black/20">
                  <span className="font-arabic text-2xl block mb-2 text-center">
                    اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ
                  </span>
                  <p className="text-sm italic text-center">
                    "Read in the name of your Lord who created"
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-secondary text-white py-3 px-4">
        <div className="container mx-auto flex items-center justify-center">
          <span className="material-icons mr-2">campaign</span>
          <p className="font-medium">
            Enrollment for Term 2 2025 is now open!{" "}
            <Link
              href="/admission#apply-now"
              className="underline font-bold hover:text-primary-dark"
            >
              Apply online today (Recommended)
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
