
import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';

const NavBar: React.FC = () => {
  return (
    <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-md border-b">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link to="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-white font-bold">JI</span>
            </div>
            <span className="font-bold text-xl">JobsIndia<span className="text-primary">AI</span></span>
          </Link>
        </div>
        
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium hover:text-primary transition-colors">Home</Link>
          <Link to="/#features" className="text-sm font-medium hover:text-primary transition-colors">Features</Link>
          <Link to="/#how-it-works" className="text-sm font-medium hover:text-primary transition-colors">How It Works</Link>
          <Link to="/#pricing" className="text-sm font-medium hover:text-primary transition-colors">Pricing</Link>
        </nav>
        
        <div className="flex items-center gap-4">
          <Button variant="outline" className="hidden sm:flex">Login</Button>
          <Button className="hidden sm:flex">Sign Up</Button>
          <Button variant="outline" size="icon" className="md:hidden">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
              <line x1="4" x2="20" y1="12" y2="12" />
              <line x1="4" x2="20" y1="6" y2="6" />
              <line x1="4" x2="20" y1="18" y2="18" />
            </svg>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default NavBar;
