import { useState } from 'react';
import { useFilteredMatters } from '../../hooks/use-filtered-matters';
import { useAppState } from '../../hooks/use-app-state';
import { MatterCard } from './MatterCard';
import { MatterForm } from './MatterForm';

export function MattersView() {
  const { state } = useAppState();
  const [search, setSearch] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const filtered = useFilteredMatters(search, showInactive);

  const totalMatters = state.matters.length;
  const activeMatters = state.matters.filter(m => m.status === 'active').length;

  return (
    <div className="matters-view">
      <div className="matters-toolbar">
        <div className="matters-search-group">
          <input
            type="text"
            className="input matters-search"
            placeholder="Search by client, matter, or number..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={e => setShowInactive(e.target.checked)}
            />
            Show archived
          </label>
        </div>
        <div className="matters-toolbar-right">
          <span className="matters-count">
            {filtered.length} of {showInactive ? totalMatters : activeMatters} matters
          </span>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            + New Matter
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">&#128188;</div>
          <h3>{search ? 'No matters match your search' : 'No client-matters yet'}</h3>
          <p>Create your first client-matter to start tracking time.</p>
          {!search && (
            <button className="btn btn-primary" onClick={() => setShowForm(true)}>
              + Create Matter
            </button>
          )}
        </div>
      ) : (
        <div className="matters-grid">
          {filtered.map(m => (
            <MatterCard key={m.id} matter={m} />
          ))}
        </div>
      )}

      <MatterForm isOpen={showForm} onClose={() => setShowForm(false)} />
    </div>
  );
}
