import React, { useEffect } from "react";
import { Route, Switch, useLocation } from "wouter";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import Home from "@/pages/Home";
import About from "@/pages/About";
import Programs from "@/pages/Programs";
import Admission from "@/pages/Admission";
import Faculty from "@/pages/Faculty";
import Contact from "@/pages/Contact";
import GoogleForm from "@/pages/GoogleForm";
import NotFound from "@/pages/not-found";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Newsletter from "@/components/Newsletter";

function App() {
  const [location] = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return (
    <TooltipProvider>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/about" component={About} />
            <Route path="/programs" component={Programs} />
            <Route path="/admission" component={Admission} />
            <Route path="/faculty" component={Faculty} />
            <Route path="/contact" component={Contact} />
            <Route path="/apply" component={GoogleForm} />
            <Route component={NotFound} />
          </Switch>
        </main>
        <Newsletter />
        <Footer />
        <Toaster />
      </div>
    </TooltipProvider>
  );
}

export default App;
