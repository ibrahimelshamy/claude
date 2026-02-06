import { Modal } from './Modal';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'default';
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title} width="400px">
      <p style={{ marginBottom: '1.5rem', color: 'var(--color-text-muted)' }}>{message}</p>
      <div className="modal-actions">
        <button className="btn btn-secondary" onClick={onCancel}>
          {cancelLabel}
        </button>
        <button
          className={`btn ${variant === 'danger' ? 'btn-danger' : 'btn-primary'}`}
          onClick={onConfirm}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
