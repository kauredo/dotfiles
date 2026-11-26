import { CalendarDaysIcon, CheckIcon, ReceiptPercentIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

const features = [
  { icon: CalendarDaysIcon, title: "One calendar for every room", body: "Rooms, clinicians and equipment share a single week view." },
  { icon: ReceiptPercentIcon, title: "Invoices from the appointment", body: "Mark a session done and the invoice is drafted with the right insurer code." },
];

const plans = [
  { id: "solo", name: "Solo", price: "€19 per month", note: "One clinician." },
  { id: "practice", name: "Practice", price: "€49 per month", note: "Recommended for teams of three to ten." },
  { id: "group", name: "Group", price: "€99 per month", note: "Several locations." },
];

export default function Landing() {
  const { t } = useTranslation();
  return (
    <main className="bg-white text-slate-900">
      <section className="mx-auto max-w-5xl px-6 py-24">
        <p className="text-sm font-medium text-slate-600">For physiotherapy clinics</p>
        <h1 className="text-5xl font-semibold tracking-tight">
          Clinic scheduling that fits the ten minutes
          <br />
          between two patients.
        </h1>
        <p className="mt-6 text-lg text-slate-600">Book, reschedule and invoice from one calendar.</p>
        <div className="mt-8 flex gap-3">
          <Button className="rounded-md bg-primary text-white">Book a call</Button>
          <a href="/docs/setup" className="rounded-md border border-slate-300 px-4 py-2">
            Read the setup guide
          </a>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-16">
        <h2 className="text-3xl font-semibold">What changes on the first Monday</h2>
        <ul className="mt-8 grid gap-8 md:grid-cols-2">
          {features.map((f) => (
            <li key={f.title} className="flex gap-4">
              <f.icon className="size-6 text-slate-700" aria-hidden="true" />
              <div>
                <h3 className="font-medium">{f.title}</h3>
                <p className="text-slate-600">{f.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-16">
        <h2 className="text-3xl font-semibold">Three plans, priced per clinician</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <div className="rounded-md border border-slate-200 bg-white p-6">
            <h3 className="font-medium">Solo</h3>
            <p className="mt-2 text-2xl">€19 per month</p>
            <p className="text-sm text-slate-600">One clinician.</p>
            <Button variant="outline" className="mt-6 rounded-md">Choose Solo</Button>
          </div>
          <div className="rounded-md border border-slate-200 bg-white p-6">
            <h3 className="font-medium">Practice</h3>
            <p className="mt-2 text-2xl">€49 per month</p>
            <p className="text-sm font-medium text-slate-700">Recommended for teams of three to ten.</p>
            <Button className="mt-6 rounded-md">Choose Practice</Button>
          </div>
          <div className="rounded-md border border-slate-200 bg-white p-6">
            <h3 className="font-medium">Group</h3>
            <p className="mt-2 text-2xl">€99 per month</p>
            <p className="text-sm text-slate-600">Several locations.</p>
            <Button variant="outline" className="mt-6 rounded-md">Choose Group</Button>
          </div>
        </div>
        <ul className="mt-6 text-sm text-slate-600">
          {plans.map((p) => (
            <li key={p.id} className="flex items-center gap-2">
              <CheckIcon className="size-4" aria-hidden="true" />
              {p.name}: {p.note}
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-16">
        <h2 className="text-2xl font-semibold">{t("closing.title")}</h2>
        <Button className="mt-6 rounded-md">{t("closing.cta")}</Button>
      </section>
    </main>
  );
}
