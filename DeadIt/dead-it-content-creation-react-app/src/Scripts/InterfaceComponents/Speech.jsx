import './Styles/Speech.css';
import React, { useState, useEffect } from 'react';

const Speech = ({ style, number, onClickAnchor }) => {

    const [isChecked, setIsChecked] = useState(false);

    const handleChange = (e) => {
        console.log("Now ", e.target.checked);
        setIsChecked(e.target.checked);
    };

  
    return <div style={style} className="speech-background">
        Speech#{number}
        <div className="speech-name-text">
            Name: <input type="text" className="speech-input" />
            Text: <input type="text" className="speech-input" />
        </div>
        <div className="speech-button-container">
            <input type="button" value="speech" className="speech-button-next" />
            <input type="button" value="choice" className="speech-button-next" />
        </div>
        <div>
            <input type="button" id={`speech-anchor-${number}-right`} onClick={onClickAnchor} className="speech-anchor-button-right" />
            <input type="button" id={`speech-anchor-${number}-left`} onClick={onClickAnchor} className="speech-anchor-button-left" />
        </div>
        <div>
            <div>
                    <input type="checkbox" id={`${number}-checkbox`} className="speech-checkbox-is-first" onChange={handleChange} checked={isChecked}></input>
            </div>
        </div>
    </div>



};

export default Speech;
