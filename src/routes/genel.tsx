import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Page } from "@/components/Nav";
import { GENEL_DERSLER, net, uid, useLocal } from "@/lib/store";

export type GenelDeneme = { id: string; ad: string; tarih: string; sonuc: Record<string, { d: number; y: number }> };

export const Route = createFileRoute("/genel")({
  head: () => ({ meta: [
    { title: "Genel Deneme Takibi | EKPSS Takip" },
    { name: "description", content: "EKPSS 60 soruluk genel denemelerde ders bazında doğru, yanlış ve net takibi." },
    { property: "og:title", content: "Genel Deneme Takibi | EKPSS Takip" },
    { property: "og:description", content: "EKPSS genel deneme net hesaplama." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: Genel,
});

const empty = () => Object.fromEntries(GENEL_DERSLER.map((d) => [d.key, { d: 0, y: 0 }]));

function Genel() {
  const [list, setList] = useLocal<GenelDeneme[]>("genel", []);
  const [ad, setAd] = useState("");
  const [s, setS] = useState<Record<string, { d: number; y: number }>>(empty());

  const top = (r: GenelDeneme["sonuc"]) => GENEL_DERSLER.reduce((a, d) => {
    const v = r[d.key] ?? { d: 0, y: 0 };
    return { d: a.d + v.d, y: a.y + v.y };
  }, { d: 0, y: 0 });
  const t = top(s);

  const set = (k: string, f: "d" | "y", v: number, max: number) => {
    const cur = s[k] ?? { d: 0, y: 0 };
    const other = f === "d" ? cur.y : cur.d;
    const val = Math.max(0, Math.min(v || 0, max - other));
    setS({ ...s, [k]: { ...cur, [f]: val } });
  };

  const save = () => {
    setList([{ id: uid(), ad: ad || `Deneme ${list.length + 1}`, tarih: new Date().toLocaleDateString("tr-TR"), sonuc: s }, ...list]);
    setAd(""); setS(empty());
  };

  return (
    <Page title="Genel Deneme" sub="60 soru • 4 yanlış 1 doğruyu götürür • Net otomatik hesaplanır">
      <div className="card-glow rounded-2xl p-6">
        <input className="field mb-4 w-full" placeholder="Deneme adı (ör. Yayın X - 3)" value={ad} onChange={(e) => setAd(e.target.value)} />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-muted-foreground"><tr className="text-left">
              <th className="py-2">Ders</th><th>Soru</th><th>Doğru</th><th>Yanlış</th><th>Boş</th><th>Net</th></tr></thead>
            <tbody>
              {GENEL_DERSLER.map((d, i) => {
                const v = s[d.key] ?? { d: 0, y: 0 };
                return (
                  <tr key={d.key} className="border-t border-border">
                    <td className="py-2">
                      {(i === 0 || GENEL_DERSLER[i - 1]?.grup !== d.grup) && <div className="text-xs text-primary">{d.grup}</div>}
                      {d.label}
                    </td>
                    <td>{d.soru}</td>
                    <td><input type="number" min={0} className="field w-20" value={v.d} onChange={(e) => set(d.key, "d", +e.target.value, d.soru)} /></td>
                    <td><input type="number" min={0} className="field w-20" value={v.y} onChange={(e) => set(d.key, "y", +e.target.value, d.soru)} /></td>
                    <td>{d.soru - v.d - v.y}</td>
                    <td className="font-semibold text-primary">{net(v.d, v.y)}</td>
                  </tr>
                );
              })}
              <tr className="border-t-2 border-primary/40 font-bold">
                <td className="py-3">Toplam</td><td>60</td><td>{t.d}</td><td>{t.y}</td><td>{60 - t.d - t.y}</td>
                <td className="text-2xl text-primary">{net(t.d, t.y)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <button className="btn-primary mt-4" onClick={save}>Denemeyi Kaydet</button>
      </div>

      <h2 className="mt-10 font-display text-2xl font-bold">Geçmiş Denemeler</h2>
      <div className="mt-4 grid gap-3">
        {list.length === 0 && <p className="text-muted-foreground">Henüz deneme yok.</p>}
        {list.map((g) => {
          const tt = top(g.sonuc);
          return (
            <div key={g.id} className="card-glow rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div><div className="font-semibold">{g.ad}</div><div className="text-xs text-muted-foreground">{g.tarih}</div></div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">D {tt.d} • Y {tt.y} • B {60 - tt.d - tt.y}</span>
                  <span className="text-2xl font-bold text-primary">{net(tt.d, tt.y)}</span>
                  <button className="text-xs text-destructive" onClick={() => setList(list.filter((x) => x.id !== g.id))}>Sil</button>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                {GENEL_DERSLER.map((d) => { const v = g.sonuc[d.key] ?? { d: 0, y: 0 }; return (
                  <span key={d.key} className="rounded-full bg-secondary px-2 py-1">{d.label}: {net(v.d, v.y)}</span>); })}
              </div>
            </div>
          );
        })}
      </div>
    </Page>
  );
}
