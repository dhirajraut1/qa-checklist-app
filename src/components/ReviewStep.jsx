import { useMemo } from 'react';
import { MODULES, calcProgress } from '../utils/ticketUtils';
import { downloadMarkdown } from '../utils/exportMarkdown';
import { downloadPdf } from '../utils/exportPdf';

// Deterministic pseudo-barcode purely decorative, derived from the ticket id
function Barcode({ seed }) {
  const bars = useMemo(() => {
    const str = seed || 'QA-MANIFEST';
    const out = [];
    for (let i = 0; i < 28; i++) {
      const code = str.charCodeAt(i % str.length) + i * 7;
      out.push(6 + (code % 28));
    }
    return out;
  }, [seed]);
  return (
    <div className="manifest-barcode" aria-hidden="true">
      {bars.map((h, i) => (
        <span key={i} style={{ height: `${h}px` }} />
      ))}
    </div>
  );
}

export default function ReviewStep({ ticket, onSetOverallRemarks, onBack, testerNameFallback }) {
  const progress = calcProgress(ticket);
  const modules = MODULES.filter((m) => ticket.selectedModules.includes(m.id));

  return (
    <div>
      <p className="eyebrow">Step 3 · Review &amp; Export</p>

      <div className="manifest-stub">
        <div className="manifest-top">
          <div>
            <p className="manifest-badge">Test Manifest</p>
            <div className="manifest-ticket">{ticket.ticketId || 'UNTITLED'}</div>
            <p className="manifest-title">{ticket.ticketTitle || 'Untitled ticket'}</p>
          </div>
          <Barcode seed={ticket.ticketId} />
        </div>

        <div className="manifest-stats">
          <div>
            <div className="manifest-stat-label">Tester</div>
            <div className="manifest-stat-value" style={{ fontSize: 14 }}>{ticket.testerName || testerNameFallback || '—'}</div>
          </div>
          <div>
            <div className="manifest-stat-label">Modules</div>
            <div className="manifest-stat-value" style={{ fontSize: 14 }}>{modules.length}</div>
          </div>
          <div>
            <div className="manifest-stat-label">Checks selected</div>
            <div className="manifest-stat-value">{progress.selected}/{progress.total}</div>
          </div>
          <div>
            <div className="manifest-stat-label">Coverage</div>
            <div className="manifest-stat-value">{progress.percent}%</div>
          </div>
        </div>
      </div>

      <div className="section-row" style={{ marginTop: 0 }}>
        <h2>Selected checks by module</h2>
      </div>

      {modules.length === 0 && <div className="empty-state">No modules selected.</div>}

      <div className="review-summary-list">
        {modules.map((mod) => {
          const items = mod.categories.flatMap((c) => c.items).filter((i) => ticket.itemStates?.[i.id]?.selected);
          if (items.length === 0) return null;
          return (
            <div className="review-module" key={mod.id}>
              <h4>{mod.name} <span className="module-chip">{items.length} checks</span></h4>
              {items.map((item) => {
                const state = ticket.itemStates?.[item.id] || {};
                return (
                  <div className="review-item" key={item.id}>
                    <span className="tick">✓</span>
                    <div>
                      {item.text}
                      {state.remark?.trim() && <span className="review-item-remark">{state.remark.trim()}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      <div className="textarea-card">
        <label htmlFor="overallRemarks">Overall remarks for this ticket</label>
        <textarea
          id="overallRemarks"
          placeholder="Summarize risk areas, blockers, or anything the reviewer should know…"
          value={ticket.overallRemarks || ''}
          onChange={(e) => onSetOverallRemarks(e.target.value)}
        />
      </div>

      <div className="step-footer" style={{ flexWrap: 'wrap', gap: 14 }}>
        <button className="btn btn-secondary" onClick={onBack}>← Back to checklist</button>
        <div className="export-row">
          <button className="btn btn-secondary" onClick={() => downloadMarkdown(ticket)}>
            Download Markdown
          </button>
          <button className="btn btn-primary" onClick={() => downloadPdf(ticket)}>
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}
