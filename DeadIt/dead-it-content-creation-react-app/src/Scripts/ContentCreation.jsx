import axios from 'axios';
import React, { useState, useEffect } from 'react';
import DynamicMenu from './InterfaceComponents/DynamicMenu';
import Speech from './InterfaceComponents/Speech';

const ContentCreation = () => {
    const [showMenu, setShowMenu] = useState(false);
    const [spawnCoordianates, setSpawnCoordinates] = useState({ x: 0, y: 0 });
    const [choices, setChoices] = useState([]);
    const [numberSpeech, setNumberSpeech] = useState(0);

    const handleMouseMove = (e) => {
        if (showMenu === false) {
            setSpawnCoordinates({ x: e.screenX - 50, y: e.screenY - 150 });
        }
    };

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

    const spawnChoice = () => {
        setShowMenu(false);

    }

    const spawnSpeech = () => {
        setShowMenu(false);
        console.log("spawn speech");

        const coords = { ...spawnCoordianates };
        const newNumber = numberSpeech + 1;


        setNumberSpeech(newNumber);

        setChoices((prevChoices) => [...prevChoices, { coords, number: newNumber }]);
    }

    useEffect(() => {
        console.log(numberSpeech);
    }, [choices], numberSpeech);


    return (
        <div
            onContextMenu={GetMenu}
            onClick={hideMenu}
            style={{ width: '100vw', height: '100vh', backgroundColor: '#eee' }}
            onMouseMove={handleMouseMove}
        >
            {showMenu && <DynamicMenu style={{ top: spawnCoordianates.y, left: spawnCoordianates.x }} onSpawmSpeech={spawnSpeech} onSpawnChoice={spawnChoice}>Меню</DynamicMenu>}

            {choices.map((choice, index) => (
                <Speech key={index} style={{ position: 'absolute', top: choice.coords.y, left: choice.coords.x }} number={choice.number} />
            ))}
        </div>
    );
};

export default ContentCreation;
