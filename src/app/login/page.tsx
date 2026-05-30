"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

type Tab = "phone" | "email" | "wechat";

export default function LoginPage() {
  const router = useRouter();
  const { login, register, loginEmail } = useAuth();
  const [tab, setTab] = useState<Tab>("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);

  const sendCode = async () => {
    if (!phone) return;
    await fetch("/api/auth/send-sms", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone }) });
    setCodeSent(true);
  };

  const handlePhone = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const ok = await login(phone, code);
    if (ok) { router.push("/my"); } else { setError("验证码错误（开发模式：1234）"); }
    setLoading(false);
  };

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    if (isRegister) {
      const ok = await register(email, password);
      if (!ok) { setError("注册失败"); setLoading(false); return; }
    }
    const ok = await loginEmail(email, password);
    if (ok) { router.push("/my"); } else { setError("邮箱或密码错误"); }
    setLoading(false);
  };

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "phone", label: "手机登录", icon: "📱" },
    { id: "email", label: "邮箱登录", icon: "📧" },
    { id: "wechat", label: "微信登录", icon: "💬" },
  ];

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #667eea, #764ba2)", padding: 20 }}>
      <div style={{ background: "white", borderRadius: 20, padding: 40, width: "100%", maxWidth: 400, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
        <h1 style={{ textAlign: "center", fontSize: 24, fontWeight: "bold", marginBottom: 8 }}>🌍 登录旅行攻略</h1>
        <p style={{ textAlign: "center", color: "#666", fontSize: 14, marginBottom: 24 }}>登录后可保存和查看自己的攻略</p>

        <div style={{ display: "flex", gap: 4, marginBottom: 24, background: "#f3f4f6", borderRadius: 10, padding: 4 }}>
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, padding: "10px 0", borderRadius: 8, border: "none", background: tab === t.id ? "white" : "transparent", fontWeight: tab === t.id ? "bold" : "normal", cursor: "pointer", fontSize: 14, boxShadow: tab === t.id ? "0 1px 3px rgba(0,0,0,0.1)" : "none" }}>{t.icon} {t.label}</button>
          ))}
        </div>

        {tab === "phone" && (
          <form onSubmit={handlePhone}>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 13, fontWeight: 600 }}>手机号</label>
              <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="输入手机号" maxLength={11} style={{ width: "100%", padding: "10px 14px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 15, outline: "none", boxSizing: "border-box" }} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 13, fontWeight: 600 }}>验证码</label>
              <div style={{ display: "flex", gap: 8 }}>
                <input type="text" value={code} onChange={(e) => setCode(e.target.value)} placeholder="输入验证码" maxLength={6} style={{ flex: 1, padding: "10px 14px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 15, outline: "none", boxSizing: "border-box" }} />
                <button type="button" onClick={sendCode} style={{ whiteSpace: "nowrap", padding: "10px 14px", borderRadius: 8, background: codeSent ? "#d1d5db" : "#2563eb", color: "white", border: "none", fontSize: 13, cursor: "pointer" }}>{codeSent ? "已发送" : "获取验证码"}</button>
              </div>
              {codeSent && <p style={{ fontSize: 11, color: "#6b7280", marginTop: 4 }}>开发模式验证码：1234</p>}
            </div>
            {error && <p style={{ color: "#ef4444", fontSize: 13, marginBottom: 8 }}>{error}</p>}
            <button type="submit" disabled={loading} style={{ width: "100%", padding: "12px", background: "#2563eb", color: "white", border: "none", borderRadius: 10, fontSize: 16, fontWeight: "bold", cursor: "pointer" }}>{loading ? "登录中..." : "登录 / 注册"}</button>
          </form>
        )}

        {tab === "email" && (
          <form onSubmit={handleEmail}>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 13, fontWeight: 600 }}>邮箱</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" style={{ width: "100%", padding: "10px 14px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 15, outline: "none", boxSizing: "border-box" }} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 13, fontWeight: 600 }}>密码</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="输入密码" style={{ width: "100%", padding: "10px 14px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 15, outline: "none", boxSizing: "border-box" }} />
            </div>
            {error && <p style={{ color: "#ef4444", fontSize: 13, marginBottom: 8 }}>{error}</p>}
            <button type="submit" disabled={loading} style={{ width: "100%", padding: "12px", background: "#2563eb", color: "white", border: "none", borderRadius: 10, fontSize: 16, fontWeight: "bold", cursor: "pointer" }}>{loading ? "处理中..." : isRegister ? "注册" : "登录"}</button>
            <p style={{ textAlign: "center", marginTop: 12, fontSize: 13, color: "#6b7280" }}>{isRegister ? "已有账号？" : "没有账号？"}<button type="button" onClick={() => setIsRegister(!isRegister)} style={{ color: "#2563eb", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>{isRegister ? "去登录" : "去注册"}</button></p>
          </form>
        )}

        {tab === "wechat" && (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <p style={{ fontSize: 48, margin: 0 }}>💬</p>
            <a href="/api/auth/wechat" style={{ display: "inline-block", marginTop: 20, padding: "12px 32px", background: "#07C160", color: "white", borderRadius: 10, fontSize: 16, fontWeight: "bold", textDecoration: "none" }}>微信扫码登录</a>
            <p style={{ color: "#9ca3af", fontSize: 12, marginTop: 12 }}>点击后跳转微信扫码授权</p>
          </div>
        )}
      </div>
    </div>
  );
}
