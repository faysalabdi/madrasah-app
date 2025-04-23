import { useState } from "react";
import { Link, useLocation } from "wouter";
import BackgroundPattern from "./ui/BackgroundPattern";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useLocation();

  const isActive = (path: string): string => {
    return location === path ? "text-primary" : "text-neutral-text hover:text-primary";
  };

  return (
    <header className="border-b border-neutral-border">
      {/* Top contact bar */}
      <div className="bg-primary-dark text-white text-sm py-2">
        <div className="container mx-auto px-4 flex justify-between">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <span className="material-icons text-sm mr-1">call</span>
              <span>(123) 456-7890</span>
            </span>
            <span className="flex items-center">
              <span className="material-icons text-sm mr-1">email</span>
              <span>info@madrasa-abubakr.org</span>
            </span>
          </div>
          <div className="hidden md:flex items-center space-x-2">
            <a href="#" className="hover:text-secondary px-2" aria-label="Facebook">
              <span className="material-icons">facebook</span>
            </a>
            <a href="#" className="hover:text-secondary px-2" aria-label="Twitter">
              <span className="material-icons">twitter</span>
            </a>
            <a href="#" className="hover:text-secondary px-2" aria-label="Instagram">
              <span className="material-icons">instagram</span>
            </a>
          </div>
        </div>
      </div>
      
      {/* Main header */}
      <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between">
        <div className="flex items-center mb-4 md:mb-0">
          {/* Logo placeholder */}
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mr-4">
            <span className="material-icons text-white text-3xl">school</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-primary font-amiri">Madrasah Abubakr As-Siddiq</h1>
            <p className="text-sm text-neutral-text italic">Excellence in Islamic Education</p>
          </div>
        </div>
        
        {/* Mobile menu button */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
          className="md:hidden flex items-center px-3 py-2 border rounded text-primary border-primary"
        >
          <span className="material-icons">{mobileMenuOpen ? 'close' : 'menu'}</span>
        </button>
        
        {/* Navigation */}
        <nav className={`${mobileMenuOpen ? 'block' : 'hidden'} md:flex md:items-center`}>
          <ul className="flex flex-col md:flex-row md:space-x-6 font-medium">
            <li><Link href="/" className={`block py-2 ${isActive("/")}`}>Home</Link></li>
            <li><Link href="/about" className={`block py-2 ${isActive("/about")}`}>About Us</Link></li>
            <li><Link href="/programs" className={`block py-2 ${isActive("/programs")}`}>Programs</Link></li>
            <li><Link href="/admission" className={`block py-2 ${isActive("/admission")}`}>Admission</Link></li>
            <li><Link href="/faculty" className={`block py-2 ${isActive("/faculty")}`}>Faculty</Link></li>
            <li><Link href="/contact" className={`block py-2 ${isActive("/contact")}`}>Contact</Link></li>
          </ul>
          <Link 
            href="/apply" 
            className="mt-4 md:mt-0 md:ml-6 inline-block bg-secondary hover:bg-secondary-dark text-white font-medium py-2 px-4 rounded shadow transition duration-300"
          >
            Apply Now
          </Link>
        </nav>
      </div>
      
      {/* Islamic pattern banner */}
      <BackgroundPattern height="h-8" />
    </header>
  );
}
