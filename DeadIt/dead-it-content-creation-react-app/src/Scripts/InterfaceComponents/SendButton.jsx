import React from 'react';
import './Styles/SendButton.css';

const SendButton = ({onClick}) => {

    return <div className="send-buuton">
        <input type="button" value="Send" onClick={onClick} className="button-menu" />
    </div>
};

export default SendButton;