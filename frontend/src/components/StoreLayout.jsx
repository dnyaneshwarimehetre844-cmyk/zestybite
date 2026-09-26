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
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
      <Navbar
        onOpenSearch={() => setSearchOpen(true)}
        onOpenAuth={openAuthModal}
      />
      <Outlet context={{ openAuth: openAuthModal }} />
      <AuthModal open={authModalOpen} onClose={closeAuthModal} />
      <Footer />
    </>
  );
}
