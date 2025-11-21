import React from "react";
import { Route, Switch } from "wouter";
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
import PaymentPortal from "@/pages/PaymentPortal";
import PortalLogin from "@/pages/PortalLogin";
import ParentPortal from "@/pages/ParentPortal";
import ParentPasswordSetup from "@/pages/ParentPasswordSetup";
import TeacherPortal from "@/pages/TeacherPortal";
import AdminLogin from "@/pages/AdminLogin";
import AdminPortal from "@/pages/AdminPortal";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Newsletter from "@/components/Newsletter";

function App() {
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
            <Route path="/payment-portal" component={PaymentPortal} />
            <Route path="/portal" component={PortalLogin} />
            <Route path="/parent-password-setup" component={ParentPasswordSetup} />
            <Route path="/parent-portal" component={ParentPortal} />
            <Route path="/teacher-portal" component={TeacherPortal} />
            <Route path="/admin-login" component={AdminLogin} />
            <Route path="/admin-portal" component={AdminPortal} />
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
