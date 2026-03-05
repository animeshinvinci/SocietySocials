import { useState, useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Toaster } from "@/components/ui/sonner";

// Screens
import SplashScreen from "@/screens/SplashScreen";
import PhoneEntryScreen from "@/screens/PhoneEntryScreen";
import SocietySelectScreen from "@/screens/SocietySelectScreen";
import PersonaRevealScreen from "@/screens/PersonaRevealScreen";
import FeedScreen from "@/screens/FeedScreen";
import PostDetailScreen from "@/screens/PostDetailScreen";
import ProfileScreen from "@/screens/ProfileScreen";

// Context
import { UserProvider, useUser } from "@/context/UserContext";

const AppRoutes = () => {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <Routes>
        <Route path="/" element={<SplashScreen />} />
        <Route path="/login" element={<PhoneEntryScreen />} />
        <Route path="/select-society" element={
          user ? <SocietySelectScreen /> : <Navigate to="/login" />
        } />
        <Route path="/persona-reveal" element={
          user ? <PersonaRevealScreen /> : <Navigate to="/login" />
        } />
        <Route path="/feed" element={
          user?.society_id ? <FeedScreen /> : <Navigate to="/" />
        } />
        <Route path="/post/:postId" element={
          user?.society_id ? <PostDetailScreen /> : <Navigate to="/" />
        } />
        <Route path="/profile" element={
          user ? <ProfileScreen /> : <Navigate to="/" />
        } />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <div className="App min-h-screen bg-slate-950 noise-bg">
      <BrowserRouter>
        <UserProvider>
          <AppRoutes />
          <Toaster 
            position="top-center" 
            toastOptions={{
              style: {
                background: '#1E293B',
                color: '#F8FAFC',
                border: '1px solid rgba(255,255,255,0.1)',
              },
            }}
          />
        </UserProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
