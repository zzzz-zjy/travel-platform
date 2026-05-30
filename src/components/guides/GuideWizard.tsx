"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STEPS = ["选择景点", "出行参数", "AI 生成"];

export default function GuideWizard({ attractions }: {
  attractions: { id: number; name: string; cityId: number; cityName: string }[]
}) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [selectedAttractions, setSelectedAttractions] = useState<number[]>([]);
  const [params, setParams] = useState({
    days: 3, people: 2, transport: "地铁+网约车", budget: 3000, style: "美食"
  });
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState("");

  const toggleAttraction = (id: number) => {
    setSelectedAttractions((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const handleGenerate = async () => {
    setGenerating(true);
    const cityName = attractions.find((a) => a.id === selectedAttractions[0])?.cityName || "";
    const names = selectedAttractions.map((id) => attractions.find((a) => a.id === id)!.name);

    try {
      const res = await fetch("/api/ai/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city: cityName, attractions: names,
          days: params.days, people: params.people,
          transport: params.transport, budget: params.budget, style: params.style,
        }),
      });

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let full = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = JSON.parse(line.slice(6));
            if (data.done) {
              full = data.full;
            } else if (data.text) {
              setResult((prev) => prev + data.text);
            }
          }
        }
      }

      // Parse and save
      const parsed = JSON.parse(full);
      const firstCityId = attractions.find((a) => a.id === selectedAttractions[0])!.cityId;

      const saveRes = await fetch("/api/guides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: parsed.title,
          destinationCityId: firstCityId,
          totalDays: params.days,
          budgetAmount: parsed.totalBudget || params.budget,
          transportMode: params.transport,
          travelStyle: params.style,
          rawJson: parsed,
          days: parsed.days.map((d: any) => ({
            dayNumber: d.day,
            title: d.title,
            notes: "",
            items: d.items.map((i: any) => ({
              timeSlot: i.time,
              customSpot: i.spot,
              durationMin: i.duration,
              ticketReminder: i.ticket ? `${i.ticket.price}元 — ${i.ticket.purchase}` : "",
              tips: i.tip || "",
            })),
          })),
        }),
      });

      const saved = await saveRes.json();
      router.push(`/guides/${saved.id}`);
    } catch (err) {
      console.error("Generation failed:", err);
      setGenerating(false);
      setResult((prev) => prev + "\n\n[生成出错，请重试]");
    }
  };

  return (
    <div>
      {/* Step indicator */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 32 }}>
        {STEPS.map((s, i) => (
          <div key={s} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%", display: "flex",
              alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: "bold",
              background: i <= step ? "#2563eb" : "#e5e7eb",
              color: i <= step ? "white" : "#9ca3af",
            }}>{i + 1}</div>
            <span style={{ fontWeight: i <= step ? "bold" : "normal", color: i <= step ? "inherit" : "#9ca3af" }}>
              {s}
            </span>
            {i < STEPS.length - 1 && (
              <div style={{ width: 48, height: 2, background: i < step ? "#2563eb" : "#e5e7eb" }} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Select attractions */}
      {step === 0 && (
        <div>
          <h2 style={{ fontSize: 20, fontWeight: "bold", marginBottom: 16 }}>选择你想去的景点</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
            {attractions.map((a) => (
              <button
                key={a.id}
                onClick={() => toggleAttraction(a.id)}
                style={{
                  padding: 16, borderRadius: 12, border: `2px solid ${selectedAttractions.includes(a.id) ? "#2563eb" : "#e5e7eb"}`,
                  background: selectedAttractions.includes(a.id) ? "#eff6ff" : "white",
                  cursor: "pointer", textAlign: "left",
                }}
              >
                <div style={{ fontWeight: "bold" }}>{a.name}</div>
                <div style={{ fontSize: 13, color: "#666", marginTop: 4 }}>{a.cityName}</div>
              </button>
            ))}
          </div>
          <button
            disabled={selectedAttractions.length === 0}
            onClick={() => setStep(1)}
            style={{
              marginTop: 24, background: selectedAttractions.length > 0 ? "#2563eb" : "#d1d5db",
              color: "white", padding: "12px 32px", borderRadius: 12, fontWeight: "bold",
              border: "none", cursor: selectedAttractions.length > 0 ? "pointer" : "not-allowed",
              fontSize: 16,
            }}
          >下一步</button>
        </div>
      )}

      {/* Step 2: Parameters */}
      {step === 1 && (
        <div>
          <h2 style={{ fontSize: 20, fontWeight: "bold", marginBottom: 16 }}>设定出行参数</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 400 }}>
            <FormField label="游玩天数">
              <input type="number" min={1} max={14} value={params.days}
                onChange={(e) => setParams({ ...params, days: parseInt(e.target.value) || 1 })}
                style={inputStyle} />
            </FormField>
            <FormField label="人数">
              <input type="number" min={1} max={20} value={params.people}
                onChange={(e) => setParams({ ...params, people: parseInt(e.target.value) || 1 })}
                style={inputStyle} />
            </FormField>
            <FormField label="出行方式">
              <select value={params.transport}
                onChange={(e) => setParams({ ...params, transport: e.target.value })}
                style={inputStyle}>
                <option>地铁+网约车</option><option>租车自驾</option>
                <option>包车</option><option>公交+步行</option>
              </select>
            </FormField>
            <FormField label="人均预算(元)">
              <input type="number" min={500} max={50000} step={500} value={params.budget}
                onChange={(e) => setParams({ ...params, budget: parseInt(e.target.value) || 500 })}
                style={inputStyle} />
            </FormField>
            <FormField label="旅行风格">
              <select value={params.style}
                onChange={(e) => setParams({ ...params, style: e.target.value })}
                style={inputStyle}>
                <option>美食</option><option>文化</option><option>户外</option>
                <option>休闲</option><option>摄影</option>
              </select>
            </FormField>
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
            <button onClick={() => setStep(0)} style={{
              background: "#e5e7eb", padding: "12px 32px", borderRadius: 12,
              fontWeight: "bold", border: "none", cursor: "pointer", fontSize: 16,
            }}>上一步</button>
            <button onClick={() => setStep(2)} style={{
              background: "#2563eb", color: "white", padding: "12px 32px",
              borderRadius: 12, fontWeight: "bold", border: "none", cursor: "pointer", fontSize: 16,
            }}>开始 AI 生成</button>
          </div>
        </div>
      )}

      {/* Step 3: AI Generation */}
      {step === 2 && (
        <div>
          <h2 style={{ fontSize: 20, fontWeight: "bold", marginBottom: 16 }}>AI 正在生成攻略...</h2>
          {!generating && (
            <button onClick={handleGenerate} style={{
              background: "#2563eb", color: "white", padding: "16px 40px",
              borderRadius: 12, fontWeight: "bold", border: "none", cursor: "pointer", fontSize: 18,
            }}>确认生成</button>
          )}
          {generating && (
            <div style={{ background: "#f9fafb", borderRadius: 12, padding: 24, maxHeight: 400, overflowY: "auto" }}>
              <pre style={{ whiteSpace: "pre-wrap", fontSize: 14, lineHeight: 1.6, margin: 0 }}>
                {result || "正在连接 AI..."}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 14, fontWeight: "bold", marginBottom: 4 }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 12px", border: "1px solid #d1d5db",
  borderRadius: 8, fontSize: 15, boxSizing: "border-box",
};
