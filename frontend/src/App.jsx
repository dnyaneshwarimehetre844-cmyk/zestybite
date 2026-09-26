import { Routes, Route } from "react-router-dom";
import { useOutletContext } from "react-router-dom";
import StoreLayout from "./components/StoreLayout";
import Home from "./pages/Home";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Account from "./pages/Account";
import Delivery from "./pages/Delivery";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsConditions from "./pages/TermsConditions";
import AIChatWidget from "./components/AIChatWidget";

function CheckoutWrapper() {
  const { openAuth } = useOutletContext();
  return <Checkout onRequireAuth={openAuth} />;
}

export default function App() {
  return (
    <>
      <Routes>
        <Route element={<StoreLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<CheckoutWrapper />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/account" element={<Account />} />
          <Route path="/delivery" element={<Delivery />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-conditions" element={<TermsConditions />} />
        </Route>
      </Routes>
      <AIChatWidget />
    </>
  );
}
