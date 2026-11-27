import './page.css';

export function Page() {
  return (
    <main>
      <section className="hero">
        <h1 className="text-6xl font-semibold">Plan every shift in one calendar</h1>
        <p className="text-xl">Rotas, swaps and overtime for small care homes.</p>
      </section>
      <section>
        <h2 className="text-2xl font-semibold">Swaps without the group chat</h2>
        <h3 className="text-lg">Staff trade shifts in two taps</h3>
        <p className="text-base">The manager approves from the same screen.</p>
        <p className="text-sm">Works on any phone.</p>
        <p className="text-xs">Prices exclude VAT.</p>
        <p className="note">Overtime rules follow your contract.</p>
        <p className="aside">Export to payroll every Friday.</p>
      </section>
    </main>
  );
}
