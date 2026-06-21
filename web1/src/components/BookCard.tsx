import { ShoppingCart, Star, BookOpen, Clock, Shield, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Book {
  id: string;
  title: string;
  description: string | null;
  price: number | null;
  coverUrl: string | null;
}

// Generate a beautiful gradient cover from a book title
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
  const index = title.charCodeAt(0) % gradients.length;
  return gradients[index];
}

function formatPrice(paise: number | null): string {
  if (!paise) return "Free";
  return `₹${(paise / 100).toLocaleString("en-IN")}`;
}

interface BookCardProps {
  book: Book;
  onBuy: (book: Book) => void;
  index: number;
}

export default function BookCard({ book, onBuy, index }: BookCardProps) {
  const gradient = generateCoverGradient(book.title);
  const words = book.title.split(" ");
  const navigate = useNavigate();

  const handleBuy = () => {
    onBuy(book);
    navigate(`/checkout/${book.id}`);
  };

  return (
    <div
      className="group relative bg-white rounded-2xl overflow-hidden shadow-sm border border-zinc-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Cover Image */}
      <div
        className="relative h-56 flex items-center justify-center overflow-hidden"
        style={{ background: book.coverUrl ? undefined : gradient }}
      >
        {book.coverUrl ? (
          <img
            src={book.coverUrl}
            alt={book.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <BookOpen className="h-12 w-12 text-white/60 mb-3" />
            <p className="text-white font-bold text-lg leading-tight drop-shadow-md">
              {words.slice(0, 3).join(" ")}
            </p>
            {words.length > 3 && (
              <p className="text-white/80 font-medium text-sm mt-1">
                {words.slice(3, 6).join(" ")}
              </p>
            )}
          </div>
        )}

        {/* Premium badge */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-bold text-orange-600 flex items-center gap-1 shadow-sm">
          <Star className="h-3 w-3 fill-orange-500 text-orange-500" />
          Digital
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-zinc-900 font-bold text-base leading-snug mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors">
          {book.title}
        </h3>

        <p className="text-zinc-500 text-sm leading-relaxed mb-4 line-clamp-2">
          {book.description || "A comprehensive digital guide packed with expert insights and actionable strategies."}
        </p>

        {/* Perks */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="inline-flex items-center gap-1 text-xs text-zinc-500 bg-zinc-50 px-2 py-1 rounded-md border border-zinc-100">
            <Shield className="h-3 w-3 text-green-500" /> Secure Access
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-zinc-500 bg-zinc-50 px-2 py-1 rounded-md border border-zinc-100">
            <Zap className="h-3 w-3 text-orange-500" /> Instant Delivery
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-zinc-500 bg-zinc-50 px-2 py-1 rounded-md border border-zinc-100">
            <Clock className="h-3 w-3 text-blue-500" /> Lifetime Access
          </span>
        </div>

        {/* Price & CTA */}
        <div className="flex items-center justify-between pt-3 border-t border-zinc-100">
          <div>
            <span className="text-2xl font-extrabold text-zinc-900">
              {formatPrice(book.price)}
            </span>
            {book.price && (
              <span className="ml-1 text-xs text-zinc-400 line-through">
                {formatPrice(Math.round(book.price * 1.4))}
              </span>
            )}
          </div>
          <button
            onClick={handleBuy}
            id={`buy-btn-${book.id}`}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-md shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-105 active:scale-95"
          >
            <ShoppingCart className="h-4 w-4" />
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}
