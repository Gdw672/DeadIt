import React from 'react';
import './Styles/WhiteSquare.css';

const DynamicMenu = () => {

    const Test = () => {
        console.log("click");

    }

    return <div className="white-square">
        <input type="button" value="Choice" onClick={Test} className="button-menu" />
        <input type="button" value="Speech" onClick={Test} className="button-menu" />

    </div>
};

export default DynamicMenu;