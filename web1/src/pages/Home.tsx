import { useState } from "react";
import { Link } from "react-router-dom";
import { SplineScene } from "@/components/ui/splite";
import { Spotlight } from "@/components/ui/spotlight";
import { cn } from "@/lib/utils";
import {
  MessageCircle,
  Clock,
  TrendingUp,
  Users,
  CheckCircle,
  Bot,
  Calendar,
  Smartphone,
  Star,
  ChevronDown,
  ShoppingBag,
  BookOpen,
  Zap,
  Shield
} from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [formState, setFormState] = useState({
    clinicName: "",
    name: "",
    phone: "",
    submitted: false,
    loading: false
  });

  // TODO: Replace this URL with your Google Apps Script Web App URL
  const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzrVumbYtf6h9EK7j6-PgWMoPtptjSwFqZ3kuA0w5l3bX0tAGp90woEUNcIYnzSsQ/exec";

  const handleDemoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!GOOGLE_SCRIPT_URL) {
      // Fallback behavior if URL is not set
      setFormState(prev => ({ ...prev, submitted: true }));
      setTimeout(() => {
        setFormState({ clinicName: "", name: "", phone: "", submitted: false, loading: false });
      }, 3000);
      return;
    }

    setFormState(prev => ({ ...prev, loading: true }));

    try {
      const formData = new FormData();
      formData.append("ClinicName", formState.clinicName);
      formData.append("Name", formState.name);
      formData.append("WhatsApp", formState.phone);
      formData.append("Timestamp", new Date().toLocaleString());

      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        body: formData,
        mode: "no-cors"
      });

      setFormState(prev => ({ ...prev, submitted: true, loading: false }));
      setTimeout(() => {
        setFormState({ clinicName: "", name: "", phone: "", submitted: false, loading: false });
      }, 3000);
    } catch (error) {
      console.error("Error submitting form", error);
      setFormState(prev => ({ ...prev, loading: false }));
      alert("Error submitting request. Please try again.");
    }
  };

  const toggleFaq = (index: number) => {
    if (openFaq === index) {
      setOpenFaq(null);
    } else {
      setOpenFaq(index);
    }
  };

  return (
    <div className="font-sans text-slate-800 bg-slate-50 min-h-screen">
      {/* Navbar handled by Layout */}

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-black flex flex-col items-center justify-center min-h-[90vh]">
        <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="white" />
        <div className="absolute inset-0 w-full h-full z-10 pointer-events-auto">
          <SplineScene 
            scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
            className="w-full h-full opacity-80 md:translate-x-1/4"
          />
        </div>
        <div className="absolute inset-0 w-full h-full bg-black/40 z-20 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 relative z-30 text-left flex flex-col items-start">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-800/50 border border-zinc-700 backdrop-blur-sm text-zinc-300 text-sm font-medium mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
            Now accepting new clinics
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white via-zinc-200 to-zinc-400 tracking-tight max-w-3xl mb-6 leading-[1.1] drop-shadow-sm"
          >
            Turn Meta Ads into <br className="hidden md:block" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-500 drop-shadow-md">Booked Appointments</span> <br className="hidden md:block" />
            on Autopilot.
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base md:text-lg lg:text-xl text-zinc-300 max-w-xl mb-10 font-light leading-relaxed"
          >
            The AI WhatsApp Chatbot built exclusively for Indian Dental Clinics. Never miss a lead, automate follow-ups, and fill your calendar 24/7.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-start w-full sm:w-auto"
          >
            <a href="#contact" className="group relative inline-flex items-center justify-center bg-gradient-to-r from-amber-500 to-orange-600 text-white px-8 py-4 rounded-full font-bold text-lg transition-all shadow-[0_0_40px_-10px_rgba(245,158,11,0.5)] hover:shadow-[0_0_60px_-10px_rgba(245,158,11,0.7)] hover:scale-105">
              Book a Free Demo
            </a>
            <a href="#how-it-works" className="group inline-flex items-center justify-center bg-zinc-800/50 hover:bg-zinc-800 text-white border border-zinc-700 px-8 py-4 rounded-full font-bold text-lg transition-all backdrop-blur-md hover:scale-105">
              See How It Works
            </a>
          </motion.div>
        </div>
      </section>

      {/* Problem Section */}
      <section id="problem" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#1E3A5F]">Are you losing money on Meta Ads?</h2>
            <p className="mt-4 text-lg text-slate-600">Running ads is easy, but converting leads is where most clinics fail.</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 hover:shadow-md transition-shadow">
              <Clock className="h-10 w-10 text-rose-500 mb-4" />
              <h3 className="text-xl font-bold text-[#1E3A5F] mb-2">Slow Response Times</h3>
              <p className="text-slate-600">Leads cool down if not contacted within 5 minutes. Your front desk is too busy to reply instantly.</p>
            </div>
            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 hover:shadow-md transition-shadow">
              <Users className="h-10 w-10 text-rose-500 mb-4" />
              <h3 className="text-xl font-bold text-[#1E3A5F] mb-2">Wasted Ad Spend</h3>
              <p className="text-slate-600">You pay for clicks, but people drop off because booking an appointment involves too much friction.</p>
            </div>
            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 hover:shadow-md transition-shadow">
              <MessageCircle className="h-10 w-10 text-rose-500 mb-4" />
              <h3 className="text-xl font-bold text-[#1E3A5F] mb-2">No Follow-ups</h3>
              <p className="text-slate-600">Manual follow-ups are tedious. Leads who need a gentle nudge are lost forever.</p>
            </div>
            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 hover:shadow-md transition-shadow">
              <TrendingUp className="h-10 w-10 text-rose-500 mb-4" />
              <h3 className="text-xl font-bold text-[#1E3A5F] mb-2">Unpredictable ROI</h3>
              <p className="text-slate-600">Without a system to capture and convert, you have no idea if your marketing is actually working.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
              <h2 className="text-3xl font-bold text-[#1E3A5F] mb-6">The Solution: An AI Receptionist in their Pocket</h2>
              <p className="text-lg text-slate-600 mb-8">
                Vihaanflow AI connects directly to your Facebook and Instagram ads. The moment someone clicks, our bot engages them on WhatsApp, qualifies them, and books the appointment directly into your calendar.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-[#0EA5E9] flex-shrink-0 mt-0.5" />
                  <span className="ml-3 text-slate-700">Instant responses 24/7, even on weekends and holidays.</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-[#0EA5E9] flex-shrink-0 mt-0.5" />
                  <span className="ml-3 text-slate-700">Conversational AI that sounds natural and professional.</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-[#0EA5E9] flex-shrink-0 mt-0.5" />
                  <span className="ml-3 text-slate-700">Automatic follow-ups for ghosted leads.</span>
                </li>
              </ul>
            </div>
            <div className="lg:w-1/2">
              <img 
                src="https://images.unsplash.com/photo-1555421689-d68471e189f2?q=80&w=2000&auto=format&fit=crop" 
                alt="AI Chatbot Interface" 
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#1E3A5F]">How It Works</h2>
            <p className="mt-4 text-lg text-slate-600">From ad click to walking in the door.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-slate-200 z-0"></div>
            
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-[#e0f2fe] rounded-full flex items-center justify-center mb-6 border-4 border-white shadow-sm">
                <Smartphone className="h-10 w-10 text-[#0EA5E9]" />
              </div>
              <h3 className="text-xl font-bold text-[#1E3A5F] mb-3">1. Patient Clicks Ad</h3>
              <p className="text-slate-600">A potential patient sees your Meta Ad and clicks "Send Message".</p>
            </div>
            
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-[#e0f2fe] rounded-full flex items-center justify-center mb-6 border-4 border-white shadow-sm">
                <Bot className="h-10 w-10 text-[#0EA5E9]" />
              </div>
              <h3 className="text-xl font-bold text-[#1E3A5F] mb-3">2. AI Engages on WhatsApp</h3>
              <p className="text-slate-600">Our bot instantly replies on WhatsApp, answers FAQs, and qualifies the lead.</p>
            </div>
            
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-[#e0f2fe] rounded-full flex items-center justify-center mb-6 border-4 border-white shadow-sm">
                <Calendar className="h-10 w-10 text-[#0EA5E9]" />
              </div>
              <h3 className="text-xl font-bold text-[#1E3A5F] mb-3">3. Appointment Booked</h3>
              <p className="text-slate-600">The bot seamlessly schedules the appointment into your existing calendar system.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#1E3A5F]">Powerful Features for Dental Clinics</h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: "Smart Qualifying", desc: "Filters out low-intent leads and prioritizes high-value treatments like Implants or Aligners." },
              { title: "Native WhatsApp", desc: "Operates entirely within WhatsApp, the app your patients already use every day." },
              { title: "No-Show Reduction", desc: "Sends automated WhatsApp reminders 24hrs and 2hrs before the appointment." },
              { title: "CRM Integration", desc: "Syncs leads seamlessly with your existing CRM or Google Sheets." },
              { title: "Multilingual", desc: "Can converse in English, Hindi, and regional languages to maximize reach." },
              { title: "Broadcasts", desc: "Send promotional offers or festive greetings to your entire patient database easily." }
            ].map((feature, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <CheckCircle className="h-8 w-8 text-[#0EA5E9] mb-4" />
                <h3 className="text-lg font-bold text-[#1E3A5F] mb-2">{feature.title}</h3>
                <p className="text-slate-600 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Digital Products Section */}
      <section className="py-20 bg-zinc-950 relative overflow-hidden">
        {/* Glow effects */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            {/* Text side */}
            <div className="lg:w-1/2">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-sm font-medium mb-6">
                <ShoppingBag className="h-4 w-4" />
                Digital Products
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-5 leading-tight">
                Premium Ebooks &{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-500">
                  Digital Guides
                </span>
              </h2>
              <p className="text-zinc-400 text-lg mb-8 leading-relaxed">
                Explore our curated library of expert ebooks, playbooks, and digital resources. Instant delivery straight to your inbox — no waiting, no friction.
              </p>
              <ul className="space-y-4 mb-10">
                {[
                  { icon: Zap, label: "Instant email delivery after payment" },
                  { icon: Shield, label: "Secure, token-protected download links" },
                  { icon: BookOpen, label: "Lifetime access to your purchase" },
                ].map(({ icon: Icon, label }) => (
                  <li key={label} className="flex items-center gap-3 text-zinc-300">
                    <div className="w-8 h-8 bg-orange-500/15 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="h-4 w-4 text-orange-400" />
                    </div>
                    {label}
                  </li>
                ))}
              </ul>
              <Link
                to="/digital-products"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white px-8 py-4 rounded-full font-bold text-lg transition-all shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-105"
              >
                <ShoppingBag className="h-5 w-5" />
                Browse Digital Products
              </Link>
            </div>

            {/* Cards side */}
            <div className="lg:w-1/2 w-full grid grid-cols-2 gap-4">
              {[
                { title: "Digital Marketing Playbook", price: "₹499", gradient: "from-violet-600 to-purple-700" },
                { title: "AI Tools for Business", price: "₹799", gradient: "from-orange-500 to-red-600" },
                { title: "WhatsApp Sales Mastery", price: "₹349", gradient: "from-cyan-500 to-blue-600" },
                { title: "Clinic Growth Formula", price: "₹999", gradient: "from-emerald-500 to-teal-600" },
              ].map((book, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-orange-500/30 transition-all group hover:-translate-y-1"
                >
                  <div className={`h-28 bg-gradient-to-br ${book.gradient} flex items-center justify-center`}>
                    <BookOpen className="h-10 w-10 text-white/50" />
                  </div>
                  <div className="p-4">
                    <p className="text-white text-sm font-semibold leading-snug mb-2">{book.title}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-orange-400 font-extrabold">{book.price}</span>
                      <span className="text-xs text-zinc-500 group-hover:text-orange-400 transition-colors">Buy →</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#1E3A5F]">Trusted by Top Clinics in India</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: "Dr. Sharma", clinic: "SmileCare Multispeciality", text: "Vihaanflow AI doubled our appointment bookings from Meta Ads within the first month. Best investment we've made." },
              { name: "Dr. Patel", clinic: "Pearl Dental", text: "Finally, my front desk can focus on the patients in the clinic instead of answering Facebook messages all day." },
              { name: "Dr. Reddy", clinic: "Advanced Dental Solutions", text: "The automated follow-ups are a game-changer. We're recovering so many leads that used to just go cold." }
            ].map((testimonial, i) => (
              <div key={i} className="bg-slate-50 p-8 rounded-2xl border border-slate-100">
                <div className="flex text-amber-400 mb-4">
                  {[...Array(5)].map((_, j) => <Star key={j} className="h-5 w-5 fill-current" />)}
                </div>
                <p className="text-slate-700 italic mb-6">"{testimonial.text}"</p>
                <div>
                  <p className="font-bold text-[#1E3A5F]">{testimonial.name}</p>
                  <p className="text-sm text-slate-500">{testimonial.clinic}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#1E3A5F]">Simple, Transparent Pricing</h2>
            <p className="mt-4 text-lg text-slate-600">Choose the plan that fits your clinic's volume.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto items-center">
            {/* Starter */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center">
              <h3 className="text-xl font-bold text-[#1E3A5F] mb-2">Starter</h3>
              <p className="text-slate-500 mb-6">For single chair clinics</p>
              <div className="text-4xl font-extrabold text-[#1E3A5F] mb-6">₹4,999<span className="text-lg text-slate-500 font-normal">/mo</span></div>
              <ul className="text-left space-y-4 mb-8">
                <li className="flex items-center"><CheckCircle className="h-5 w-5 text-[#0EA5E9] mr-2" /> 500 Conversations/mo</li>
                <li className="flex items-center"><CheckCircle className="h-5 w-5 text-[#0EA5E9] mr-2" /> Standard AI Responses</li>
                <li className="flex items-center"><CheckCircle className="h-5 w-5 text-[#0EA5E9] mr-2" /> Google Sheets Integration</li>
              </ul>
              <button className="w-full py-3 rounded-xl border border-[#0EA5E9] text-[#0EA5E9] font-semibold hover:bg-[#e0f2fe] transition-colors">
                Get Started
              </button>
            </div>
            
            {/* Growth (Middle) */}
            <div className="bg-[#1E3A5F] p-8 rounded-3xl border border-[#1E3A5F] shadow-xl text-center transform md:-translate-y-4 relative">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-[#0EA5E9] to-teal-400 text-white px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wide">
                Most Popular
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Growth</h3>
              <p className="text-slate-300 mb-6">For busy multi-chair clinics</p>
              <div className="text-4xl font-extrabold text-white mb-6">₹9,999<span className="text-lg text-slate-300 font-normal">/mo</span></div>
              <ul className="text-left space-y-4 mb-8 text-slate-100">
                <li className="flex items-center"><CheckCircle className="h-5 w-5 text-[#0EA5E9] mr-2" /> 2000 Conversations/mo</li>
                <li className="flex items-center"><CheckCircle className="h-5 w-5 text-[#0EA5E9] mr-2" /> Advanced Lead Qualification</li>
                <li className="flex items-center"><CheckCircle className="h-5 w-5 text-[#0EA5E9] mr-2" /> CRM & Calendar Integration</li>
                <li className="flex items-center"><CheckCircle className="h-5 w-5 text-[#0EA5E9] mr-2" /> Automated Follow-ups</li>
              </ul>
              <button className="w-full py-3 rounded-xl bg-[#0EA5E9] text-white font-semibold hover:bg-[#0284c7] transition-colors shadow-lg shadow-sky-500/30">
                Get Started
              </button>
            </div>
            
            {/* Enterprise */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center">
              <h3 className="text-xl font-bold text-[#1E3A5F] mb-2">Enterprise</h3>
              <p className="text-slate-500 mb-6">For dental chains</p>
              <div className="text-4xl font-extrabold text-[#1E3A5F] mb-6">Custom</div>
              <ul className="text-left space-y-4 mb-8">
                <li className="flex items-center"><CheckCircle className="h-5 w-5 text-[#0EA5E9] mr-2" /> Unlimited Conversations</li>
                <li className="flex items-center"><CheckCircle className="h-5 w-5 text-[#0EA5E9] mr-2" /> Custom AI Training</li>
                <li className="flex items-center"><CheckCircle className="h-5 w-5 text-[#0EA5E9] mr-2" /> Priority API Support</li>
              </ul>
              <button className="w-full py-3 rounded-xl border border-[#0EA5E9] text-[#0EA5E9] font-semibold hover:bg-[#e0f2fe] transition-colors">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#1E3A5F]">Frequently Asked Questions</h2>
          </div>
          
          <div className="space-y-4">
            {[
              { q: "Do I need to be technically skilled to use this?", a: "Not at all. We handle the entire setup, integration with Meta Ads, and AI training. You just sit back and watch appointments flow in." },
              { q: "Is it approved by WhatsApp?", a: "Yes, we use the official WhatsApp Cloud API, ensuring your number is completely safe and compliant with Meta's policies." },
              { q: "Can the AI speak regional languages?", a: "Yes! Our bot can comfortably switch between English, Hindi, and several other regional languages based on the user's input." },
              { q: "What happens if the AI can't answer a question?", a: "The bot is trained to gracefully hand over the conversation to a human agent (your receptionist) if it encounters a complex medical question." },
              { q: "How long does it take to go live?", a: "Typically, we can get your clinic fully integrated and live within 48 to 72 hours." }
            ].map((faq, i) => (
              <div key={i} className="border border-slate-200 rounded-lg overflow-hidden">
                <button 
                  className="w-full text-left px-6 py-4 bg-slate-50 hover:bg-slate-100 flex justify-between items-center font-semibold text-[#1E3A5F] transition-colors"
                  onClick={() => toggleFaq(i)}
                >
                  {faq.q}
                  <ChevronDown className={cn("h-5 w-5 text-slate-500 transition-transform", openFaq === i ? "rotate-180" : "")} />
                </button>
                {openFaq === i && (
                  <div className="px-6 py-4 bg-white text-slate-600">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact / CTA */}
      <section id="contact" className="py-24 bg-slate-950 relative overflow-hidden">
        {/* Abstract shapes */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-sky-500/10 rounded-full blur-[100px]" />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Ready to Automate Your Clinic's Growth?</h2>
          <p className="text-xl text-slate-400 mb-10">Stop losing leads to competitors. Book a quick 15-minute demo to see Vihaanflow AI in action.</p>
          
          <form className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-xl mx-auto shadow-2xl relative" onSubmit={handleDemoSubmit}>
            {formState.submitted && (
              <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center z-20">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="h-8 w-8 text-emerald-500" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Demo Requested!</h3>
                <p className="text-slate-400 text-center max-w-sm">Our team will reach out to you shortly to schedule the demo.</p>
              </div>
            )}
            <h3 className="text-2xl font-bold text-white mb-6">Book Your Free Demo</h3>
            <div className="space-y-4 text-left">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Clinic Name</label>
                <input 
                  type="text" 
                  value={formState.clinicName}
                  onChange={e => setFormState({...formState, clinicName: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all placeholder:text-slate-600" 
                  placeholder="e.g. SmileCare Dental" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Your Name</label>
                <input 
                  type="text" 
                  value={formState.name}
                  onChange={e => setFormState({...formState, name: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all placeholder:text-slate-600" 
                  placeholder="e.g. Dr. Sharma" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">WhatsApp Number</label>
                <input 
                  type="tel" 
                  value={formState.phone}
                  onChange={e => setFormState({...formState, phone: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all placeholder:text-slate-600" 
                  placeholder="+91 98765 43210" 
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
                    Submitting...
                  </>
                ) : (
                  "Schedule Demo Now"
                )}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Footer handled by Layout */}

      {/* Floating WhatsApp Button */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-4">
        {/* Animated Tooltip Bubble */}
        <div className="hidden md:flex bg-white text-[#1E3A5F] px-4 py-2.5 rounded-2xl shadow-xl border border-slate-100 text-sm font-bold relative animate-bounce items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Need help? Chat with AI!
          <div className="absolute top-1/2 -right-2 transform -translate-y-1/2 w-4 h-4 bg-white border-t border-r border-slate-100 rotate-45"></div>
        </div>
        
        {/* Main Button */}
        <a 
          href="https://wa.me/917339366166?text=Hi!%20I%20would%20like%20to%20know%20more%20about%20Vihaanflow%20AI." 
          target="_blank"
          rel="noopener noreferrer"
          className="group relative bg-gradient-to-tr from-[#128C7E] to-[#25D366] text-white p-4 rounded-full shadow-2xl hover:shadow-[0_0_40px_-5px_rgba(37,211,102,0.6)] hover:scale-110 transition-all duration-300 flex items-center justify-center"
          aria-label="Chat with us on WhatsApp"
        >
          {/* Pulsing ring effect */}
          <div className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-75"></div>
          
          {/* Actual WhatsApp SVG Logo */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="34"
            height="34"
            viewBox="0 0 24 24"
            className="relative z-10 fill-current drop-shadow-md"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.663-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
          </svg>
        </a>
      </div>
    </div>
  );
}
