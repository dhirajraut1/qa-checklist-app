import { useEffect, useState } from 'react';
import Home from './components/Home';
import Workspace from './components/Workspace';
import TestCaseLibrary from './components/TestCaseLibrary';
import { useTickets } from './hooks/useTickets';
import { useLocalStorage } from './hooks/useLocalStorage';

function getSystemTheme() {
  if (typeof window === 'undefined' || !window.matchMedia) return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export default function App() {
  const { tickets, addTicket, updateTicket, deleteTicket, getTicket, lastTesterName } = useTickets();
  const [activeTicketId, setActiveTicketId] = useState(null);
  const [page, setPage] = useState('checklist'); // 'checklist' | 'library'
  const [theme, setTheme] = useLocalStorage('qa_checklist_theme_v1', getSystemTheme());

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  const activeTicket = activeTicketId ? getTicket(activeTicketId) : null;

  const goHome = () => {
    setActiveTicketId(null);
    setPage('checklist');
  };

  const goToPage = (nextPage) => {
    setActiveTicketId(null);
    setPage(nextPage);
  };

  const handleCreateTicket = (ticket) => {
    addTicket(ticket);
    setActiveTicketId(ticket.id);
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-left">
          <div className="brand" onClick={goHome}>
            <span className="brand-mark">QA</span>
            <span className="brand-name">Manifest</span>
          </div>
          <nav className="top-nav" aria-label="Main">
            <button
              type="button"
              className={`top-nav-link ${page === 'checklist' ? 'active' : ''}`}
              onClick={() => goToPage('checklist')}
            >
              Checklist Builder
            </button>
            <button
              type="button"
              className={`top-nav-link ${page === 'library' ? 'active' : ''}`}
              onClick={() => goToPage('library')}
            >
              Test Case Library
            </button>
          </nav>
        </div>
        <div className="topbar-right">
          {page === 'checklist' && (
            <span className="topbar-meta">{tickets.length} ticket{tickets.length === 1 ? '' : 's'} saved locally</span>
          )}
          <button
            type="button"
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? 'Dark' : 'Light'}
            <span className="theme-toggle-icon">{theme === 'dark' ? '\u263E' : '\u2600'}</span>
          </button>
        </div>
      </header>

      <main className="main">
        {page === 'library' ? (
          <TestCaseLibrary />
        ) : activeTicket ? (
          <Workspace
            ticket={activeTicket}
            updateTicket={updateTicket}
            onBackHome={goHome}
            testerNameFallback={lastTesterName}
          />
        ) : (
          <Home
            tickets={tickets}
            onOpenTicket={setActiveTicketId}
            onCreateTicket={handleCreateTicket}
            onDeleteTicket={deleteTicket}
            defaultTester={lastTesterName}
          />
        )}
      </main>

      <footer className="app-footer">
        Data is stored only in this browser's local storage. Nothing is sent to a server.
      </footer>
    </div>
  );
}
