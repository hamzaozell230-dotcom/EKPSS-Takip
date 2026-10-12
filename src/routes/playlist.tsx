import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Page } from "@/components/Nav";
import { uid, useLocal } from "@/lib/store";

type Video = { id: string; ad: string; izlendi: boolean };
export type Playlist = { id: string; hoca: string; ders: string; url: string; videolar: Video[] };

export const Route = createFileRoute("/playlist")({
  head: () => ({ meta: [
    { title: "Hoca Playlistleri | EKPSS Takip" },
    { name: "description", content: "İzlediğin hocaların playlistlerini ekle, video ilerlemeni takip et." },
    { property: "og:title", content: "Hoca Playlistleri | EKPSS Takip" },
    { property: "og:description", content: "Playlist ilerleme takibi." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: PlaylistPage,
});

const listId = (url: string) => url.match(/[?&]list=([\w-]+)/)?.[1];

function PlaylistPage() {
  const [lists, setLists] = useLocal<Playlist[]>("playlists", []);
  const [f, setF] = useState({ hoca: "", ders: "", url: "", videolar: "", adet: 0 });
  const [open, setOpen] = useState<string | null>(null);
  const [vid, setVid] = useState<Record<string, string>>({});

  const add = () => {
    if (!f.hoca.trim()) return;
    let videolar = f.videolar.split("\n").map((s) => s.trim()).filter(Boolean);
    if (!videolar.length && f.adet > 0) videolar = Array.from({ length: f.adet }, (_, i) => `Ders ${i + 1}`);
    setLists([...lists, { id: uid(), hoca: f.hoca, ders: f.ders, url: f.url, videolar: videolar.map((ad) => ({ id: uid(), ad, izlendi: false })) }]);
    setF({ hoca: "", ders: "", url: "", videolar: "", adet: 0 });
  };
  const upd = (id: string, fn: (p: Playlist) => Playlist) => setLists(lists.map((p) => (p.id === id ? fn(p) : p)));

  const toplamVid = lists.flatMap((p) => p.videolar);
  const izlenen = toplamVid.filter((v) => v.izlendi).length;
  const kalan = toplamVid.length - izlenen;
  const ustPct = toplamVid.length ? Math.round((izlenen / toplamVid.length) * 100) : 0;
  const kalanPct = toplamVid.length ? Math.round((kalan / toplamVid.length) * 100) : 0;

  return (
    <Page title="Hoca Playlistleri" sub="Playlist ekle, videoları izledikçe işaretle">
      <div className="card-glow grid gap-3 rounded-2xl p-6 md:grid-cols-2">
        <input className="field" placeholder="Hoca adı" value={f.hoca} onChange={(e) => setF({ ...f, hoca: e.target.value })} />
        <input className="field" placeholder="Ders (ör. Matematik)" value={f.ders} onChange={(e) => setF({ ...f, ders: e.target.value })} />
        <input className="field md:col-span-2" placeholder="YouTube playlist linki" value={f.url} onChange={(e) => setF({ ...f, url: e.target.value })} />
        <textarea className="field min-h-24" placeholder={"Video başlıkları (her satıra bir tane)"} value={f.videolar} onChange={(e) => setF({ ...f, videolar: e.target.value })} />
        <label className="text-xs text-muted-foreground">veya sadece video sayısı
          <input type="number" min={0} className="field mt-1 w-full" value={f.adet} onChange={(e) => setF({ ...f, adet: Math.max(0, +e.target.value || 0) })} />
        </label>
        <button className="btn-primary md:col-span-2" onClick={add}>Playlist Ekle</button>
      </div>

      {lists.length > 0 && (
        <div className="card-glow mb-6 rounded-2xl p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="font-display text-lg font-bold">Tüm Playlistler</div>
              <div className="mt-1 text-sm text-muted-foreground">{lists.length} playlist • {toplamVid.length} video</div>
            </div>
            <div className="text-right">
              <div className="font-display text-3xl font-bold text-primary">%{ustPct}</div>
              <div className="text-xs text-muted-foreground">izlendi</div>
            </div>
          </div>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-secondary"><div className="h-3 rounded-full bg-primary transition-all" style={{ width: `${ustPct}%` }} /></div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-secondary/60 p-4"><div className="text-xs text-muted-foreground">İzlenen</div><div className="font-display text-2xl font-bold text-primary">{izlenen} <span className="text-sm font-normal text-muted-foreground">(%{ustPct})</span></div></div>
            <div className="rounded-xl bg-secondary/60 p-4"><div className="text-xs text-muted-foreground">Kalan</div><div className="font-display text-2xl font-bold">{kalan} <span className="text-sm font-normal text-muted-foreground">(%{kalanPct})</span></div></div>
            <div className="rounded-xl bg-secondary/60 p-4"><div className="text-xs text-muted-foreground">Toplam</div><div className="font-display text-2xl font-bold">{toplamVid.length}</div></div>
          </div>
        </div>
      )}

      <div className="mt-8 grid gap-4">
        {lists.length === 0 && <p className="text-muted-foreground">Henüz playlist yok.</p>}
        {lists.map((p) => {
          const c = p.videolar.filter((v) => v.izlendi).length;
          const k = p.videolar.length - c;
          const pct = p.videolar.length ? Math.round((c / p.videolar.length) * 100) : 0;
          const kpct = p.videolar.length ? 100 - pct : 0;
          const lid = listId(p.url);
          return (
            <div key={p.id} className="card-glow rounded-2xl p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="font-display text-xl font-bold">{p.hoca}</div>
                  <div className="text-sm text-muted-foreground">{p.ders} {p.url && <a className="ml-2 text-primary underline" href={p.url} target="_blank" rel="noreferrer">YouTube'da aç</a>}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right text-sm leading-tight">
                    <div className="text-primary"><span className="font-bold">{c}</span> izlendi <span className="text-muted-foreground">(%{pct})</span></div>
                    <div className="text-muted-foreground"><span className="font-bold text-foreground">{k}</span> kaldı <span>(%{kpct})</span></div>
                  </div>
                  <button className="text-sm underline" onClick={() => setOpen(open === p.id ? null : p.id)}>{open === p.id ? "Kapat" : "Detay"}</button>
                  <button className="text-xs text-destructive" onClick={() => setLists(lists.filter((x) => x.id !== p.id))}>Sil</button>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <div className="h-2 flex-1 rounded-full bg-secondary"><div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} /></div>
                <span className="text-xs text-muted-foreground">{c}/{p.videolar.length}</span>
              </div>
              {open === p.id && (
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {lid ? <iframe className="aspect-video w-full rounded-xl" src={`https://www.youtube.com/embed/videoseries?list=${lid}`} allowFullScreen title={p.hoca} /> : <div className="text-sm text-muted-foreground">Önizleme için playlist linki ekle.</div>}
                  <div>
                    <ul className="max-h-80 space-y-1.5 overflow-y-auto pr-2">
                      {p.videolar.map((v, i) => (
                        <li key={v.id} className="flex items-center gap-2 text-sm">
                          <input type="checkbox" className="accent-primary size-4" checked={v.izlendi} onChange={() => upd(p.id, (pp) => ({ ...pp, videolar: pp.videolar.map((x) => x.id === v.id ? { ...x, izlendi: !x.izlendi } : x) }))} />
                          <span className={v.izlendi ? "text-muted-foreground line-through" : ""}>{i + 1}. {v.ad}</span>
                          <button className="ml-auto text-xs text-destructive" onClick={() => upd(p.id, (pp) => ({ ...pp, videolar: pp.videolar.filter((x) => x.id !== v.id) }))}>×</button>
                        </li>
                      ))}
                    </ul>
                    <form className="mt-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); const t = (vid[p.id] ?? "").trim(); if (!t) return; upd(p.id, (pp) => ({ ...pp, videolar: [...pp.videolar, { id: uid(), ad: t, izlendi: false }] })); setVid({ ...vid, [p.id]: "" }); }}>
                      <input className="field flex-1" placeholder="Video ekle..." value={vid[p.id] ?? ""} onChange={(e) => setVid({ ...vid, [p.id]: e.target.value })} />
                      <button className="btn-primary">Ekle</button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Page>
  );
}
