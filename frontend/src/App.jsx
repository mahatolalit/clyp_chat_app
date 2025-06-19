import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import SignUpPage from "./pages/SignUpPage.jsx";
import ChatPage from "./pages/ChatPage.jsx";
import CallPage from "./pages/CallPage.jsx";
import NotificationsPage from "./pages/NotificationsPage.jsx";
import OnboardingPage from "./pages/OnboardingPage.jsx";
// import NotFoundPage from "./pages/NotFoundPage.jsx";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { axiosInstance } from "./lib/axios.js";

const App = () => {

  const { data:authData, isLoading, error } = useQuery({
    queryKey: ["authUser"],

    queryFn: async () => {

      const res = await axiosInstance.get("auth/me");
      return res.data;
    },

    retry: false,
  });

  const authUser = authData?.user;

  return (
    <div data-theme="night" className="h-screen">
      
      <Routes>
        <Route path="/" element={authUser ? <HomePage/> : <Navigate to ="/login"/>} />
        <Route path="/signup" element={ !authUser ? <SignUpPage/> : <Navigate to ="/"/>} />
        <Route path="/login" element={ !authUser ? <LoginPage/> : <Navigate to ="/"/> } />
        <Route path="/chat" element={ authUser ? <ChatPage /> : <Navigate to ="/login"/> } />
        <Route path="/call" element={ authUser ? <CallPage /> : <Navigate to ="/login"/> } />
        <Route path="/notifications" element={ authUser ? <NotificationsPage /> : <Navigate to ="/login"/> } />
        <Route path="/onboarding" element={ authUser ? <OnboardingPage /> : <Navigate to ="/login"/>} />
        {/* <Route path="*" element={<NotFoundPage />} /> */}


      </Routes>

    </div>
  );
};

export default App;
