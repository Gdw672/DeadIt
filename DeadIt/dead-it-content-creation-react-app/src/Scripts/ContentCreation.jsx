import axios from 'axios';
import React, { useState, useEffect } from 'react';
import DynamicMenu from './InterfaceComponents/DynamicMenu';
import Speech from './InterfaceComponents/Speech';
import Choice from './InterfaceComponents/Choice';
import Xarrow from 'react-xarrows';

const ContentCreation = () => {
    const [showMenu, setShowMenu] = useState(false);
    const [spawnCoordianates, setSpawnCoordinates] = useState({ x: 0, y: 0 });
    const [speeches, setSpeeches] = useState([]);
    const [choices, setChoices] = useState([]);
    const [numberSpeech, setNumberSpeech] = useState(0);
    const [numberChoice, setNumberChoice] = useState(0);

    const [buttonAttachArrowStart, setButtonAttachArrowStart] = useState(null);

    const [arrows, setArrows] = useState([]);

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

        const coords = { ...spawnCoordianates };
        const newNumber = numberChoice + 1;


        setNumberChoice(newNumber);

        setChoices((prevChoices) => [...prevChoices, { coords, number: newNumber }]);
    }

    const spawnSpeech = () => {
        setShowMenu(false);

        const coords = { ...spawnCoordianates };
        const newNumber = numberSpeech + 1;


        setNumberSpeech(newNumber);

        setSpeeches((prevChoices) => [...prevChoices, { coords, number: newNumber }]);
    }

    const startArrowing = (event) => {
        console.log('Информация о кнопке старта:', event.target);

        setButtonAttachArrowStart(event.target.id);
    }

    const endArrowing = (event) => {
        console.log('Информация о кнопке конца:', event.target);

        const endId = event.target.id;

        if (buttonAttachArrowStart && endId) {
            setArrows((prev) => [
                ...prev,
                { start: buttonAttachArrowStart, end: endId }
            ]);
        }

        console.log(arrows);

        setButtonAttachArrowStart(null);
    }

    useEffect(() => {
        console.log(numberSpeech);
    }, [speeches], [numberSpeech], [arrows]);


    return (
        <div
            onContextMenu={GetMenu}
            onClick={hideMenu}
            style={{ width: '100vw', height: '100vh', backgroundColor: '#eee' }}
            onMouseMove={handleMouseMove}
        >
            {showMenu && <DynamicMenu style={{ top: spawnCoordianates.y, left: spawnCoordianates.x }} onSpawmSpeech={spawnSpeech} onSpawnChoice={spawnChoice}>Меню</DynamicMenu>}

            {speeches.map((speech, index) => (
                <Speech
                    key={index}
                    style={{ position: 'absolute', top: speech.coords.y, left: speech.coords.x }}
                    number={speech.number}
                    onClickAnchor={buttonAttachArrowStart === null ? startArrowing : endArrowing}
                />
            ))}

            {choices.map((choice, index) => (
                <Choice key={index} style={{ position: 'absolute', top: choice.coords.y, left: choice.coords.x }} number={choice.number} onClickAnchor={buttonAttachArrowStart === null ? startArrowing : endArrowing} />
            ))}

            {arrows.map((arrow, index) => (
                <Xarrow key={index} start={arrow.start} end={arrow.end} />
            ))}        </div>
    );
};

export default ContentCreation;
