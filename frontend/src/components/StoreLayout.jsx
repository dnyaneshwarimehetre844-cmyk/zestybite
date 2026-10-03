import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import SearchOverlay from "./SearchOverlay";
import AuthModal from "./AuthModal";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

export default function StoreLayout() {
  const [searchOpen, setSearchOpen] = useState(false);
  const { authModalOpen, openAuthModal, closeAuthModal } = useAuth();

  return (
    <>
      <div className="store-shell">
        <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
        <Navbar
          onOpenSearch={() => setSearchOpen(true)}
          onOpenAuth={openAuthModal}
        />
        <main className="store-main">
          <Outlet context={{ openAuth: openAuthModal }} />
        </main>
        <AuthModal open={authModalOpen} onClose={closeAuthModal} />
        <Footer />
      </div>
    </>
  );
}
