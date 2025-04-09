import axios from 'axios';
import React, { useState, useEffect } from 'react';
import DynamicMenu from './InterfaceComponents/DynamicMenu';


const ContentCreation = () => {
    const [mouse, setmouse] = useState('');
    const [showMenu, setShowMenu] = useState(false);

    const GetMenu = (e) => {
        e.preventDefault(); 
        if (e.button === 2) {
            setShowMenu(true);
        }
    };


    const hideMenu = (e) => {
        e.preventDefault();

        if (e.target.className !== "button-menu" && e.target.className !== "white-square") {
            setShowMenu(false);

        }
    };


    return (
        <div
            onContextMenu={GetMenu}
            onClick={hideMenu}
            style={{ width: '100vw', height: '100vh', backgroundColor: '#eee' }}
        >
            <h1>Правый клик для меню</h1>

            {showMenu && <DynamicMenu>Меню</DynamicMenu>}
        </div>
    );
};

export default ContentCreation;
