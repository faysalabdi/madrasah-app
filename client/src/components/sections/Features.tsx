export default function Features() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-primary mb-12 font-amiri">
          Why Choose Our Madrasah?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="flex flex-col items-center text-center p-6 border border-neutral-border rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mb-4">
              <span className="material-icons text-white text-2xl">
                menu_book
              </span>
            </div>
            <h3 className="text-xl font-bold text-primary mb-3 font-amiri">
              Comprehensive Curriculum
            </h3>
            <p>
              Balanced approach to Quranic studies, Islamic knowledge, and
              character development.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="flex flex-col items-center text-center p-6 border border-neutral-border rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mb-4">
              <span className="material-icons text-white text-2xl">groups</span>
            </div>
            <h3 className="text-xl font-bold text-primary mb-3 font-amiri">
              Qualified Teachers
            </h3>
            <p>
              Experienced educators dedicated to nurturing young Muslims with
              knowledge and wisdom.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="flex flex-col items-center text-center p-6 border border-neutral-border rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mb-4">
              <span className="material-icons text-white text-2xl">mosque</span>
            </div>
            <h3 className="text-xl font-bold text-primary mb-3 font-amiri">
              Islamic Environment
            </h3>
            <p>
              A safe, supportive atmosphere where Islamic values are practiced
              and celebrated.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
