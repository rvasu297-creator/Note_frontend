const Base = ({ size = 20, fill = "none", children, ...rest }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill={fill}
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...rest}
  >
    {children}
  </svg>
);

export const PlusIcon = (p) => (<Base {...p}><path d="M12 5v14M5 12h14" /></Base>);
export const CloseIcon = (p) => (<Base {...p}><path d="M6 6l12 12M18 6L6 18" /></Base>);
export const CheckIcon = (p) => (<Base {...p}><path d="M5 12.5l4.5 4.5L19 7.5" /></Base>);
export const TrashIcon = (p) => (<Base {...p}><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" /></Base>);
export const BellIcon = (p) => (<Base {...p}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></Base>);
export const CalendarIcon = (p) => (<Base {...p}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></Base>);
export const SearchIcon = (p) => (<Base {...p}><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></Base>);
export const NoteIcon = (p) => (<Base {...p}><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5" /></Base>);

export const PinIcon = ({ filled, ...p }) => (
  <Base fill={filled ? "currentColor" : "none"} {...p}>
    <path d="M9 3h6l-1 5 3 3v2H7v-2l3-3z" />
    <path d="M12 13v8" />
  </Base>
);

export const HeartIcon = ({ filled, ...p }) => (
  <Base fill={filled ? "currentColor" : "none"} {...p}>
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </Base>
);