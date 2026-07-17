import { useMemo, useState } from 'react';
import { MODULES, calcProgress } from '../utils/ticketUtils';

export default function ChecklistStep({ ticket, onToggleItem, onSetRemark, onNext, onBack }) {
  const [query, setQuery] = useState('');
  const [openRemarks, setOpenRemarks] = useState({});

  const modules = useMemo(
    () => MODULES.filter((m) => ticket.selectedModules.includes(m.id)),
    [ticket.selectedModules]
  );

  const progress = calcProgress(ticket);
  const q = query.trim().toLowerCase();

  const toggleRemarkOpen = (itemId) =>
    setOpenRemarks((prev) => ({ ...prev, [itemId]: !prev[itemId] }));

  return (
    <div>
      <p className="eyebrow">Step 2 · Checklist</p>
      <div className="checklist-toolbar">
        <h2 style={{ fontSize: 20, fontFamily: 'var(--sans)', textTransform: 'none', letterSpacing: 0, color: 'var(--ink)', fontWeight: 700, margin: 0 }}>
          Select the checks relevant to this ticket
        </h2>
        <input
          className="search-input"
          placeholder="Filter checks…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {modules.map((mod) => {
        const modItemIds = mod.categories.flatMap((c) => c.items.map((i) => i.id));
        const modSelectedCount = modItemIds.filter((id) => ticket.itemStates?.[id]?.selected).length;

        const visibleCategories = mod.categories
          .map((cat) => ({
            ...cat,
            items: cat.items.filter((it) => !q || it.text.toLowerCase().includes(q)),
          }))
          .filter((cat) => cat.items.length > 0);

        if (q && visibleCategories.length === 0) return null;

        return (
          <div className="module-block" key={mod.id}>
            <div className="module-block-head">
              <h3>{mod.name}</h3>
              <span className="module-tally">{modSelectedCount}/{modItemIds.length} selected</span>
            </div>

            {visibleCategories.map((cat) => (
              <div className="category-block" key={cat.id}>
                <p className="category-title">{cat.name}</p>
                {cat.items.map((item) => {
                  const state = ticket.itemStates?.[item.id] || {};
                  const remarkOpen = openRemarks[item.id] || (state.remark && state.remark.length > 0);
                  return (
                    <div className={`check-row ${state.selected ? 'selected' : ''}`} key={item.id}>
                      <div className="check-box-wrap">
                        <div
                          role="checkbox"
                          aria-checked={!!state.selected}
                          tabIndex={0}
                          className={`check-box ${state.selected ? 'checked' : ''}`}
                          onClick={() => onToggleItem(item.id)}
                          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onToggleItem(item.id))}
                        >
                          {state.selected ? '✓' : ''}
                        </div>
                      </div>
                      <div className="check-content">
                        <label className="check-label" onClick={() => onToggleItem(item.id)}>
                          <span className="check-id">{item.id}</span>
                          {item.text}
                        </label>
                        {state.selected && (
                          <>
                            {!remarkOpen && (
                              <button type="button" className="remark-toggle" onClick={() => toggleRemarkOpen(item.id)}>
                                + add remark
                              </button>
                            )}
                            {remarkOpen && (
                              <div className="remark-box">
                                <textarea
                                  placeholder="Optional remark for this check…"
                                  value={state.remark || ''}
                                  onChange={(e) => onSetRemark(item.id, e.target.value)}
                                />
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        );
      })}

      <div className="step-footer">
        <button className="btn btn-secondary" onClick={onBack}>← Back to modules</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span className="step-footer-info">{progress.selected}/{progress.total} checks selected ({progress.percent}%)</span>
          <button className="btn btn-primary" disabled={progress.selected === 0} onClick={onNext}>
            Continue to review →
          </button>
        </div>
      </div>
    </div>
  );
}
