import React from 'react';
import './Styles/SendButton.css';

const SendButton = ({ id, onClick, hasUnsavedChanges }) => {
  return (
    <button
      id={id}
      className={`send-button ${hasUnsavedChanges ? 'unsaved' : 'saved'}`}
      onClick={onClick}
      title={hasUnsavedChanges ? 'Unsaved changes' : 'All changes saved'}
    >
      {hasUnsavedChanges ? 'Save changes' : 'Saved'}
    </button>
  );
};

export default SendButton;
