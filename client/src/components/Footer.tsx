import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-primary-dark text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Column 1 */}
          <div>
            <h4 className="text-xl font-bold mb-4 font-amiri">Madrasah Abubakr As-Siddiq</h4>
            <p className="mb-4">Providing quality Islamic education to nurture the next generation of Muslims.</p>
            <div className="flex space-x-3">
              <a href="#" className="text-white hover:text-secondary" aria-label="Facebook">
                <span className="material-icons">facebook</span>
              </a>
              <a href="#" className="text-white hover:text-secondary" aria-label="Twitter">
                <span className="material-icons">twitter</span>
              </a>
              <a href="#" className="text-white hover:text-secondary" aria-label="Instagram">
                <span className="material-icons">instagram</span>
              </a>
              <a href="#" className="text-white hover:text-secondary" aria-label="YouTube">
                <span className="material-icons">play_arrow</span>
              </a>
            </div>
          </div>
          
          {/* Column 2 */}
          <div>
            <h4 className="text-lg font-bold mb-4 font-amiri">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link href="/" className="hover:text-secondary">Home</Link></li>
              <li><Link href="/about" className="hover:text-secondary">About Us</Link></li>
              <li><Link href="/programs" className="hover:text-secondary">Programs</Link></li>
              <li><Link href="/admission" className="hover:text-secondary">Admission</Link></li>
              <li><Link href="/faculty" className="hover:text-secondary">Faculty</Link></li>
              <li><Link href="/contact" className="hover:text-secondary">Contact Us</Link></li>
            </ul>
          </div>
          
          {/* Column 3 */}
          <div>
            <h4 className="text-lg font-bold mb-4 font-amiri">Programs</h4>
            <ul className="space-y-2">
              <li><Link href="/programs#early-learners" className="hover:text-secondary">Early Learners</Link></li>
              <li><Link href="/programs#foundation-program" className="hover:text-secondary">Foundation Program</Link></li>
              <li><Link href="/programs#youth-program" className="hover:text-secondary">Youth Program</Link></li>
              <li><Link href="/programs#hifz-program" className="hover:text-secondary">Hifz Program</Link></li>
              <li><Link href="/programs#weekend-classes" className="hover:text-secondary">Weekend Classes</Link></li>
              <li><Link href="/programs#summer-intensives" className="hover:text-secondary">Summer Intensives</Link></li>
            </ul>
          </div>
          
          {/* Column 4 */}
          <div>
            <h4 className="text-lg font-bold mb-4 font-amiri">Contact Us</h4>
            <address className="not-italic">
              <p className="flex items-start mb-2">
                <span className="material-icons mr-2 text-secondary">location_on</span>
                <span>123 Islamic Education Street<br />Anytown, ST 12345</span>
              </p>
              <p className="flex items-start mb-2">
                <span className="material-icons mr-2 text-secondary">phone</span>
                <span>(123) 456-7890</span>
              </p>
              <p className="flex items-start">
                <span className="material-icons mr-2 text-secondary">email</span>
                <span>info@madrasa-abubakr.org</span>
              </p>
            </address>
          </div>
        </div>
        
        <div className="pt-6 border-t border-white border-opacity-20 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Madrasah Abubakr As-Siddiq. All rights reserved.</p>
          <p className="mt-2">
            <a href="#" className="hover:text-secondary">Privacy Policy</a> | 
            <a href="#" className="hover:text-secondary">Terms of Service</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
