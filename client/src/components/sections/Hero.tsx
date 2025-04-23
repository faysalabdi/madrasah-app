import { Link } from "wouter";

export default function Hero() {
  return (
    <section id="home" className="relative bg-neutral-background">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-8 md:mb-0 md:pr-8">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4 font-amiri">Welcome to Madrasah Abubakr As-Siddiq</h2>
            <p className="text-xl mb-6 font-arabic text-center md:text-left">بسم الله الرحمن الرحيم</p>
            <p className="mb-6 text-lg">Nurturing young Muslims with knowledge, character, and spiritual growth in a supportive Islamic environment.</p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Link 
                href="/admission" 
                className="bg-primary hover:bg-primary-dark text-white font-medium py-3 px-6 rounded shadow text-center transition duration-300"
              >
                Apply for Admission
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
            <div className="relative rounded-lg overflow-hidden shadow-lg h-72 md:h-96 bg-neutral-light">
              <img 
                className="w-full h-full object-cover lazy-image" 
                src="https://images.unsplash.com/photo-1621274147744-cfb5753934fe?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                alt="Students studying Quran"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black bg-opacity-30 flex items-end">
                <div className="p-4 text-white">
                  <span className="font-arabic text-xl">اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ</span>
                  <p className="text-sm italic">"Read in the name of your Lord who created"</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Announcement banner */}
      <div className="bg-secondary text-white py-3 px-4">
        <div className="container mx-auto flex items-center justify-center">
          <span className="material-icons mr-2">campaign</span>
          <p className="font-medium">Enrollment for Fall 2023 is now open! <Link href="/admission" className="underline font-bold hover:text-primary-dark">Apply today</Link></p>
        </div>
      </div>
    </section>
  );
}
