import { useEffect, useRef, useState } from "react";
import { CloseIcon } from "../Shared/Icons";
import { formatDate } from "../Shared/noteUtils";
import "./NoteModal.css";

const TITLE_MAX = 90;
const CONTENT_MAX = 500;

export default function NoteModal({ note, onSave, onClose }) {
  const editing = Boolean(note);

  const [title, setTitle] = useState(note?.title || "");
  const [content, setContent] = useState(note?.content || "");
  const [errors, setErrors] = useState({});

  const titleRef = useRef(null);
  const closeRef = useRef(onClose);

  closeRef.current = onClose;

  useEffect(() => {
    titleRef.current?.focus();

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e) => {
      if (e.key === "Escape") {
        closeRef.current();
      }
    };

    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  const submit = (e) => {
    e.preventDefault();

    const er = {};

    if (!title.trim()) {
      er.title = "Enter a heading.";
    }

    setErrors(er);

    if (Object.keys(er).length) return;

    onSave({
      title: title.trim(),
      content: content.trim(),
    });
  };

  return (
    <div
      className="nm-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <form
        className="nm-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="nm-heading"
        onSubmit={submit}
        noValidate
      >
        <button
          type="button"
          className="nm-close"
          aria-label="Close"
          onClick={onClose}
        >
          <CloseIcon size={20} />
        </button>

        <h2 className="nm-title" id="nm-heading">
          {editing ? "Edit Note" : "Add Note"}
        </h2>

        {editing && (
          <p className="nm-written">
            Written on {formatDate(note.createdAt)}
          </p>
        )}

        <input
          ref={titleRef}
          className={`nm-input ${errors.title ? "has-error" : ""}`}
          type="text"
          placeholder="Enter Heading"
          aria-label="Heading"
          maxLength={TITLE_MAX}
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setErrors((er) => ({
              ...er,
              title: undefined,
            }));
          }}
        />

        <div className="nm-count-row">
          <span className="nm-error">{errors.title}</span>

          <span className="nm-count">
            {title.length} / {TITLE_MAX}
          </span>
        </div>

        <textarea
          className="nm-input nm-textarea"
          placeholder="Enter Details"
          aria-label="Details"
          maxLength={CONTENT_MAX}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <div className="nm-count-row">
          <span />

          <span className="nm-count">
            {content.length} / {CONTENT_MAX}
          </span>
        </div>

        <button type="submit" className="nm-save">
          {editing ? "Save Note" : "Add Note"}
        </button>
      </form>
    </div>
  );
}