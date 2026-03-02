import './Styles/Speech.css';
import React, { useState } from 'react';

const Speech = ({ style, number, onClickAnchor }) => {
    const [isChecked, setIsChecked] = useState(false);

    const handleChange = (e) => setIsChecked(e.target.checked);

    return (
        <div style={style} id={`speech-${number}`} className="speech-background">
            SpeechTestTest#{number}
            <div className="speech-name-text">
                Name: <input type="text" id={`name-${number}-speech`} className="speech-input" />
                Text: <input type="text" id={`text-${number}-speech`} className="speech-input" />
            </div>
            <div className="speech-button-container">
                <input type="button" value="speech" className="speech-button-next" />
                <input type="button" value="choice" className="speech-button-next" />
            </div>
            <div>
                <input type="button" id={`speech-right-${number}-anchor`} onClick={onClickAnchor} className="speech-anchor-button-right" />
                <input type="button" id={`speech-left-${number}-anchor`} onClick={onClickAnchor} className="speech-anchor-button-left" />
            </div>
            <div>
                <input type="checkbox" id={`${number}-checkbox`} className="speech-checkbox-is-first" onChange={handleChange} checked={isChecked} />
            </div>
        </div>
    );
};

export default Speech;

