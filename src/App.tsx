import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { I18nProvider } from "@/contexts/I18nContext";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import Index from "./pages/Index";
import ProductsPage from "./pages/Products";
import CheckoutPage from "./pages/Checkout";
import AboutPage from "./pages/About";
import ContactPage from "./pages/Contact";
import FaqPage from "./pages/Faq";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <I18nProvider>
      <AuthProvider>
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Navbar />
              <CartDrawer />
              <main>
                <Routes>
                  <Route path="/"          element={<Index />} />
                  <Route path="/products"  element={<ProductsPage />} />
                  <Route path="/checkout"  element={<CheckoutPage />} />
                  <Route path="/about"     element={<AboutPage />} />
                  <Route path="/contact"   element={<ContactPage />} />
                  <Route path="/faq"       element={<FaqPage />} />
                  <Route path="*"          element={<NotFound />} />
                </Routes>
              </main>
              <Footer />
            </BrowserRouter>
          </TooltipProvider>
        </CartProvider>
      </AuthProvider>
    </I18nProvider>
  </QueryClientProvider>
);

export default App;
