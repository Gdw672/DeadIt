import './Styles/Speech.css';
import React, { useState } from 'react';

const Speech = ({ style, number, onClickAnchor, onDragStart, isSelected, onSelect, onDelete }) => {
  const [isChecked, setIsChecked] = useState(false);

  return (
    <div
      style={style}
      id={`speech-${number}`}
      className={`speech-background${isSelected ? ' node-selected' : ''}`}
      onClick={onSelect}
    >
      {/* Header — drag handle */}
      <div className="speech-header" onMouseDown={onDragStart} style={{ cursor: 'grab' }}>
        <span className="speech-type-badge">Speech</span>
        <span className="speech-number">#{number}</span>
        <button className="node-delete-btn" onClick={(e) => { e.stopPropagation(); onDelete(); }} title="Delete">×</button>
      </div>

      <div className="speech-body">
        <div className="speech-field">
          <label className="speech-field-label">Name</label>
          <input type="text" id={`name-${number}-speech`} className="speech-input" placeholder="Character name..." />
        </div>
        <div className="speech-field">
          <label className="speech-field-label">Text</label>
          <input type="text" id={`text-${number}-speech`} className="speech-input" placeholder="Dialogue text..." />
        </div>
      </div>

      <div className="speech-footer">
        <label className="speech-is-first-label">
          <input
            type="checkbox"
            id={`${number}-checkbox`}
            className="speech-checkbox-is-first"
            onChange={(e) => setIsChecked(e.target.checked)}
            checked={isChecked}
          />
          Is First
        </label>
      </div>

      <input type="button" id={`speech-right-${number}-anchor`} onClick={onClickAnchor} className="speech-anchor-button-right" title="Connect →" />
      <input type="button" id={`speech-left-${number}-anchor`}  onClick={onClickAnchor} className="speech-anchor-button-left"  title="Connect ←" />
    </div>
  );
};

export default Speech;
