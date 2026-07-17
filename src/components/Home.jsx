import { useState } from 'react';
import { createTicket, calcProgress, formatDate, MODULES } from '../utils/ticketUtils';

function NewTicketModal({ onClose, onCreate, defaultTester }) {
  const [ticketId, setTicketId] = useState('');
  const [ticketTitle, setTicketTitle] = useState('');
  const [testerName, setTesterName] = useState(defaultTester || '');
  const canSubmit = ticketId.trim().length > 0 && testerName.trim().length > 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    const ticket = createTicket({ ticketId, ticketTitle, testerName });
    onCreate(ticket);
  };

  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form className="modal" onSubmit={handleSubmit}>
        <h3>New test ticket</h3>
        <p className="modal-sub">Set up the basics — you'll pick modules next.</p>

        <div className="field">
          <label htmlFor="ticketId">JIRA / Ticket ID</label>
          <input
            id="ticketId"
            autoFocus
            placeholder="e.g. PROJ-1234"
            value={ticketId}
            onChange={(e) => setTicketId(e.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="ticketTitle">Ticket title (optional)</label>
          <input
            id="ticketTitle"
            placeholder="e.g. Add bulk-export to reports API"
            value={ticketTitle}
            onChange={(e) => setTicketTitle(e.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="testerName">Tester name</label>
          <input
            id="testerName"
            placeholder="e.g. Priya Sharma"
            value={testerName}
            onChange={(e) => setTesterName(e.target.value)}
          />
        </div>

        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={!canSubmit}>Create ticket</button>
        </div>
      </form>
    </div>
  );
}

export default function Home({ tickets, onOpenTicket, onCreateTicket, onDeleteTicket, defaultTester }) {
  const [showModal, setShowModal] = useState(false);

  const handleCreate = (ticket) => {
    onCreateTicket(ticket);
    setShowModal(false);
  };

  return (
    <div>
      <div className="home-hero">
        <p className="eyebrow">QA Manifest</p>
        <h1>Build a checklist, verify it, ship the proof.</h1>
        <p>
          Pick the modules that apply to your ticket — DB, UI, API, Security, Microservices and more —
          select the checks relevant to your change, note anything worth flagging, and export a clean
          record for your ticket in one click.
        </p>
      </div>

      <div className="section-row">
        <h2>Your tickets ({tickets.length})</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + New test ticket
        </button>
      </div>

      {tickets.length === 0 ? (
        <div className="empty-state">
          No tickets yet. Create one to start building a checklist.
        </div>
      ) : (
        <div className="ticket-list">
          {tickets.map((t) => {
            const progress = calcProgress(t);
            const modules = MODULES.filter((m) => t.selectedModules.includes(m.id));
            return (
              <div className="ticket-card" key={t.id} onClick={() => onOpenTicket(t.id)}>
                <div className="ticket-card-main">
                  <div className="ticket-id-row">
                    <span className="ticket-id">{t.ticketId || 'UNTITLED'}</span>
                    <span className="ticket-title">{t.ticketTitle || 'Untitled ticket'}</span>
                  </div>
                  <div className="ticket-sub">
                    {t.testerName || 'Unassigned'} · updated {formatDate(t.updatedAt)}
                  </div>
                  {modules.length > 0 && (
                    <div className="module-chips" style={{ marginTop: 8 }}>
                      {modules.map((m) => (
                        <span className="module-chip" key={m.id}>{m.shortName}</span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="ticket-progress">
                  <span className="progress-pct">{progress.percent}%</span>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${progress.percent}%` }} />
                  </div>
                  <span className="ticket-sub">{progress.selected}/{progress.total} checks</span>
                </div>

                <button
                  className="btn btn-ghost btn-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm(`Delete ticket ${t.ticketId}? This cannot be undone.`)) {
                      onDeleteTicket(t.id);
                    }
                  }}
                  aria-label={`Delete ${t.ticketId}`}
                  title="Delete ticket"
                >
                  Delete
                </button>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <NewTicketModal
          onClose={() => setShowModal(false)}
          onCreate={handleCreate}
          defaultTester={defaultTester}
        />
      )}
    </div>
  );
}
