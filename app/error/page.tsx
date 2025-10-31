

"use client";

import React, { useEffect, useState } from "react";

export default function ErrorPage() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    function updateOnlineStatus() {
      setIsOnline(navigator.onLine);
    }

    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);

    updateOnlineStatus();

    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
    };
  }, []);

  if (isOnline) {
    return null; // don’t show when connected
  }

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#0f172a",
        color: "#fff",
        textAlign: "center",
        padding: "1rem",
      }}
    >
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
        ⚠️ Connection Lost
      </h1>
      <p style={{ fontSize: "1rem", color: "#ccc" }}>
        You’re currently offline. Please check your internet connection and try again.
      </p>
    </div>
  );
}