const STEPS = [
  { num: 1, label: 'Setup' },
  { num: 2, label: 'Checklist' },
  { num: 3, label: 'Review & Export' },
];

export default function Stepper({ current, onJump }) {
  return (
    <div className="stepper" role="tablist" aria-label="Ticket progress">
      {STEPS.map((s, i) => (
        <div key={s.num} style={{ display: 'flex', alignItems: 'center' }}>
          <button
            type="button"
            className={`step ${current === s.num ? 'active' : ''} ${current > s.num ? 'done' : ''}`}
            onClick={() => onJump && s.num < current && onJump(s.num)}
            style={{ background: 'none', border: 'none', cursor: onJump && s.num < current ? 'pointer' : 'default' }}
            aria-selected={current === s.num}
            role="tab"
          >
            <span className="step-num">{current > s.num ? '✓' : s.num}</span>
            {s.label}
          </button>
          {i < STEPS.length - 1 && (
            <span className={`step-connector ${current > s.num ? 'done' : ''}`} />
          )}
        </div>
      ))}
    </div>
  );
}
