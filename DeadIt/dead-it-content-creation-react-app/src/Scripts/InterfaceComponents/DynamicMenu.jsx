import React from 'react';
import './Styles/MenuStyles.css';

const DynamicMenu = ({ style, onSpawnChoice, onSpawmSpeech }) => {

    const Test = () => {
        console.log("click");
    }

    return <div className="white-square" style={style}>
        <input type="button" value="Choice" onClick={onSpawnChoice} className="button-menu" />
        <input type="button" value="Speech" onClick={onSpawmSpeech} className="button-menu" />
    </div>
};

export default DynamicMenu;