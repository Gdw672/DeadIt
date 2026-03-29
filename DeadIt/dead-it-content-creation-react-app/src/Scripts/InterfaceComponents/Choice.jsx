import './Styles/Choice.css';
import React from 'react';

const Choice = ({ style, number, onClickAnchor, onDragStart, isSelected, onSelect, onDelete }) => {
  return (
    <div
      style={style}
      id={`choice-${number}`}
      className={`choice-background${isSelected ? ' node-selected' : ''}`}
      onClick={onSelect}
    >
      {/* Header — drag handle */}
      <div className="choice-header" onMouseDown={onDragStart} style={{ cursor: 'grab' }}>
        <span className="choice-type-badge">Choice</span>
        <span className="choice-number">#{number}</span>
        <button className="node-delete-btn" onClick={(e) => { e.stopPropagation(); onDelete(); }} title="Delete">×</button>
      </div>

      <div className="choice-body">
        <div className="choice-field">
          <label className="choice-field-label">Name</label>
          <input type="text" id={`name-${number}-choice`} className="choice-input" placeholder="Choice name..." />
        </div>
        <div className="choice-field">
          <label className="choice-field-label">Text</label>
          <input type="text" id={`name-${number}-choice`} className="choice-input" placeholder="Choice text..." />
        </div>
      </div>

      <div className="choice-footer">
        <span className="choice-field-label-inline">Type</span>
        <select id={`choice-${number}-type-value`} className="choice-select">
          <option value="Text">Text</option>
          <option value="Choice">Choice</option>
        </select>
      </div>

      <input type="button" id={`choice-right-${number}-anchor`} onClick={onClickAnchor} className="choice-anchor-button-right" title="Connect →" />
      <input type="button" id={`choice-left-${number}-anchor`}  onClick={onClickAnchor} className="choice-anchor-button-left"  title="Connect ←" />
    </div>
  );
};

export default Choice;
