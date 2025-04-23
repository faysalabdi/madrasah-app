export default function GoogleForm() {
  return (
    <>
      {/* Google Form Hero Section */}
      <section className="bg-primary-dark text-white py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 font-amiri">Application Form</h1>
            <p className="text-lg mb-8">Fill out the form below to apply for admission to Madrasah Abubakr As-Siddiq.</p>
          </div>
        </div>
      </section>
      
      {/* Google Form Embed */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            {/* Google Form iframe */}
            <div className="bg-neutral-light p-6 rounded-lg shadow-md">
              <div className="w-full h-[1200px] overflow-hidden rounded-lg">
                <iframe 
                  src="https://docs.google.com/forms/d/e/1FAIpQLSfE3a-8-BKwoSSfTVczKahEA9D8h-u1H-SjfcfPukZaHKW0JA/viewform?embedded=true" 
                  width="100%" 
                  height="100%" 
                  style={{ border: "none" }}
                  title="Google Form"
                >
                  Loading Google Form...
                </iframe>
              </div>
            </div>
            
            <div className="mt-8 text-center">
              <p className="text-sm text-neutral-text">
                If you have any issues accessing the form, you can 
                <a 
                  href="https://docs.google.com/forms/d/e/1FAIpQLSfE3a-8-BKwoSSfTVczKahEA9D8h-u1H-SjfcfPukZaHKW0JA/viewform" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary-dark ml-1"
                >
                  open it directly on Google Forms.
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}