import { useState, useRef } from "react";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";

interface FAQItemProps {
  question: string;
  answer: string;
}

function FAQItem({ question, answer }: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="mb-6 border-b border-neutral-border pb-6">
      <button 
        className="flex justify-between items-center w-full text-left font-bold text-lg text-primary"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span>{question}</span>
        <span className="material-icons">{isOpen ? 'remove' : 'add'}</span>
      </button>
      <div className={`mt-3 transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-96' : 'max-h-0'}`}>
        <p>{answer}</p>
      </div>
    </div>
  );
}

export default function FAQ() {
  const faqRef = useRef<HTMLDivElement>(null);
  const faqEntry = useIntersectionObserver(faqRef, {});
  
  const faqItems = [
    {
      question: "What age groups do you accept?",
      answer: "We accept students from ages 4 to 18, with different programs tailored to specific age groups. Our Early Learners program serves ages 4-6, Foundation Program serves ages 7-12, and Youth Program serves ages 13-18."
    },
    {
      question: "Do you offer financial aid?",
      answer: "Yes, we offer financial aid for families who demonstrate need. We believe that Islamic education should be accessible to all members of our community. Please contact our administrative office for details on how to apply for financial assistance."
    },
    {
      question: "What is your teaching methodology?",
      answer: "Our teaching methodology combines traditional Islamic educational principles with modern teaching techniques. We emphasize understanding rather than mere memorization, and we create an interactive learning environment that encourages questions and discussions. Our goal is to help students develop a deep connection with their faith and apply Islamic principles in their daily lives."
    },
    {
      question: "Can students join mid-year?",
      answer: "Yes, we accept students throughout the year, space permitting. New students will undergo an assessment to determine their current level of knowledge, and our teachers will develop a plan to help them integrate into ongoing classes."
    },
    {
      question: "What safety measures do you have in place?",
      answer: "The safety of our students is our top priority. All staff undergo background checks, the facility is secured, and we have clear protocols for drop-off and pick-up. We also have first aid-trained personnel on-site at all times and conduct regular safety drills."
    }
  ];

  return (
    <section ref={faqRef} className={`py-16 bg-white ${faqEntry?.isIntersecting ? 'animate-fadeIn' : ''}`}>
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-primary mb-12 font-amiri">Frequently Asked Questions</h2>
        
        <div className="max-w-3xl mx-auto">
          {faqItems.map((item, index) => (
            <FAQItem key={index} question={item.question} answer={item.answer} />
          ))}
        </div>
      </div>
    </section>
  );
}
