export default function LoadingSpinner({ text = "加载中..." }: { text?: string }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", padding: 80,
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: "50%",
        border: "4px solid #dbeafe", borderTopColor: "#2563eb",
        animation: "spin 0.8s linear infinite",
      }} />
      <p style={{ marginTop: 16, color: "#6b7280" }}>{text}</p>
    </div>
  );
}
