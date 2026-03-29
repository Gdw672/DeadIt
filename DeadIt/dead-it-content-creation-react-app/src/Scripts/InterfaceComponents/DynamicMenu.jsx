import React from 'react';
import './Styles/MenuStyles.css';

const DynamicMenu = ({ style, onSpawnChoice, onSpawmSpeech }) => {
  return (
    <div className="context-menu" style={style}>
      <div className="context-menu-title">Add Node</div>
      <div className="context-menu-divider" />
      <button className="button-menu button-menu-speech" onClick={onSpawmSpeech}>
        <span className="button-menu-dot" />
        Speech
      </button>
      <button className="button-menu button-menu-choice" onClick={onSpawnChoice}>
        <span className="button-menu-dot" />
        Choice
      </button>
    </div>
  );
};

export default DynamicMenu;
