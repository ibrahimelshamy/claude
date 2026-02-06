import { useState, useRef, useEffect } from 'react';
import { useFilteredMatters } from '../../hooks/use-filtered-matters';
import type { ClientMatter } from '../../types';

interface MatterSelectProps {
  value: string;
  onChange: (matterId: string) => void;
  placeholder?: string;
}

export function MatterSelect({ value, onChange, placeholder = 'Search matters...' }: MatterSelectProps) {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const filtered = useFilteredMatters(search);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedMatter = filtered.find(m => m.id === value) ||
    (value ? { clientName: '', matterNumber: value, matterName: '' } as ClientMatter : null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayValue = selectedMatter && !isOpen
    ? `${selectedMatter.matterNumber} - ${selectedMatter.clientName}`
    : search;

  return (
    <div className="matter-select" ref={wrapperRef}>
      <input
        ref={inputRef}
        type="text"
        className="input"
        placeholder={placeholder}
        value={isOpen ? search : displayValue}
        onChange={e => {
          setSearch(e.target.value);
          if (!isOpen) setIsOpen(true);
        }}
        onFocus={() => {
          setIsOpen(true);
          setSearch('');
        }}
      />
      {isOpen && (
        <div className="matter-select-dropdown">
          {filtered.length === 0 ? (
            <div className="matter-select-empty">No matters found</div>
          ) : (
            filtered.slice(0, 50).map(m => (
              <div
                key={m.id}
                className={`matter-select-option ${m.id === value ? 'selected' : ''}`}
                onClick={() => {
                  onChange(m.id);
                  setIsOpen(false);
                  setSearch('');
                  inputRef.current?.blur();
                }}
              >
                <span className="matter-select-number">{m.matterNumber}</span>
                <span className="matter-select-client">{m.clientName}</span>
                <span className="matter-select-name">{m.matterName}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
