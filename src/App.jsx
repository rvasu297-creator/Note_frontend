import { useState } from "react";
import Login from "./Components/pages/Login/Login";
import Signup from "./Components/pages/Signup/Signup";
import Navbar from "./Components/Navbar/Navbar";
import Notes from "./Components/Notes/Notes";

export default function App() {
  const [page, setPage] = useState("login"); // "login" | "signup" | "home"
  const [user, setUser] = useState("");

  if (page === "home") {
    return (
      <div style={{ minHeight: "100dvh", background: "var(--n-main-bg)" }}>
        <Navbar user={user} onLogout={() => setPage("login")} />
        <Notes user={user} />
      </div>
    );
  }

  return page === "login" ? (
    <Login
      onSwitch={() => setPage("signup")}
      onSuccess={(name) => {
        setUser(name);
        setPage("home");
      }}
    />
  ) : (
    <Signup onSwitch={() => setPage("login")} />
  );
}