import { useMemo, useState } from 'react';
import { TC_MODULES, PRIORITIES } from '../utils/testCaseUtils';

function PriorityBadge({ priority }) {
  return <span className={`priority-badge priority-${priority.toLowerCase()}`}>{priority}</span>;
}

function TypeBadge({ type }) {
  return <span className="type-badge">{type}</span>;
}

export default function TestCaseLibrary() {
  const [query, setQuery] = useState('');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const q = query.trim().toLowerCase();

  const visibleModules = useMemo(() => {
    return TC_MODULES
      .filter((mod) => moduleFilter === 'all' || mod.id === moduleFilter)
      .map((mod) => ({
        ...mod,
        categories: mod.categories
          .map((cat) => ({
            ...cat,
            testCases: cat.testCases.filter((tc) => {
              if (priorityFilter !== 'all' && tc.priority !== priorityFilter) return false;
              if (!q) return true;
              return `${tc.id} ${tc.title}`.toLowerCase().includes(q);
            }),
          }))
          .filter((cat) => cat.testCases.length > 0),
      }))
      .filter((mod) => mod.categories.length > 0);
  }, [moduleFilter, priorityFilter, q]);

  const totalVisible = visibleModules.reduce(
    (sum, mod) => sum + mod.categories.reduce((s, c) => s + c.testCases.length, 0),
    0
  );

  return (
    <div>
      <p className="eyebrow">Reference Library</p>
      <div className="home-hero" style={{ marginBottom: 26 }}>
        <h1>Test case reference library</h1>
        <p>
          Sample test cases by module, written in standard "Verify that…" form —
          use these as a starting point or reference when writing your own.
        </p>
      </div>

      <div className="checklist-toolbar">
        <div className="module-chips" role="tablist" aria-label="Filter by module">
          <button
            type="button"
            className={`filter-chip ${moduleFilter === 'all' ? 'active' : ''}`}
            onClick={() => setModuleFilter('all')}
          >
            All modules
          </button>
          {TC_MODULES.map((mod) => (
            <button
              type="button"
              key={mod.id}
              className={`filter-chip ${moduleFilter === mod.id ? 'active' : ''}`}
              onClick={() => setModuleFilter(mod.id)}
            >
              {mod.shortName}
            </button>
          ))}
        </div>
        <input
          className="search-input"
          placeholder="Search test cases…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="checklist-toolbar" style={{ marginTop: -8 }}>
        <div className="module-chips" role="tablist" aria-label="Filter by priority">
          <span className="tc-filter-label">Priority</span>
          <button
            type="button"
            className={`filter-chip ${priorityFilter === 'all' ? 'active' : ''}`}
            onClick={() => setPriorityFilter('all')}
          >
            All
          </button>
          {PRIORITIES.map((p) => (
            <button
              type="button"
              key={p}
              className={`filter-chip ${priorityFilter === p ? 'active' : ''}`}
              onClick={() => setPriorityFilter(p)}
            >
              {p}
            </button>
          ))}
        </div>
        <span className="step-footer-info">{totalVisible} test case{totalVisible === 1 ? '' : 's'}</span>
      </div>

      {visibleModules.length === 0 && (
        <div className="empty-state" style={{ marginTop: 20 }}>
          No test cases match your filters.
        </div>
      )}

      {visibleModules.map((mod) => (
        <div className="module-block" key={mod.id}>
          <div className="module-block-head">
            <h3>{mod.name}</h3>
            <span className="module-tally">
              {mod.categories.reduce((s, c) => s + c.testCases.length, 0)} case(s)
            </span>
          </div>

          {mod.categories.map((cat) => (
            <div className="category-block" key={cat.id}>
              <p className="category-title">{cat.name}</p>
              <div className="tc-card-list">
                {cat.testCases.map((tc) => (
                  <div className="tc-row" key={tc.id}>
                    <span className="check-id">{tc.id}</span>
                    <span className="tc-title">{tc.title}</span>
                    <span className="tc-row-badges">
                      <PriorityBadge priority={tc.priority} />
                      <TypeBadge type={tc.type} />
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}