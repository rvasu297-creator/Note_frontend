export const NOTE_COLOR = {
  bg: "#a9bfa8",
  text: "#33402f",
  chip: "rgba(51,64,47,0.16)",
};

export const colorById = () => NOTE_COLOR;

export const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });