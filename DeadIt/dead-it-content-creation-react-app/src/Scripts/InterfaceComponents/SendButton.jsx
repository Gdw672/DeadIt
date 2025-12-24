import React from 'react';
import './Styles/SendButton.css';

const SendButton = ({ id, onClick, hasUnsavedChanges }) => {
    return (
        <button
            id={id}
            className={`send-button ${hasUnsavedChanges ? 'unsaved' : 'saved'}`}
            onClick={onClick}
            title={hasUnsavedChanges ? 'Есть несохраненные изменения' : 'Все изменения сохранены'}
        >
            {hasUnsavedChanges ? 'Сохранить изменения' : 'Отправить'}
        </button>
    );
};

export default SendButton;