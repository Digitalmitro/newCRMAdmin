import React, { useState, useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import DesktopRouting from "./desktop/Route";
import MobileRouting from "./mobile/Route";
import { AuthProvider } from "./context/authContext";
import { connectSocket } from "./utils/socket";

function App() {
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  useEffect(() => {
    connectSocket(); // Ensures connection on app start

    return () => {
      console.log("Cleaning up socket connection...");
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth); 
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []); 
  return (
    <AuthProvider>
    <BrowserRouter>
      {screenWidth >= 440 ? <DesktopRouting /> : <MobileRouting />}
    </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
