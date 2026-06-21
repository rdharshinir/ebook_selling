import { Routes, Route } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import Home from "./pages/Home";
import Contact from "./pages/Contact";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsConditions from "./pages/TermsConditions";
import DigitalProducts from "./pages/DigitalProducts";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import ScrollToTop from "./components/ScrollToTop"; // We need this so it scrolls to top on navigation

export default function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <ScrollToTop />
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsConditions />} />
          <Route path="/digital-products" element={<DigitalProducts />} />
          <Route path="/checkout/:bookId" element={<Checkout />} />
          <Route path="/order-success" element={<OrderSuccess />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
