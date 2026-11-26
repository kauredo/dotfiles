import { Button } from "@/components/ui/button";

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="text-center">
      <p className="text-xs font-semibold uppercase tracking-widest text-orange-600">{eyebrow}</p>
      <h2 className="font-serif text-4xl">{title}</h2>
    </div>
  );
}

const features = [
  { icon: "🚀", title: "Growth", body: "Ship faster." },
  { icon: "💡", title: "Clarity", body: "See everything." },
  { icon: "🎯", title: "Focus", body: "Do what matters." },
];

export default function Landing() {
  return (
    <main className="bg-[#F4F1EA]">
      <section className="bg-gradient-to-b from-violet-100 via-violet-50 to-white">
        <p className="text-sm">★★★★★ Trusted by 2,500+ teams</p>
        <span className="text-xs uppercase tracking-widest text-orange-600">The platform</span>
        <h1 className="font-serif text-6xl">Less friction. More growth.</h1>
        <div className="flex gap-3">
          <Button className="rounded-full bg-indigo-600 hover:bg-indigo-700">Start free trial</Button>
          <Button variant="outline" className="rounded-full">Learn more →</Button>
        </div>
      </section>
      <section>
        <SectionHeading eyebrow="Key features" title="A better way to work. A simpler way to grow." />
        <div className="grid grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="rounded-2xl bg-white p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-2xl">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.body}</p>
            </div>
          ))}
        </div>
      </section>
      <section>
        <SectionHeading eyebrow="Pricing" title="Simple pricing. Powerful results." />
        <div className="grid grid-cols-3 gap-6">
          <div className="rounded-2xl bg-white p-6"><h3>Starter</h3><p>$9</p></div>
          <div className="rounded-2xl bg-white p-6"><h3>Team</h3><p>$29</p></div>
          <div className="rounded-2xl bg-indigo-600 p-6 text-white"><span className="rounded-full bg-white/20 px-3 text-xs">Most popular</span><h3>Business</h3><p>$79</p></div>
        </div>
      </section>
    </main>
  );
}
