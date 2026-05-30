import GuideWizard from "@/components/guides/GuideWizard";

export default function NewGuidePage() {
  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 16px" }}>
      <h1 style={{ fontSize: 30, fontWeight: "bold", marginBottom: 32 }}>创建 AI 攻略</h1>
      <GuideWizard />
    </div>
  );
}
