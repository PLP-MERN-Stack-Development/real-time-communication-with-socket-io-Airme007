import { useState } from "react";
import AuthPage from "./pages/AuthPage";
import ChatRoom from "./pages/ChatRoom";
import LandingPage from "./pages/LandingPage";
import Layout from "./components/Layout";

export default function App() {
  const [username, setUsername] = useState(localStorage.getItem("username"));
  const [showLanding, setShowLanding] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("username");
    setUsername(null);
    setShowLanding(false);
  };

  const handleAuthSuccess = (name) => {
    setUsername(name);
    setShowLanding(true);
  };

  const handleEnterChat = () => {
    setShowLanding(false);
  };

  return (
    <Layout>
      {username ? (
        showLanding ? (
          <LandingPage username={username} onEnterChat={handleEnterChat} />
        ) : (
          <ChatRoom username={username} onLogout={handleLogout} />
        )
      ) : (
        <AuthPage onAuthSuccess={handleAuthSuccess} />
      )}
    </Layout>
  );
}
