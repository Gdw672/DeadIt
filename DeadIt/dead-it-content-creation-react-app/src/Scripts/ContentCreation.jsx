import axios from 'axios';
import React, { useState, useEffect, useRef } from 'react';
import DynamicMenu from './InterfaceComponents/DynamicMenu';
import Speech from './InterfaceComponents/Speech';
import Choice from './InterfaceComponents/Choice';
import Xarrow from 'react-xarrows';
import SendButton from './InterfaceComponents/SendButton';

const ContentCreation = () => {
    const [showMenu, setShowMenu] = useState(false);
    const [spawnCoordianates, setSpawnCoordinates] = useState({ x: 0, y: 0 });
    const [speeches, setSpeeches] = useState([]);
    const [choices, setChoices] = useState([]);
    const [numberSpeech, setNumberSpeech] = useState(0);
    const [numberChoice, setNumberChoice] = useState(0);

    const [buttonAttachArrowStart, setButtonAttachArrowStart] = useState(null);

    const [arrows, setArrows] = useState([]);

    const refs = useRef({});

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

        setButtonAttachArrowStart(null);
    }

    const sendData = () => {

        const result = [];

        speeches.forEach(({ number }) => {
            const id = `speech-${number}`;
            const nameInput = document.getElementById(`name-${number}-speech`);
            const textInput = document.getElementById(`text-${number}-speech`);

            const name = nameInput ? nameInput.value : "";
            const text = textInput ? textInput.value : "";

            const nextArrows = arrows.filter(arrow => arrow.start === `speech-right-${number}-anchor` || arrow.start === `speech-left-${number}-anchort`
                || arrow.start === `choice-left-${number}-anchort`
                || arrow.start === `choice-right-${number}-anchort`);

            let nextIds = nextArrows.map(arrow => arrow.end);

            nextIds = getCorrecttNextId(nextIds);

            console.log(nextIds);
                
            result.push({
                id,
                type: "speech",
                name,
                text,
                nextIds
            });
        });

        choices.forEach(({ number }) => {
            const id = `choice-${number}`;
            const inputs = document.querySelectorAll(`#name-${number}-choice`);
            const name = inputs[0] ? inputs[0].value : "";
            const text = inputs[1] ? inputs[1].value : "";

            const nextArrow = arrows.find(arrow => arrow.start === `choice-right-${number}-anchor`
                || arrow.start === `choice-left-${number}-anchor`);
            let nextIdsIncorrect = nextArrow ? [nextArrow.end] : []; //Привод к массиву
            nextIdsIncorrect = getCorrecttNextId(nextIdsIncorrect);
            const nextIds = nextIdsIncorrect.length > 0 ? nextIdsIncorrect[0] : null;

            result.push({
                id,
                type: "choice",
                name,
                text,
                nextIds
            });
        });

        console.log("Resulting JSON:", JSON.stringify(result, null, 2));

        axios.post('http://localhost:5181/api/ContentCreation/PostData', result, {
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                console.log('Success:', response.data);
            })
            .catch(error => {
                console.error('Error:', error);
            });

    }

    const getCorrecttNextId = (names) => {
        if (names == null) {
            return null;
        }
        var parts = [];
        for (var i = 0; i < names.length; i++) {
            var correctName = names[i].split('-');
            parts.push(`${correctName[0]}-${correctName[2]}`)
        }

        return parts;
    }

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
            ))}

            <SendButton id="sendButton" onClick={sendData} />
        </div>
    );
};

export default ContentCreation;
