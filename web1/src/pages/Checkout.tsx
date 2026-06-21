import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ShieldCheck, Lock, ArrowLeft, BookOpen, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

interface Book {
  id: string;
  title: string;
  description: string | null;
  price: number | null;
  coverUrl: string | null;
}

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

function formatPrice(paise: number | null): string {
  if (!paise) return "Free";
  return `₹${(paise / 100).toLocaleString("en-IN")}`;
}

function generateCoverGradient(title: string): string {
  const gradients = [
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)",
    "linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)",
    "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)",
    "linear-gradient(135deg, #f97316 0%, #dc2626 100%)",
    "linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)",
    "linear-gradient(135deg, #14b8a6 0%, #0891b2 100%)",
  ];
  return gradients[title.charCodeAt(0) % gradients.length];
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill: { name: string; email: string };
  theme: { color: string };
  modal: { ondismiss: () => void };
}

interface RazorpayInstance {
  open: () => void;
}

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export default function Checkout() {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();

  const [book, setBook] = useState<Book | null>(null);
  const [loadingBook, setLoadingBook] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Load Razorpay JS SDK
  useEffect(() => {
    const existingScript = document.getElementById("razorpay-script");
    if (existingScript) {
      setScriptLoaded(true);
      return;
    }
    const script = document.createElement("script");
    script.id = "razorpay-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => setScriptLoaded(true);
    document.body.appendChild(script);
  }, []);

  // Fetch book details
  useEffect(() => {
    if (!bookId) return;

    // First try localStorage (set by BookCard)
    const cached = localStorage.getItem("vf_checkout_book");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed.id === bookId) {
          setBook(parsed);
          setLoadingBook(false);
          return;
        }
      } catch {}
    }

    // Fetch from API
    fetch(`${API_BASE}/api/store/books/${bookId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setBook(data.book);
        else setError("Product not found.");
      })
      .catch(() => setError("Could not load product details."))
      .finally(() => setLoadingBook(false));
  }, [bookId]);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!book || !scriptLoaded) return;

    setError(null);
    setProcessing(true);

    try {
      // 1. Create Razorpay order on backend
      const orderRes = await fetch(`${API_BASE}/api/razorpay/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId: book.id, amount: book.price || 0 }),
      });
      const orderData = await orderRes.json();

      if (!orderData.success) {
        throw new Error(orderData.error || "Failed to create payment order");
      }

      // 2. Open Razorpay checkout
      const rzp = new window.Razorpay({
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "VihaanFlow",
        description: `Purchase: ${book.title}`,
        order_id: orderData.orderId,
        prefill: { name, email },
        theme: { color: "#f59e0b" },
        modal: {
          ondismiss: () => {
            setProcessing(false);
          },
        },
        handler: async (response: RazorpayResponse) => {
          // 3. Verify payment on backend
          try {
            const verifyRes = await fetch(`${API_BASE}/api/razorpay/verify`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                customerName: name,
                customerEmail: email,
                bookId: book.id,
              }),
            });
            const verifyData = await verifyRes.json();

            if (verifyData.success) {
              // Store order details for success page
              localStorage.setItem(
                "vf_order_success",
                JSON.stringify({
                  bookTitle: book.title,
                  customerName: name,
                  customerEmail: email,
                  paymentId: response.razorpay_payment_id,
                  readerUrl: verifyData.readerUrl,
                })
              );
              navigate("/order-success");
            } else {
              setError("Payment verification failed. Please contact support.");
              setProcessing(false);
            }
          } catch {
            setError("Verification error. Please contact support with payment ID: " + response.razorpay_payment_id);
            setProcessing(false);
          }
        },
      });

      rzp.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed. Please try again.");
      setProcessing(false);
    }
  };

  if (loadingBook) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center pt-16">
        <div className="flex flex-col items-center gap-3 text-zinc-500">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          <p>Loading product...</p>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center pt-16">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-zinc-800 mb-2">Product Not Found</h2>
          <p className="text-zinc-500 mb-6">{error || "This product doesn't exist or is no longer available."}</p>
          <button onClick={() => navigate("/digital-products")} className="bg-orange-500 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-orange-600 transition-colors">
            Back to Store
          </button>
        </div>
      </div>
    );
  }

  const gradient = generateCoverGradient(book.title);

  return (
    <div className="min-h-screen bg-zinc-50 pt-20 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Back link */}
        <button
          onClick={() => navigate("/digital-products")}
          className="flex items-center gap-2 text-zinc-500 hover:text-zinc-800 transition-colors mb-8 group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Store
        </button>

        <div className="grid lg:grid-cols-5 gap-8">

          {/* ── Order Summary (left) ─────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="lg:col-span-2"
          >
            {/* Book Cover */}
            <div
              className="rounded-2xl overflow-hidden h-64 flex items-center justify-center mb-5"
              style={{ background: book.coverUrl ? undefined : gradient }}
            >
              {book.coverUrl ? (
                <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center text-white text-center p-6">
                  <BookOpen className="h-14 w-14 opacity-60 mb-3" />
                  <p className="font-bold text-xl leading-tight">{book.title}</p>
                </div>
              )}
            </div>

            {/* Order Details Card */}
            <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
              <p className="text-xs uppercase tracking-widest text-zinc-400 font-semibold mb-3">Order Summary</p>
              <h2 className="text-xl font-bold text-zinc-900 mb-2">{book.title}</h2>
              <p className="text-zinc-500 text-sm mb-5 leading-relaxed">
                {book.description || "A premium digital ebook delivered instantly after payment."}
              </p>

              <div className="space-y-2 border-t border-zinc-100 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Price</span>
                  <span className="font-semibold text-zinc-800">{formatPrice(book.price)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">GST</span>
                  <span className="font-semibold text-zinc-800">Included</span>
                </div>
                <div className="flex justify-between text-base font-bold border-t border-zinc-100 pt-3 mt-3">
                  <span className="text-zinc-900">Total</span>
                  <span className="text-orange-600">{formatPrice(book.price)}</span>
                </div>
              </div>

              {/* Guarantees */}
              <div className="mt-5 space-y-2">
                {[
                  { icon: ShieldCheck, label: "Secure payment via Razorpay" },
                  { icon: Lock, label: "Your data is never stored" },
                  { icon: CheckCircle, label: "Ebook link sent within seconds" },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2.5 text-xs text-zinc-500">
                    <Icon className="h-4 w-4 text-green-500 flex-shrink-0" />
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* ── Checkout Form (right) ────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="lg:col-span-3"
          >
            <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-8">
              <h1 className="text-2xl font-bold text-zinc-900 mb-1">Complete Your Purchase</h1>
              <p className="text-zinc-500 text-sm mb-8">Enter your details below. Your ebook will be emailed to you instantly.</p>

              {error && (
                <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-red-700 text-sm">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  {error}
                </div>
              )}

              <form onSubmit={handlePayment} className="space-y-5">
                <div>
                  <label htmlFor="checkout-name" className="block text-sm font-medium text-zinc-700 mb-1.5">
                    Full Name <span className="text-orange-500">*</span>
                  </label>
                  <input
                    id="checkout-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-400 transition-all placeholder:text-zinc-400"
                  />
                </div>

                <div>
                  <label htmlFor="checkout-email" className="block text-sm font-medium text-zinc-700 mb-1.5">
                    Email Address <span className="text-orange-500">*</span>
                  </label>
                  <input
                    id="checkout-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="e.g. rahul@example.com"
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-400 transition-all placeholder:text-zinc-400"
                  />
                  <p className="text-xs text-zinc-400 mt-1.5">Your ebook download link will be sent here.</p>
                </div>

                {/* Divider */}
                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-zinc-100" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white px-3 text-xs text-zinc-400">Payment Details</span>
                  </div>
                </div>

                {/* Razorpay info */}
                <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Lock className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-800">Pay securely with Razorpay</p>
                    <p className="text-xs text-zinc-500 mt-0.5">Credit card, debit card, UPI, net banking & wallets accepted</p>
                  </div>
                </div>

                {/* Razorpay payment methods logos */}
                <div className="flex flex-wrap items-center gap-2">
                  {["UPI", "Visa", "Mastercard", "RuPay", "Paytm", "GPay"].map((method) => (
                    <span key={method} className="text-xs bg-zinc-100 text-zinc-600 px-2.5 py-1 rounded-md font-medium border border-zinc-200">
                      {method}
                    </span>
                  ))}
                </div>

                <button
                  id="pay-now-btn"
                  type="submit"
                  disabled={processing || !scriptLoaded}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {processing ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Lock className="h-5 w-5" />
                      Pay {formatPrice(book.price)} Securely
                    </>
                  )}
                </button>
              </form>

              <p className="text-center text-xs text-zinc-400 mt-5">
                By completing your purchase, you agree to our{" "}
                <a href="/terms" className="underline hover:text-zinc-600">Terms of Service</a> and{" "}
                <a href="/privacy" className="underline hover:text-zinc-600">Privacy Policy</a>.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
