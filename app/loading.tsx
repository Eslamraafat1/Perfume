import "./globals.css";

export default function RootLoading() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--black)",
        gap: "28px",
      }}
    >
      <div className="loading-spinner" />
      <div
        style={{
          color: "var(--gold)",
          fontSize: "0.75rem",
          letterSpacing: "0.25em",
          textTransform: "uppercase",
          fontFamily: "var(--font-sans)",
          opacity: 0.6,
        }}
      >
        Loading
      </div>
    </div>
  );
}
