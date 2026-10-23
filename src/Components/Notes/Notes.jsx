import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import NoteCard from "../NoteCard/NoteCard";
import NoteModal from "../NoteModal/NoteModal";
import {
  CheckIcon,
  CloseIcon,
  HeartIcon,
  NoteIcon,
  PinIcon,
  PlusIcon,
  SearchIcon,
} from "../Shared/Icons";
import "./Notes.css";

const TABS = [
  { id: "all", label: "All notes" },
  { id: "favorites", label: "Favorites" },
  { id: "pinned", label: "Pinned" },
];

const EMPTY = {
  all: {
    icon: <NoteIcon size={34} />,
    title: "No notes yet",
    text: "Click “New note” to write your first note.",
  },
  favorites: {
    icon: <HeartIcon size={34} />,
    title: "No favorite notes",
    text: "Tap the heart on a note to see it here.",
  },
  pinned: {
    icon: <PinIcon size={34} />,
    title: "No pinned notes",
    text: "Pin a note to keep it at the top.",
  },
};

const newId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : String(Date.now() + Math.random());

    
const API_URL = "https://note-backend-fxeh.onrender.com/api/notes/";

export default function Notes({ user = "" }) {
  const [notes, setNotes] = useState([]);
  const [tab, setTab] = useState("all");
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [toasts, setToasts] = useState([]);

  const timers = useRef([]);

  useEffect(() => {
    return () => timers.current.forEach(clearTimeout);
  }, []);

  const pushToast = useCallback((t) => {
    const id = newId();

    setToasts((ts) => [
      ...ts.slice(-3),
      {
        ...t,
        id,
      },
    ]);

    if (!t.sticky) {
      timers.current.push(
        setTimeout(() => {
          setToasts((ts) => ts.filter((x) => x.id !== id));
        }, 3000)
      );
    }
  }, []);

  const closeToast = (id) => {
    setToasts((ts) => ts.filter((x) => x.id !== id));
  };

  const getToken = () => {
    return localStorage.getItem("access_token");
  };

  const loadNotes = useCallback(async () => {
    const token = getToken();

    if (!token) {
      pushToast({
        type: "error",
        title: "Please login again",
      });
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Unable to load notes."
        );
      }

      const formattedNotes = data.map((note) => ({
        id: note.id,
        title: note.title,
        content: note.content,
        favorite: note.is_favorite,
        pinned: note.is_pinned,
        createdAt: note.created_at,
        updatedAt: note.created_at,
      }));

      setNotes(formattedNotes);
    } catch (error) {
      pushToast({
        type: "error",
        title: error.message || "Unable to load notes.",
      });
    }
  }, [pushToast]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();

    const list = notes.filter((n) => {
      const inTab =
        tab === "favorites"
          ? n.favorite
          : tab === "pinned"
          ? n.pinned
          : true;

      if (!inTab) return false;

      if (!q) return true;

      return (
        n.title.toLowerCase().includes(q) ||
        (n.content || "").toLowerCase().includes(q)
      );
    });

    return [...list].sort(
      (a, b) =>
        Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)) ||
        new Date(b.createdAt) - new Date(a.createdAt)
    );
  }, [notes, tab, query]);

  const handleSave = async (data) => {
    const editing = modal?.note;
    const token = getToken();

    if (!token) {
      pushToast({
        type: "error",
        title: "Please login again",
      });
      return;
    }

    try {
      if (editing) {
        const response = await fetch(`${API_URL}${editing.id}/`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: data.title,
            content: data.content,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.detail || "Unable to update note."
          );
        }

        setNotes((ns) =>
          ns.map((n) =>
            n.id === editing.id
              ? {
                  ...n,
                  title: result.title,
                  content: result.content,
                  updatedAt: result.created_at,
                }
              : n
          )
        );

        pushToast({
          type: "success",
          title: "Note updated",
        });
      } else {
        const response = await fetch(API_URL, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: data.title,
            content: data.content,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.detail || "Unable to add note."
          );
        }

        const newNote = {
          id: result.id,
          title: result.title,
          content: result.content,
          pinned: result.is_pinned,
          favorite: result.is_favorite,
          createdAt: result.created_at,
          updatedAt: result.created_at,
        };

        setNotes((ns) => [newNote, ...ns]);

        pushToast({
          type: "success",
          title: "Note added",
        });
      }

      setModal(null);
    } catch (error) {
      pushToast({
        type: "error",
        title: error.message || "Something went wrong.",
      });
    }
  };

  const toggle = async (id, field) => {
    const n = notes.find((x) => x.id === id);

    if (!n) return;

    const token = getToken();

    if (!token) {
      pushToast({
        type: "error",
        title: "Please login again",
      });
      return;
    }

    const backendField =
      field === "pinned" ? "is_pinned" : "is_favorite";

    const newValue = !n[field];

    try {
      const response = await fetch(`${API_URL}${id}/`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          [backendField]: newValue,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.detail || "Unable to update note."
        );
      }

      setNotes((ns) =>
        ns.map((x) =>
          x.id === id
            ? {
                ...x,
                [field]: newValue,
              }
            : x
        )
      );

      const title =
        field === "pinned"
          ? n.pinned
            ? "Note unpinned"
            : "Note pinned"
          : n.favorite
          ? "Removed from favorites"
          : "Added to favorites";

      pushToast({
        type: "success",
        title,
      });
    } catch (error) {
      pushToast({
        type: "error",
        title: error.message || "Unable to update note.",
      });
    }
  };

  const confirmDelete = async () => {
    const token = getToken();

    if (!token) {
      pushToast({
        type: "error",
        title: "Please login again",
      });
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}${confirmId}/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));

        throw new Error(
          data.detail || "Unable to delete note."
        );
      }

      setNotes((ns) =>
        ns.filter((n) => n.id !== confirmId)
      );

      setConfirmId(null);

      pushToast({
        type: "success",
        title: "Note deleted",
      });
    } catch (error) {
      pushToast({
        type: "error",
        title: error.message || "Unable to delete note.",
      });
    }
  };

  const searching = query.trim() !== "";

  const empty = searching
    ? {
        icon: <SearchIcon size={34} />,
        title: "No matching notes",
        text: `Nothing found for “${query.trim()}”.`,
      }
    : EMPTY[tab];

  return (
    <main className="nt-page">
      <div className="nt-head">

        <button
          type="button"
          className="nt-new"
          onClick={() => setModal({ note: null })}
        >
          <PlusIcon size={20} />
          New note
        </button>
      </div>

      {notes.length > 0 && (
        <div className="nt-search">
          <SearchIcon size={20} />

          <input
            type="search"
            placeholder="Search notes…"
            aria-label="Search notes"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          {query && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setQuery("")}
            >
              <CloseIcon size={16} />
            </button>
          )}
        </div>
      )}

      <div
        className="nt-tabs"
        role="tablist"
        aria-label="Filter notes"
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className={`nt-tab ${tab === t.id ? "active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {visible.length ? (
        <div className="nt-grid">
          {visible.map((n) => (
            <NoteCard
              key={n.id}
              note={n}
              onOpen={(note) => setModal({ note })}
              onPin={(id) => toggle(id, "pinned")}
              onFavorite={(id) => toggle(id, "favorite")}
              onDelete={(id) => setConfirmId(id)}
            />
          ))}
        </div>
      ) : (
        <div className="nt-empty">
          {empty.icon}
          <h2>{empty.title}</h2>
          <p>{empty.text}</p>
        </div>
      )}

      {modal && (
        <NoteModal
          note={modal.note}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}

      {confirmId && (
        <div
          className="nt-confirm-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setConfirmId(null);
            }
          }}
        >
          <div
            className="nt-confirm"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="nt-confirm-title"
          >
            <h2 id="nt-confirm-title">Delete this note?</h2>

            <p>This cannot be undone.</p>

            <div className="nt-confirm-actions">
              <button
                type="button"
                className="nt-btn-ghost"
                onClick={() => setConfirmId(null)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="nt-btn-danger"
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="nt-toasts" aria-live="polite">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`nt-toast ${t.type}`}
            role="status"
          >
            <span className="nt-toast-icon">
              <CheckIcon size={18} />
            </span>

            <div className="nt-toast-body">
              <div className="nt-toast-title">
                {t.title}
              </div>

              {t.text && (
                <div className="nt-toast-text">
                  {t.text}
                </div>
              )}
            </div>

            <button
              type="button"
              className="nt-toast-close"
              aria-label="Close"
              onClick={() => closeToast(t.id)}
            >
              <CloseIcon size={16} />
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}