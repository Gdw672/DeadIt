import './Styles/Speech.css';
import React from 'react';

const Speech = ({ style, number, data, onChange, onClickAnchor, onDragStart, isSelected, onSelect, onDelete }) => {
    return (
        <div
            style={style}
            id={`speech-${number}`}
            className={`speech-background${isSelected ? ' node-selected' : ''}`}
            onClick={onSelect}
        >
            <div className="speech-header" onMouseDown={onDragStart} style={{ cursor: 'grab' }}>
                <span className="speech-type-badge">Speech</span>
                <span className="speech-number">#{number}</span>
                <button className="node-delete-btn" onClick={(e) => { e.stopPropagation(); onDelete(); }}>×</button>
            </div>

            <div className="speech-body">
                <div className="speech-field">
                    <label className="speech-field-label">Name</label>
                    <input
                        type="text"
                        className="speech-input"
                        value={data.name || ''}
                        onChange={(e) => onChange(number, 'name', e.target.value)}
                    />
                </div>
                <div className="speech-field">
                    <label className="speech-field-label">Text</label>
                    <input
                        type="text"
                        className="speech-input"
                        value={data.text || ''}
                        onChange={(e) => onChange(number, 'text', e.target.value)}
                    />
                </div>
            </div>

            <div className="speech-footer">
                <label className="speech-is-first-label">
                    <input
                        type="checkbox"
                        checked={!!data.isFirst}
                        onChange={(e) => onChange(number, 'isFirst', e.target.checked)}
                    />
                    Is First
                </label>
            </div>

            <input type="button" id={`speech-right-${number}-anchor`} onClick={onClickAnchor} className="speech-anchor-button-right" />
            <input type="button" id={`speech-left-${number}-anchor`} onClick={onClickAnchor} className="speech-anchor-button-left" />
        </div>
    );
};

export default Speech;