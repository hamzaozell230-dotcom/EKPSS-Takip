import { createFileRoute } from "@tanstack/react-router";
import { Page } from "@/components/Nav";
import { brandIconUrl } from "@/lib/brand";

export const Route = createFileRoute("/hakkinda")({
  head: () => ({ meta: [
    { title: "Hakkında | EKPSS Takip" },
    { name: "description", content: "EKPSS Takip hakkında ve geliştiricisi Hamza Tarık Öztürk." },
    { property: "og:title", content: "Hakkında | EKPSS Takip" },
    { property: "og:description", content: "EKPSS Takip — geliştirici Hamza Tarık Öztürk." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: About,
});

function About() {
  return <Page title="Hakkında">
    <section className="flex flex-col items-center gap-6 py-8 text-center">
      <img src={brandIconUrl()} alt="EKPSS Takip uygulama simgesi" width={192} height={192} className="h-48 w-48 rounded-lg" />
      <h2 className="font-display text-3xl font-bold">EKPSS Takip</h2>
      <div className="border-t border-border pt-6">
        <p className="text-sm text-muted-foreground">Geliştirici</p>
        <p className="mt-2 font-display text-2xl font-bold text-primary">Hamza Tarık Öztürk</p>
      </div>
    </section>
  </Page>;
}