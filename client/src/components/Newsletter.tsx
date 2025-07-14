import { useState } from "react";
import { toast } from "@/hooks/use-toast";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Please enter your email",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const formData = {
        access_key: '0d1a51cf-4e51-4254-adcf-0cd9af908071',
        email: email,
        subject: 'Newsletter Subscription',
        from_name: 'Newsletter Subscriber',
        message: `New newsletter subscription from: ${email}`,
      };

      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
      toast({
        title: "Success!",
        description: "Thank you for subscribing to our newsletter.",
      });
      setEmail("");
      } else {
        throw new Error(result.message || 'Subscription failed');
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      toast({
        title: "Error",
        description: "There was an error subscribing to the newsletter. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-10 bg-secondary text-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-6 md:mb-0 text-center md:text-left">
            <h3 className="text-xl font-bold mb-2 font-amiri">Stay Updated</h3>
            <p>Subscribe to our newsletter for announcements, events, and Islamic reminders.</p>
          </div>
          <div className="w-full md:w-auto">
            <form className="flex flex-col sm:flex-row" onSubmit={handleSubmit}>
              <input 
                type="email" 
                placeholder="Your email address" 
                className="px-4 py-3 rounded-l sm:rounded-r-none mb-3 sm:mb-0 w-full text-neutral-text focus:outline-none focus:ring-2 focus:ring-primary"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                required
              />
              <button 
                type="submit" 
                className="bg-primary hover:bg-primary-dark text-white font-medium px-6 py-3 rounded-r sm:rounded-l-none transition duration-300 disabled:opacity-70"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Subscribing..." : "Subscribe"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
