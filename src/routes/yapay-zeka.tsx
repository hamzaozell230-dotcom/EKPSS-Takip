import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Page } from "@/components/Nav";
import { useLocal } from "@/lib/store";

export const Route = createFileRoute("/yapay-zeka")({
  head: () => ({ meta: [
    { title: "Yapay Zeka | EKPSS Takip" },
    { name: "description", content: "Kendi API anahtarınla EKPSS çalışma asistanına soru sor." },
    { property: "og:title", content: "Yapay Zeka | EKPSS Takip" },
    { property: "og:description", content: "EKPSS için yapay zeka çalışma asistanı." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: YapayZeka,
});

type Msg = { role: "user" | "assistant"; content: string };
type Ayar = { key: string; base: string; model: string };

function YapayZeka() {
  const [ayar, setAyar] = useLocal<Ayar>("aiAyar", { key: "", base: "https://api.openai.com/v1", model: "gpt-4o-mini" });
  const [msgs, setMsgs] = useLocal<Msg[]>("aiSohbet", []);
  const [taslak, setTaslak] = useState<Ayar | null>(null);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const a = taslak ?? ayar;

  const gonder = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = text.trim();
    if (!q || busy) return;
    if (!ayar.key) { setErr("Önce API anahtarını kaydet."); return; }
    const yeni = [...msgs, { role: "user" as const, content: q }];
    setMsgs(yeni); setText(""); setBusy(true); setErr("");
    try {
      const r = await fetch(`${ayar.base.replace(/\/$/, "")}/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${ayar.key}` },
        body: JSON.stringify({ model: ayar.model, messages: [{ role: "system", content: "Sen EKPSS sınavına hazırlanan öğrencilere yardım eden, Türkçe konuşan, sabırlı ve motive edici bir öğretmensin." }, ...yeni] }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error?.message ?? `Hata ${r.status}`);
      setMsgs([...yeni, { role: "assistant", content: j.choices?.[0]?.message?.content ?? "" }]);
    } catch (e) { setErr(e instanceof Error ? e.message : "Bir hata oluştu"); }
    setBusy(false);
  };

  return (
    <Page title="Yapay Zeka" sub="API anahtarını kaydet, EKPSS asistanına soru sor">
      <div className="grid gap-5 md:grid-cols-3">
        <form className="card-glow space-y-3 rounded-2xl p-5" onSubmit={(e) => { e.preventDefault(); setAyar(a); setTaslak(null); }}>
          <h3 className="font-display text-lg font-bold">API Ayarları</h3>
          <label className="block text-xs text-muted-foreground">API Anahtarı
            <input className="field mt-1 w-full" type="password" value={a.key} onChange={(e) => setTaslak({ ...a, key: e.target.value })} placeholder="sk-..." /></label>
          <label className="block text-xs text-muted-foreground">API Adresi (OpenAI uyumlu)
            <input className="field mt-1 w-full" value={a.base} onChange={(e) => setTaslak({ ...a, base: e.target.value })} /></label>
          <label className="block text-xs text-muted-foreground">Model
            <input className="field mt-1 w-full" value={a.model} onChange={(e) => setTaslak({ ...a, model: e.target.value })} /></label>
          <button className="btn-primary w-full">{ayar.key && !taslak ? "Kaydedildi ✓" : "Kaydet"}</button>
          <p className="text-xs text-muted-foreground">Anahtar sadece bu tarayıcıda saklanır.</p>
        </form>
        <div className="card-glow flex min-h-[60vh] flex-col rounded-2xl p-5 md:col-span-2">
          <div className="flex-1 space-y-3 overflow-y-auto">
            {msgs.length === 0 && <p className="text-muted-foreground">Örn: "Paragrafta anlam sorularını nasıl çözerim?"</p>}
            {msgs.map((m, i) => (
              <div key={i} className={m.role === "user" ? "ml-auto max-w-[80%] rounded-2xl bg-primary px-4 py-2 text-primary-foreground" : "whitespace-pre-wrap"}>{m.content}</div>
            ))}
            {busy && <p className="text-muted-foreground">Yazıyor...</p>}
            {err && <p className="text-destructive">{err}</p>}
          </div>
          <form onSubmit={gonder} className="mt-4 flex gap-2">
            <input className="field flex-1" value={text} onChange={(e) => setText(e.target.value)} placeholder="Sorunu yaz..." />
            <button className="btn-primary" disabled={busy}>Gönder</button>
            {msgs.length > 0 && <button type="button" className="rounded-lg bg-secondary px-3 text-sm" onClick={() => setMsgs([])}>Temizle</button>}
          </form>
        </div>
      </div>
    </Page>
  );
}
