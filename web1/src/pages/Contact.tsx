import { useState } from "react";
import { CheckCircle, Phone, Mail, MapPin } from "lucide-react";

export default function Contact() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    submitted: false,
    loading: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState(prev => ({ ...prev, loading: true }));
    // Simulate API call
    setTimeout(() => {
      setFormState(prev => ({ ...prev, submitted: true, loading: false }));
      setTimeout(() => {
        setFormState({ name: "", email: "", phone: "", message: "", submitted: false, loading: false });
      }, 3000);
    }, 1500);
  };

  return (
    <div className="font-sans text-slate-800 bg-slate-50 min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#1E3A5F] mb-6">Contact Us</h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Ready to transform your business with AI? Reach out to us today.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Contact Info */}
          <div>
            <h2 className="text-2xl font-bold text-[#1E3A5F] mb-6">Get in Touch</h2>
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="w-12 h-12 bg-sky-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Phone className="h-6 w-6 text-[#0EA5E9]" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-[#1E3A5F]">Phone</h3>
                  <p className="text-slate-600">+91 73393 66166</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-12 h-12 bg-sky-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail className="h-6 w-6 text-[#0EA5E9]" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-[#1E3A5F]">Email</h3>
                  <p className="text-slate-600">hello@vihaanflow.ai</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-12 h-12 bg-sky-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-6 w-6 text-[#0EA5E9]" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-[#1E3A5F]">Location</h3>
                  <p className="text-slate-600">India</p>
                </div>
              </div>
            </div>

            <div className="mt-12">
              <h3 className="text-xl font-bold text-[#1E3A5F] mb-4">Chat on WhatsApp</h3>
              <p className="text-slate-600 mb-6">For the fastest response, send us a message on WhatsApp.</p>
              <a 
                href="https://wa.me/917339366166?text=Hi!%20I%20would%20like%20to%20know%20more%20about%20Vihaanflow%20AI." 
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#25D366] text-white px-6 py-3 rounded-full font-bold hover:bg-[#128C7E] transition-colors shadow-lg shadow-green-500/30"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className="fill-current">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.663-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                </svg>
                Message us on WhatsApp
              </a>
            </div>
          </div>

          {/* Form */}
          <form className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm relative" onSubmit={handleSubmit}>
            {formState.submitted && (
              <div className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center z-20">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="h-8 w-8 text-emerald-500" />
                </div>
                <h3 className="text-2xl font-bold text-[#1E3A5F] mb-2">Message Sent!</h3>
                <p className="text-slate-600 text-center max-w-sm">We've received your message and will get back to you shortly.</p>
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Your Name</label>
                <input 
                  type="text" 
                  value={formState.name}
                  onChange={e => setFormState({...formState, name: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:ring-2 focus:ring-[#0EA5E9] focus:border-[#0EA5E9] outline-none transition-all placeholder:text-slate-400" 
                  placeholder="John Doe" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                <input 
                  type="email" 
                  value={formState.email}
                  onChange={e => setFormState({...formState, email: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:ring-2 focus:ring-[#0EA5E9] focus:border-[#0EA5E9] outline-none transition-all placeholder:text-slate-400" 
                  placeholder="john@example.com" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number (WhatsApp)</label>
                <input 
                  type="tel" 
                  value={formState.phone}
                  onChange={e => setFormState({...formState, phone: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:ring-2 focus:ring-[#0EA5E9] focus:border-[#0EA5E9] outline-none transition-all placeholder:text-slate-400" 
                  placeholder="+91 98765 43210" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">How can we help?</label>
                <textarea 
                  value={formState.message}
                  onChange={e => setFormState({...formState, message: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:ring-2 focus:ring-[#0EA5E9] focus:border-[#0EA5E9] outline-none transition-all placeholder:text-slate-400 h-32 resize-none" 
                  placeholder="Tell us about your business goals..." 
                  required 
                />
              </div>
              <button 
                type="submit" 
                disabled={formState.loading}
                className="w-full bg-gradient-to-r from-sky-500 to-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:from-sky-400 hover:to-blue-500 transition-all shadow-lg shadow-sky-500/25 mt-4 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {formState.loading ? (
                  <>
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Sending...
                  </>
                ) : (
                  "Send Message"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
