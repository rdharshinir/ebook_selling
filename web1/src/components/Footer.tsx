import { Stethoscope } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-4 gap-8">
        <div className="col-span-2">
          <div className="flex items-center mb-4">
            <Stethoscope className="h-8 w-8 text-[#0EA5E9]" />
            <span className="ml-2 text-xl font-bold text-white">Vihaanflow AI</span>
          </div>
          <p className="max-w-md">The smartest WhatsApp AI chatbot specifically engineered for businesses in India to convert Meta Ads into confirmed bookings.</p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4">Company</h4>
          <ul className="space-y-2">
            <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
            <li><Link to="/digital-products" className="hover:text-white transition-colors">Digital Products</Link></li>
            <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4">Legal</h4>
          <ul className="space-y-2">
            <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-slate-800 text-sm text-center">
        &copy; {new Date().getFullYear()} Vihaanflow AI. All rights reserved.
      </div>
    </footer>
  );
}
