import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import path from "path";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes for contact form and newsletter signup
  app.post('/api/contact', async (req, res) => {
    try {
      const { name, email, subject, message } = req.body;
      
      // Validate required fields
      if (!name || !email || !message) {
        return res.status(400).json({ message: 'Missing required fields' });
      }
      
      // In a production app, this would send an email or store the contact in a database
      // For now, we'll just return a success response
      return res.status(200).json({ message: 'Message received successfully' });
    } catch (error) {
      console.error('Error in contact form submission:', error);
      return res.status(500).json({ message: 'Server error processing your request' });
    }
  });
  
  app.post('/api/newsletter', async (req, res) => {
    try {
      const { email } = req.body;
      
      // Validate email
      if (!email) {
        return res.status(400).json({ message: 'Email is required' });
      }
      
      // In a production app, this would add the email to a newsletter service
      // For now, we'll just return a success response
      return res.status(200).json({ message: 'Subscription successful' });
    } catch (error) {
      console.error('Error in newsletter subscription:', error);
      return res.status(500).json({ message: 'Server error processing your request' });
    }
  });
  
  // Route to serve optimized images
  app.get('/api/images/:name', (req, res) => {
    // In a production app, this would serve optimized images
    // Redirect to placeholder images for now
    res.redirect(`https://images.unsplash.com/photo-${req.params.name}?auto=format&fit=crop&w=800&q=80`);
  });
  
  // Route for program information
  app.get('/api/programs', (_req, res) => {
    const programs = [
      {
        id: 'early-learners',
        name: 'Early Learners',
        ages: '4-6',
        schedule: 'Monday - Thursday, 9am-12pm',
        description: 'A gentle introduction to Islam through stories, nasheeds, and basic Quranic letters.'
      },
      {
        id: 'foundation-program',
        name: 'Foundation Program',
        ages: '7-12',
        schedule: 'Monday - Friday, 4pm-6pm',
        description: 'Core program focusing on Quran memorization, understanding, and Islamic studies.'
      },
      {
        id: 'youth-program',
        name: 'Youth Program',
        ages: '13-18',
        schedule: 'Saturday - Sunday, 10am-2pm',
        description: 'Advanced Islamic studies with a focus on application in contemporary life.'
      },
      {
        id: 'hifz-program',
        name: 'Hifz Program',
        ages: 'All ages (selected students)',
        schedule: 'Monday - Friday, 7am-9am',
        description: 'Intensive Quran memorization program for dedicated students.'
      }
    ];
    
    res.json(programs);
  });

  const httpServer = createServer(app);
  
  return httpServer;
}
