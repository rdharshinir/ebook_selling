import { useState, useEffect } from "react";
import { ShoppingBag, Search, BookOpen, Sparkles, Shield, Zap, Clock, Star } from "lucide-react";
import BookCard from "@/components/BookCard";
import { motion } from "framer-motion";

interface Book {
  id: string;
  title: string;
  description: string | null;
  price: number | null;
  coverUrl: string | null;
}

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Demo/fallback books shown when backend isn't running or has no data
const DEMO_BOOKS: Book[] = [
  {
    id: "demo-1",
    title: "The Ultimate Digital Marketing Playbook",
    description: "Master Facebook Ads, Instagram growth, and WhatsApp automation strategies used by India's top clinics and businesses.",
    price: 49900,
    coverUrl: null,
  },
  {
    id: "demo-2",
    title: "AI Tools for Entrepreneurs: 2024 Edition",
    description: "Discover 50+ AI tools that automate your business workflows, save 10+ hours a week and multiply your revenue.",
    price: 79900,
    coverUrl: null,
  },
  {
    id: "demo-3",
    title: "WhatsApp Business Mastery",
    description: "The complete guide to building a WhatsApp sales funnel that converts cold leads into paying customers on autopilot.",
    price: 34900,
    coverUrl: null,
  },
  {
    id: "demo-4",
    title: "Clinic Growth Formula",
    description: "A step-by-step blueprint for dental and healthcare clinics to attract 50+ new patients every month through digital channels.",
    price: 99900,
    coverUrl: null,
  },
  {
    id: "demo-5",
    title: "Email Marketing That Sells",
    description: "Write emails your subscribers actually open. Proven sequences, subject lines, and automation flows for Indian businesses.",
    price: 29900,
    coverUrl: null,
  },
  {
    id: "demo-6",
    title: "The Freelancer's Financial Blueprint",
    description: "Pricing strategies, client acquisition scripts, and passive income models that took India's top freelancers to ₹1L+ months.",
    price: 59900,
    coverUrl: null,
  },
];

export default function DigitalProducts() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/store/books`);
        const data = await res.json();
        if (data.success && data.books.length > 0) {
          setBooks(data.books);
        } else {
          // Fallback to demo books if no books in DB yet
          setBooks(DEMO_BOOKS);
        }
      } catch {
        // Backend may not be running in dev — use demo books
        setBooks(DEMO_BOOKS);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const filteredBooks = books.filter(
    (b) =>
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.description || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectBook = (book: Book) => {
    setSelectedBook(book);
    localStorage.setItem("vf_checkout_book", JSON.stringify(book));
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* ── Hero Banner ────────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-800 pt-28 pb-20 overflow-hidden">
        {/* Glowing orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-sm font-medium mb-6"
          >
            <Sparkles className="h-4 w-4" />
            Premium Digital Products
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight"
          >
            Level Up with{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-500">
              Expert Ebooks
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-zinc-400 text-lg max-w-2xl mx-auto mb-10"
          >
            Curated digital guides, playbooks, and strategies trusted by thousands of professionals across India.
          </motion.p>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap justify-center gap-4 mb-10"
          >
            {[
              { icon: Shield, label: "Secure Payments" },
              { icon: Zap, label: "Instant Delivery" },
              { icon: Clock, label: "Lifetime Access" },
              { icon: Star, label: "5-Star Rated" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-zinc-400 text-sm bg-zinc-800/50 border border-zinc-700/50 px-4 py-2 rounded-full">
                <Icon className="h-4 w-4 text-orange-400" />
                {label}
              </div>
            ))}
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="relative max-w-md mx-auto"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
            <input
              type="text"
              placeholder="Search ebooks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-zinc-800/70 border border-zinc-700 text-white placeholder:text-zinc-500 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 backdrop-blur-sm transition-all"
            />
          </motion.div>
        </div>
      </section>

      {/* ── Stats Bar ────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-zinc-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap justify-center gap-8">
          {[
            { value: "2,400+", label: "Happy Readers" },
            { value: "98%", label: "Satisfaction Rate" },
            { value: "₹0", label: "Hidden Fees" },
            { value: "24/7", label: "Instant Access" },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <div className="text-xl font-extrabold text-zinc-900">{value}</div>
              <div className="text-xs text-zinc-500">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Products Grid ─────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-zinc-100 animate-pulse">
                <div className="h-56 bg-zinc-200" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-zinc-200 rounded w-3/4" />
                  <div className="h-3 bg-zinc-100 rounded w-full" />
                  <div className="h-3 bg-zinc-100 rounded w-2/3" />
                  <div className="h-10 bg-zinc-200 rounded-xl mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="text-center py-24">
            <BookOpen className="h-16 w-16 text-zinc-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-zinc-600 mb-2">No ebooks found</h3>
            <p className="text-zinc-400">Try a different search term or check back later.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-zinc-900">
                  {searchQuery ? `Results for "${searchQuery}"` : "All Products"}
                </h2>
                <p className="text-zinc-500 text-sm mt-1">{filteredBooks.length} product{filteredBooks.length !== 1 ? "s" : ""} available</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-zinc-500">
                <ShoppingBag className="h-4 w-4" />
                Powered by VihaanFlow
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBooks.map((book, i) => (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.07 }}
                >
                  <BookCard book={book} onBuy={handleSelectBook} index={i} />
                </motion.div>
              ))}
            </div>
          </>
        )}
      </section>

      {/* ── Bottom CTA ───────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-r from-amber-500 to-orange-600 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-white mb-4">
            Can't find what you're looking for?
          </h2>
          <p className="text-orange-100 text-lg mb-8">
            We're constantly adding new ebooks and resources. Request a topic and we'll create it!
          </p>
          <a
            href="/contact"
            className="inline-block bg-white text-orange-600 font-bold px-8 py-3.5 rounded-full hover:bg-orange-50 transition-colors shadow-lg"
          >
            Request a Topic
          </a>
        </div>
      </section>
    </div>
  );
}
