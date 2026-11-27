import './landing.css';

export function Landing() {
  return (
    <section className="intro">
      <div className="intro-grid">
        <div>
          <h1>Plan every shift in one calendar</h1>
          <p>Rotas, swaps and overtime for small care homes.</p>
        </div>
        <RotaScreenshot />
      </div>
    </section>
  );
}
