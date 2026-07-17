import { MODULES } from '../utils/ticketUtils';

export default function ModuleSelector({ selectedModules, onToggleModule, onNext, onBackHome }) {
  const totalItems = (mod) =>
    mod.categories.reduce((sum, c) => sum + c.items.length, 0);

  return (
    <div>
      <p className="eyebrow">Step 1 · Setup</p>
      <div className="section-row" style={{ marginTop: 0 }}>
        <h2 style={{ fontSize: 20, fontFamily: 'var(--sans)', textTransform: 'none', letterSpacing: 0, color: 'var(--ink)', fontWeight: 700 }}>
          Which testing modules apply to this ticket?
        </h2>
      </div>
      <p style={{ color: 'var(--ink-soft)', fontSize: 13.5, marginTop: -8, marginBottom: 20 }}>
        Select every area relevant to the change. You can adjust this later.
      </p>

      <div className="module-grid">
        {MODULES.map((mod) => {
          const active = selectedModules.includes(mod.id);
          return (
            <button
              type="button"
              key={mod.id}
              className={`module-card ${active ? 'selected' : ''}`}
              onClick={() => onToggleModule(mod.id)}
              aria-pressed={active}
            >
              <div className="module-card-top">
                <h4>{mod.name}</h4>
                <span className="module-check">{active ? '✓' : ''}</span>
              </div>
              <p>{mod.description}</p>
              <span className="module-count">{totalItems(mod)} checks available</span>
            </button>
          );
        })}
      </div>

      <div className="step-footer">
        <button className="btn btn-secondary" onClick={onBackHome}>Back to tickets</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span className="step-footer-info">{selectedModules.length} module(s) selected</span>
          <button className="btn btn-primary" disabled={selectedModules.length === 0} onClick={onNext}>
            Continue to checklist →
          </button>
        </div>
      </div>
    </div>
  );
}
