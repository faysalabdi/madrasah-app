import { useRef } from "react";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";

export default function Testimonials() {
  const testimonialsRef = useRef<HTMLDivElement>(null);
  const testimonialsEntry = useIntersectionObserver(testimonialsRef, {});

  return (
    <section ref={testimonialsRef} className={`py-16 bg-neutral-light ${testimonialsEntry?.isIntersecting ? 'animate-fadeIn' : ''}`}>
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-primary mb-12 font-amiri">What Parents Say</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Testimonial 1 */}
          <div className="bg-white p-8 rounded-lg shadow-sm border border-neutral-border relative">
            <div className="text-secondary opacity-20 absolute top-4 left-4">
              <span className="material-icons text-6xl">format_quote</span>
            </div>
            <div className="relative z-10">
              <p className="mb-6 italic">My children have flourished at Madrasah Abubakr As-Siddiq. The teachers are knowledgeable, caring, and truly dedicated to providing quality Islamic education. I've seen remarkable growth in their Quranic recitation and understanding of Islamic principles.</p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-bold">SM</span>
                </div>
                <div>
                  <h4 className="font-bold">Sarah Mohammad</h4>
                  <p className="text-sm text-neutral-text">Parent of two students</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Testimonial 2 */}
          <div className="bg-white p-8 rounded-lg shadow-sm border border-neutral-border relative">
            <div className="text-secondary opacity-20 absolute top-4 left-4">
              <span className="material-icons text-6xl">format_quote</span>
            </div>
            <div className="relative z-10">
              <p className="mb-6 italic">What impresses me most about this madrasah is how they make Islamic learning engaging and relevant for today's youth. My teenage son actually looks forward to attending classes, and I've noticed positive changes in his character and daily practices.</p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-bold">AK</span>
                </div>
                <div>
                  <h4 className="font-bold">Ahmed Khan</h4>
                  <p className="text-sm text-neutral-text">Parent of a high school student</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
