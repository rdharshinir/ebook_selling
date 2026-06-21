import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Mail, BookOpen, ShoppingBag, ArrowRight, Copy, Check } from "lucide-react";
import { motion } from "framer-motion";

interface OrderDetails {
  bookTitle: string;
  customerName: string;
  customerEmail: string;
  paymentId: string;
  readerUrl?: string;
}

export default function OrderSuccess() {
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("vf_order_success");
    if (stored) {
      try {
        setOrder(JSON.parse(stored));
        // Clear after reading so it doesn't persist
        localStorage.removeItem("vf_order_success");
        localStorage.removeItem("vf_checkout_book");
      } catch {
        navigate("/digital-products");
      }
    } else {
      // No order data — redirect
      navigate("/digital-products");
    }
  }, [navigate]);

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!order) return null;

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4 py-16">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-orange-500/5 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-green-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl"
        >
          {/* Success Header */}
          <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/10 border-b border-zinc-800 p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
              className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-5 border-2 border-green-500/30"
            >
              <CheckCircle className="h-10 w-10 text-green-400" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <h1 className="text-3xl font-extrabold text-white mb-2">Payment Successful!</h1>
              <p className="text-zinc-400 text-base">
                Thank you, <span className="text-white font-semibold">{order.customerName}</span>!
              </p>
            </motion.div>
          </div>

          {/* Body */}
          <div className="p-8">
            {/* Email notice */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex items-start gap-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4 mb-6"
            >
              <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Mail className="h-5 w-5 text-orange-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white mb-0.5">Check your inbox!</p>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Your ebook access link has been sent to{" "}
                  <span className="text-orange-400 font-medium">{order.customerEmail}</span>. It may take a minute to arrive.
                </p>
              </div>
            </motion.div>

            {/* Order Card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-zinc-800/50 border border-zinc-700/50 rounded-2xl p-5 mb-6"
            >
              <p className="text-xs uppercase tracking-widest text-zinc-500 font-semibold mb-3">Your Order</p>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white leading-snug">{order.bookTitle}</p>
                  <p className="text-sm text-zinc-500 mt-0.5">Digital Ebook</p>
                </div>
                <span className="text-green-400 text-sm font-bold">✓ Paid</span>
              </div>

              <div className="border-t border-zinc-700/50 mt-4 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Payment ID</span>
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-300 font-mono text-xs">{order.paymentId.slice(0, 18)}...</span>
                    <button
                      onClick={() => handleCopy(order.paymentId)}
                      className="text-zinc-500 hover:text-zinc-300 transition-colors"
                      title="Copy payment ID"
                    >
                      {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Direct reader link (if available) */}
            {order.readerUrl && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="mb-6"
              >
                <a
                  href={order.readerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  id="read-ebook-btn"
                  className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40"
                >
                  <BookOpen className="h-5 w-5" />
                  Read Your Ebook Now
                  <ArrowRight className="h-4 w-4" />
                </a>
                <p className="text-center text-xs text-zinc-600 mt-2">This link also arrives in your email</p>
              </motion.div>
            )}

            {/* What's next */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-zinc-800/30 rounded-2xl p-4 mb-6"
            >
              <p className="text-xs uppercase tracking-widest text-zinc-500 font-semibold mb-3">What's Next?</p>
              <div className="space-y-3">
                {[
                  { step: "1", text: `Check ${order.customerEmail} for your secure ebook link` },
                  { step: "2", text: "Click the link in the email to access your ebook" },
                  { step: "3", text: "Read, learn, and grow — enjoy your purchase!" },
                ].map(({ step, text }) => (
                  <div key={step} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center flex-shrink-0 text-orange-400 text-xs font-bold">
                      {step}
                    </div>
                    <p className="text-sm text-zinc-400 leading-relaxed">{text}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Back to store */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              onClick={() => navigate("/digital-products")}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 transition-all text-sm font-medium"
            >
              <ShoppingBag className="h-4 w-4" />
              Browse More Products
            </motion.button>
          </div>
        </motion.div>

        {/* Bottom trust text */}
        <p className="text-center text-zinc-600 text-xs mt-6">
          Having issues? Contact us at{" "}
          <a href="/contact" className="text-zinc-400 hover:text-white transition-colors underline">
            our support page
          </a>
        </p>
      </div>
    </div>
  );
}
