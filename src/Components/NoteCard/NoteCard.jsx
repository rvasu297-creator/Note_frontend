import { CalendarIcon, HeartIcon, PinIcon, TrashIcon } from "../Shared/Icons";
import { colorById, formatDate } from "../Shared/noteUtils";
import "./NoteCard.css";

export default function NoteCard({ note, onOpen, onPin, onFavorite, onDelete }) {
  const c = colorById(note.color);

  const stop = (fn) => (e) => {
    e.stopPropagation();
    fn(note.id);
  };

  return (
    <article
      className="note-card"
      style={{
        "--c-bg": c.bg,
        "--c-text": c.text,
        "--c-chip": c.chip,
      }}
      onClick={() => onOpen(note)}
    >
      {note.pinned && (
        <span className="note-pin-badge" title="Pinned">
          <PinIcon size={16} filled />
        </span>
      )}

      <button
        type="button"
        className="note-open"
        aria-label={`Open note: ${note.title}`}
      >
        <span className={`note-title ${note.pinned ? "has-pin" : ""}`}>
          {note.title}
        </span>

        {note.content && (
          <span className="note-body">
            {note.content}
          </span>
        )}
      </button>

      {note.tags?.length > 0 && (
        <div className="note-tags">
          {note.tags.map((t) => (
            <span key={t} className="note-tag">
              {t}
            </span>
          ))}
        </div>
      )}

      <div className="note-foot">
        <div className="note-meta">
          <span title="Date written">
            <CalendarIcon size={14} />
            {formatDate(note.createdAt)}
          </span>
        </div>

        <div className="note-actions">
          <button
            type="button"
            className={note.pinned ? "on-pin" : ""}
            aria-label={note.pinned ? "Unpin note" : "Pin note"}
            title={note.pinned ? "Unpin" : "Pin"}
            onClick={stop(onPin)}
          >
            <PinIcon size={18} filled={note.pinned} />
          </button>

          <button
            type="button"
            className={note.favorite ? "on-fav" : ""}
            aria-label={
              note.favorite
                ? "Remove from favorites"
                : "Add to favorites"
            }
            title={note.favorite ? "Remove favorite" : "Favorite"}
            onClick={stop(onFavorite)}
          >
            <HeartIcon size={18} filled={note.favorite} />
          </button>

          <button
            type="button"
            className="danger"
            aria-label="Delete note"
            title="Delete"
            onClick={stop(onDelete)}
          >
            <TrashIcon size={18} />
          </button>
        </div>
      </div>
    </article>
  );
}