import { useEffect, useState } from "react";
import "./Navbar.css";

const Icon = ({ children, size = 20 }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
);

const SunIcon = () => (<Icon><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></Icon>);
const MoonIcon = () => (<Icon><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" /></Icon>);
const LogoutIcon = () => (<Icon size={18}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></Icon>);

/* Loads /logo.png and removes its flat background so it blends with the navbar */
function Logo() {
  const [src, setSrc] = useState("/logo.png");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      try {
        const c = document.createElement("canvas");
        c.width = img.naturalWidth;
        c.height = img.naturalHeight;
        const ctx = c.getContext("2d");
        ctx.drawImage(img, 0, 0);
        const data = ctx.getImageData(0, 0, c.width, c.height);
        const p = data.data;
        if (p[3] === 255) {
          const [r0, g0, b0] = [p[0], p[1], p[2]];
          for (let i = 0; i < p.length; i += 4) {
            const d =
              Math.abs(p[i] - r0) + Math.abs(p[i + 1] - g0) + Math.abs(p[i + 2] - b0);
            if (d < 24) p[i + 3] = 0;
            else if (d < 60) p[i + 3] = Math.round((p[i + 3] * (d - 24)) / 36);
          }
          ctx.putImageData(data, 0, 0);
          setSrc(c.toDataURL("image/png"));
        }
      } catch {
        /* keep the original image */
      }
      setReady(true);
    };
    img.onerror = () => setReady(true);
    img.src = "/logo.png";
  }, []);

  return (
    <img
      className="nav-logo"
      src={src}
      alt=""
      style={{ visibility: ready ? "visible" : "hidden" }}
    />
  );
}

const readTheme = () => {
  try {
    return localStorage.getItem("app_theme") || "dark";
  } catch {
    return "dark";
  }
};

export default function Navbar({ user = "", onLogout }) {
  const [theme, setTheme] = useState(readTheme);
  const [popOpen, setPopOpen] = useState(false);
  const initial = (user.trim()[0] || "U").toUpperCase();

  // apply the theme on <html> so the colour variables work everywhere
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("app_theme", theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  useEffect(() => () => document.documentElement.removeAttribute("data-theme"), []);

  // close the name popup when clicking elsewhere
  useEffect(() => {
    if (!popOpen) return;
    const close = () => setPopOpen(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [popOpen]);

  return (
    <header className="nav">
      <div className="nav-left">
        <div className="nav-brand">
          <Logo />
          <span className="nav-brand-name">Notes</span>
        </div>
      </div>

      <div className="nav-right">
        <button
          type="button"
          className="nav-icon-btn outlined"
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
        >
          {theme === "dark" ? <SunIcon /> : <MoonIcon />}
        </button>

        <div className="nav-user">
          <button
            type="button"
            className="nav-avatar"
            aria-label={`Signed in as ${user}`}
            onClick={(e) => {
              e.stopPropagation();
              setPopOpen((o) => !o);
            }}
          >
            {initial}
          </button>
          <span className="nav-username">{user}</span>
          {popOpen && <div className="nav-pop">{user}</div>}
        </div>

        <button type="button" className="nav-logout" aria-label="Logout" onClick={onLogout}>
          <LogoutIcon />
          <span className="nav-logout-text">Logout</span>
        </button>
      </div>
    </header>
  );
}