export default function GoogleForm() {
  return (
    <>
      {/* Google Form Hero Section */}
      <section className="bg-primary-dark text-white py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 font-amiri">Online Application</h1>
            <p className="text-lg mb-8">Apply for admission to Madrasah Abubakr As-Siddiq using our online application form.</p>
          </div>
        </div>
      </section>
      
      {/* Google Form Link Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="bg-neutral-light p-8 rounded-lg shadow-md">
              <div className="w-24 h-24 bg-secondary rounded-full mx-auto flex items-center justify-center mb-6">
                <span className="material-icons text-white text-5xl">description</span>
              </div>
              
              <h2 className="text-2xl font-bold text-primary mb-4 font-amiri">Application Form</h2>
              <p className="mb-6">Our online application form is hosted on Google Forms for a secure and convenient application process.</p>
              
              <div className="space-y-6">
                <div className="bg-white p-4 rounded-lg border border-neutral-border">
                  <h3 className="font-bold text-primary mb-2">What to expect:</h3>
                  <ul className="text-left space-y-2">
                    <li className="flex items-start">
                      <span className="material-icons text-secondary mr-2 flex-shrink-0">check_circle</span>
                      <span>The form will take approximately 5-10 minutes to complete</span>
                    </li>
                    <li className="flex items-start">
                      <span className="material-icons text-secondary mr-2 flex-shrink-0">check_circle</span>
                      <span>You'll need to provide basic student and parent/guardian information</span>
                    </li>
                    <li className="flex items-start">
                      <span className="material-icons text-secondary mr-2 flex-shrink-0">check_circle</span>
                      <span>You'll need to select your preferred program</span>
                    </li>
                    <li className="flex items-start">
                      <span className="material-icons text-secondary mr-2 flex-shrink-0">check_circle</span>
                      <span>You can upload required documents directly through the form</span>
                    </li>
                  </ul>
                </div>
                
                <a 
                  href="https://docs.google.com/forms/d/e/1FAIpQLSfE3a-8-BKwoSSfTVczKahEA9D8h-u1H-SjfcfPukZaHKW0JA/viewform" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-primary hover:bg-primary-dark text-white font-medium py-4 px-8 rounded-lg shadow-md transition duration-300 inline-flex items-center justify-center"
                >
                  <span className="material-icons mr-2">open_in_new</span>
                  Open Application Form
                </a>
              </div>
              
              <p className="mt-6 text-sm text-neutral-text">
                After submitting your application, our admissions team will contact you within 3-5 business days to schedule an assessment and interview.
              </p>
            </div>
            
            <div className="mt-12 flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-8">
              <div className="flex items-center">
                <span className="material-icons text-primary mr-2">help_outline</span>
                <span>Need help? Contact <a href="mailto:admissions@madrasa-abubakr.org" className="text-primary hover:text-primary-dark underline">admissions@madrasa-abubakr.org</a></span>
              </div>
              <div className="flex items-center">
                <span className="material-icons text-primary mr-2">phone</span>
                <span>Call us: (123) 456-7890 ext. 2</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}