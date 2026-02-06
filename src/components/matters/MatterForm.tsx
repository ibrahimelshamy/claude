import { useState } from 'react';
import type { ClientMatter } from '../../types';
import { useAppState } from '../../hooks/use-app-state';
import { Modal } from '../shared/Modal';

interface MatterFormProps {
  matter?: ClientMatter;
  isOpen: boolean;
  onClose: () => void;
}

export function MatterForm({ matter, isOpen, onClose }: MatterFormProps) {
  const { dispatch } = useAppState();
  const isEdit = !!matter;

  const [clientName, setClientName] = useState(matter?.clientName || '');
  const [matterName, setMatterName] = useState(matter?.matterName || '');
  const [matterNumber, setMatterNumber] = useState(matter?.matterNumber || '');
  const [status, setStatus] = useState<ClientMatter['status']>(matter?.status || 'active');
  const [billableRate, setBillableRate] = useState(matter?.billableRate?.toString() || '');
  const [notes, setNotes] = useState(matter?.notes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !matterName.trim()) return;

    const now = new Date().toISOString();
    const matterData: ClientMatter = {
      id: matter?.id || crypto.randomUUID(),
      clientName: clientName.trim(),
      matterName: matterName.trim(),
      matterNumber: matterNumber.trim(),
      status,
      billableRate: billableRate ? parseFloat(billableRate) : undefined,
      notes: notes.trim() || undefined,
      createdAt: matter?.createdAt || now,
      updatedAt: now,
    };

    dispatch({
      type: isEdit ? 'UPDATE_MATTER' : 'ADD_MATTER',
      payload: matterData,
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Matter' : 'New Client-Matter'} width="520px">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Client Name *</label>
          <input
            type="text"
            className="input"
            value={clientName}
            onChange={e => setClientName(e.target.value)}
            placeholder="e.g. Acme Corporation"
            autoFocus
          />
        </div>
        <div className="form-group">
          <label>Matter Name *</label>
          <input
            type="text"
            className="input"
            value={matterName}
            onChange={e => setMatterName(e.target.value)}
            placeholder="e.g. Patent Filing #2024-1187"
          />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Matter Number</label>
            <input
              type="text"
              className="input"
              value={matterNumber}
              onChange={e => setMatterNumber(e.target.value)}
              placeholder="e.g. ACM-2024-1187"
            />
          </div>
          <div className="form-group">
            <label>Status</label>
            <select
              className="input"
              value={status}
              onChange={e => setStatus(e.target.value as ClientMatter['status'])}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label>Billable Rate ($/hr)</label>
          <input
            type="number"
            className="input"
            value={billableRate}
            onChange={e => setBillableRate(e.target.value)}
            placeholder="Optional"
            step="0.01"
            min="0"
          />
        </div>
        <div className="form-group">
          <label>Notes</label>
          <textarea
            className="input textarea"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Optional notes..."
            rows={3}
          />
        </div>
        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={!clientName.trim() || !matterName.trim()}>
            {isEdit ? 'Save Changes' : 'Create Matter'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
