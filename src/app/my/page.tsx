export default function MyPage() {
  return (
    <div style={{ padding: 24, textAlign: "center", maxWidth: 480, margin: "0 auto" }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16, fontFamily: "var(--font-heading)", color: "var(--color-primary)" }}>
        我的
      </h1>
      <div style={{ background: "white", borderRadius: 12, padding: 32, border: "1px solid #f0e0d0" }}>
        <p style={{ color: "var(--color-text-light)" }}>登录后可查看收藏的旧址和研学路线</p>
        <a href="/login" style={{ color: "var(--color-primary-light)" }}>去登录 →</a>
      </div>
    </div>
  );
}
