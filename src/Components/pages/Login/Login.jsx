import { useEffect, useRef, useState } from "react";
import "./Login.css";

const API_URL = "https://note-backend-fxeh.onrender.com/api/login/";

const loginRequest = async ({ username, password }) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      password,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail ||
        data.non_field_errors?.[0] ||
        "Wrong username or password."
    );
  }

  localStorage.setItem("access_token", data.access);
  localStorage.setItem("refresh_token", data.refresh);

  return username;
};

const Svg = ({ children }) => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);
const UserIcon = () => (<Svg><circle cx="12" cy="8" r="3.6" /><path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6" /></Svg>);
const MailIcon = () => (<Svg><rect x="3" y="5" width="18" height="14" rx="2.5" /><path d="M3.5 7.5l8.5 6 8.5-6" /></Svg>);
const LockIcon = () => (<Svg><rect x="5" y="11" width="14" height="9" rx="2.5" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /><circle cx="12" cy="15.5" r="0.9" /></Svg>);
const EyeIcon = () => (<Svg><path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></Svg>);
const EyeOffIcon = () => (<Svg><path d="M2 12s3.6-6.5 10-6.5c2 0 3.7.6 5.1 1.4M22 12s-3.6 6.5-10 6.5c-2 0-3.7-.6-5.1-1.4" /><circle cx="12" cy="12" r="3" /><path d="M3 3l18 18" /></Svg>);
const CheckIcon = () => (<Svg><path d="M5 12.5l4.5 4.5L19 7.5" /></Svg>);
const CloseIcon = () => (<Svg><path d="M6 6l12 12M18 6L6 18" /></Svg>);

const Leaf = () => (
  <svg className="auth-leaf" viewBox="0 0 120 140" aria-hidden="true">
    <path d="M60 140C60 100 50 60 70 10c25 40 20 90-10 130z" />
    <path d="M40 140C30 110 20 85 5 70c30 5 45 35 35 70z" />
    <path d="M80 140c5-25 20-45 38-55-6 30-18 45-38 55z" />
  </svg>
);

/* Loads /logo.png and removes its flat background so it blends with the box */
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
          // corner pixel = background colour
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
      className="auth-logo"
      src={src}
      alt="Logo"
      style={{ visibility: ready ? "visible" : "hidden" }}
    />
  );
}

function Toast({ toast, onClose }) {
  if (!toast) return null;
  return (
    <div className={`auth-toast ${toast.type}`} role="status" aria-live="polite">
      <span className="auth-toast-icon">
        {toast.type === "success" ? <CheckIcon /> : <CloseIcon />}
      </span>
      <div className="auth-toast-body">
        <div className="auth-toast-title">{toast.title}</div>
        <div className="auth-toast-text">{toast.text}</div>
      </div>
      <button type="button" className="auth-toast-close" aria-label="Close message" onClick={onClose}>
        <CloseIcon />
      </button>
    </div>
  );
}

export default function Login({ onSwitch, onSuccess }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const timers = useRef([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const later = (fn, ms) => timers.current.push(setTimeout(fn, ms));

  const showToast = (t) => {
    setToast(t);
    later(() => setToast(null), 4000);
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((er) => ({ ...er, [name]: undefined }));
  };

  const validate = () => {
    const er = {};
    if (!form.username.trim()) er.username = "Enter your username.";
    if (!form.password) er.password = "Enter your password.";
    setErrors(er);
    return Object.keys(er).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setToast(null);
    try {
      const name = await loginRequest({
        username: form.username.trim(),
        password: form.password,
      });
      showToast({ type: "success", title: "Login successful!", text: "Welcome back." });
      later(() => onSuccess && onSuccess(name), 1300);
    } catch (err) {
      showToast({ type: "error", title: "Login failed", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={onSubmit} noValidate>
        <Leaf />
        <Logo />

        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-sub">Sign in to your account.</p>

        <div className="auth-field">
          <label className="auth-label" htmlFor="username">Username</label>
          <div className={`auth-input-wrap ${errors.username ? "has-error" : ""}`}>
            <UserIcon />
            <input
              id="username"
              name="username"
              className="auth-input"
              type="text"
              placeholder="Enter your username"
              autoComplete="username"
              autoCapitalize="none"
              value={form.username}
              onChange={onChange}
            />
          </div>
          {errors.username && <p className="auth-error">{errors.username}</p>}
        </div>

        <div className="auth-field">
          <label className="auth-label" htmlFor="password">Password</label>
          <div className={`auth-input-wrap ${errors.password ? "has-error" : ""}`}>
            <LockIcon />
            <input
              id="password"
              name="password"
              className="auth-input"
              type={showPw ? "text" : "password"}
              placeholder="Enter your password"
              autoComplete="current-password"
              value={form.password}
              onChange={onChange}
            />
            <button
              type="button"
              className="auth-eye"
              aria-label={showPw ? "Hide password" : "Show password"}
              onClick={() => setShowPw((s) => !s)}
            >
              {showPw ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
          {errors.password && <p className="auth-error">{errors.password}</p>}
        </div>

        <button className="auth-btn" type="submit" disabled={loading}>
          {loading ? "Please wait…" : "Log in"}
        </button>

        <p className="auth-footer">
          Don't have an account?
          <button type="button" className="auth-link" onClick={onSwitch}>Register</button>
        </p>
      </form>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}


