import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ShoppingBag } from "lucide-react";

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isHome = location.pathname === "/";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-zinc-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <ShoppingBag className="h-8 w-8 text-orange-500" />
              <span className="ml-2 text-xl font-bold text-zinc-900">VihaanFlow</span>
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            {isHome ? (
              <>
                <a href="#problem" className="text-zinc-600 hover:text-orange-500 transition-colors">The Problem</a>
                <a href="#how-it-works" className="text-zinc-600 hover:text-orange-500 transition-colors">How it Works</a>
                <a href="#features" className="text-zinc-600 hover:text-orange-500 transition-colors">Features</a>
                <a href="#pricing" className="text-zinc-600 hover:text-orange-500 transition-colors">Pricing</a>
              </>
            ) : (
              <Link to="/" className="text-zinc-600 hover:text-orange-500 transition-colors">Home</Link>
            )}
            <Link
              to="/digital-products"
              className="flex items-center gap-1.5 text-zinc-700 border border-orange-400/50 bg-orange-50 hover:bg-orange-100 px-4 py-1.5 rounded-full font-semibold text-sm transition-all hover:border-orange-500"
            >
              <ShoppingBag className="h-4 w-4 text-orange-500" />
              Digital Products
            </Link>
            <Link
              to="/contact"
              className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-5 py-2 rounded-full font-medium hover:from-amber-400 hover:to-orange-500 transition-all shadow-md shadow-orange-500/20"
            >
              Contact Us
            </Link>
          </div>
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-zinc-200 px-4 pt-2 pb-4 space-y-1 shadow-lg">
          {isHome ? (
            <>
              <a href="#problem" className="block px-3 py-2 text-zinc-600 hover:text-orange-500">The Problem</a>
              <a href="#how-it-works" className="block px-3 py-2 text-zinc-600 hover:text-orange-500">How it Works</a>
              <a href="#features" className="block px-3 py-2 text-zinc-600 hover:text-orange-500">Features</a>
              <a href="#pricing" className="block px-3 py-2 text-zinc-600 hover:text-orange-500">Pricing</a>
            </>
          ) : (
            <Link to="/" className="block px-3 py-2 text-zinc-600 hover:text-orange-500">Home</Link>
          )}
          <Link to="/digital-products" className="flex items-center gap-2 px-3 py-2 text-orange-600 font-semibold hover:text-orange-700">
            <ShoppingBag className="h-4 w-4" />
            Digital Products
          </Link>
          <Link to="/contact" className="block px-3 py-2 mt-2 text-center bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-full font-medium shadow-md">
            Contact Us
          </Link>
        </div>
      )}
    </nav>
  );
}
