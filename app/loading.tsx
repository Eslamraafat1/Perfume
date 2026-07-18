import "./globals.css";

export default function RootLoading() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--black)",
      }}
    >
      <div
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          border: "2px solid rgba(220,202,187,0.15)",
          borderTopColor: "var(--gold)",
          animation: "nl-spin 0.8s linear infinite",
        }}
      />
    </div>
  );
}
