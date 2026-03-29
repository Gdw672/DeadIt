import './Styles/Choice.css';
import React from 'react';

const Choice = ({ style, number, data, onChange, onClickAnchor, onDragStart, isSelected, onSelect, onDelete }) => {
    return (
        <div
            style={style}
            id={`choice-${number}`}
            className={`choice-background${isSelected ? ' node-selected' : ''}`}
            onClick={onSelect}
        >
            <div className="choice-header" onMouseDown={onDragStart} style={{ cursor: 'grab' }}>
                <span className="choice-type-badge">Choice</span>
                <span className="choice-number">#{number}</span>
                <button className="node-delete-btn" onClick={(e) => { e.stopPropagation(); onDelete(); }}>×</button>
            </div>

            <div className="choice-body">
                <div className="choice-field">
                    <label className="choice-field-label">Name</label>
                    <input
                        type="text"
                        className="choice-input"
                        value={data.name || ''}
                        onChange={(e) => onChange(number, 'name', e.target.value)}
                    />
                </div>
                <div className="choice-field">
                    <label className="choice-field-label">Text</label>
                    <input
                        type="text"
                        className="choice-input"
                        value={data.text || ''}
                        onChange={(e) => onChange(number, 'text', e.target.value)}
                    />
                </div>
            </div>

            <div className="choice-footer">
                <span className="choice-field-label-inline">Type</span>
                <select
                    className="choice-select"
                    value={data.type || 'Text'}
                    onChange={(e) => onChange(number, 'type', e.target.value)}
                >
                    <option value="Text">Text</option>
                    <option value="Choice">Choice</option>
                </select>
            </div>

            <input type="button" id={`choice-right-${number}-anchor`} onClick={onClickAnchor} className="choice-anchor-button-right" />
            <input type="button" id={`choice-left-${number}-anchor`} onClick={onClickAnchor} className="choice-anchor-button-left" />
        </div>
    );
};

export default Choice;