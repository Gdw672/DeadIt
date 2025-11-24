import axios from 'axios';
import React, { useState, useRef } from 'react';
import DynamicMenu from './InterfaceComponents/DynamicMenu';
import Speech from './InterfaceComponents/Speech';
import Choice from './InterfaceComponents/Choice';
import Xarrow from 'react-xarrows';
import SendButton from './InterfaceComponents/SendButton';
import './InterfaceComponents/Styles/MainScreen.css';

const ContentCreation = () => {
    const [showMenu, setShowMenu] = useState(false);
    const [spawnCoordinates, setSpawnCoordinates] = useState({ x: 0, y: 0 });
    const [speeches, setSpeeches] = useState([]);
    const [choices, setChoices] = useState([]);
    const [numberSpeech, setNumberSpeech] = useState(0);
    const [numberChoice, setNumberChoice] = useState(0);
    const [buttonAttachArrowStart, setButtonAttachArrowStart] = useState(null);
    const [arrows, setArrows] = useState([]);

    const viewportRef = useRef();
    const isDraggingRef = useRef(false);
    const dragStartRef = useRef({ x: 0, y: 0 });
    const scrollStartRef = useRef({ left: 0, top: 0 });

    // Панорамирование canvas мышью
    const handleMouseDown = (e) => {
        if (e.button !== 0) return; // Только левая кнопка
        isDraggingRef.current = true;
        dragStartRef.current = { x: e.clientX, y: e.clientY };
        scrollStartRef.current = { left: viewportRef.current.scrollLeft, top: viewportRef.current.scrollTop };
    };

    const handleMouseMove = (e) => {
        if (isDraggingRef.current) {
            const dx = e.clientX - dragStartRef.current.x;
            const dy = e.clientY - dragStartRef.current.y;
            viewportRef.current.scrollLeft = scrollStartRef.current.left - dx;
            viewportRef.current.scrollTop = scrollStartRef.current.top - dy;
        } else if (!showMenu) {
            setSpawnCoordinates({ x: e.clientX + viewportRef.current.scrollLeft, y: e.clientY + viewportRef.current.scrollTop });
        }
    };

    const handleMouseUp = () => {
        isDraggingRef.current = false;
    };

    // Меню
    const GetMenu = (e) => {
        e.preventDefault();
        if (e.button === 2) setShowMenu(true);
    };

    const hideMenu = (e) => {
        if (e.target.className !== "button-menu" && e.target.className !== "white-square") {
            setShowMenu(false);
        }
    };

    // Спавн объектов
    const spawnSpeech = () => {
        setShowMenu(false);
        const newNumber = numberSpeech + 1;
        setNumberSpeech(newNumber);
        setSpeeches(prev => [...prev, { coords: spawnCoordinates, number: newNumber }]);
    };

    const spawnChoice = () => {
        setShowMenu(false);
        const newNumber = numberChoice + 1;
        setNumberChoice(newNumber);
        setChoices(prev => [...prev, { coords: spawnCoordinates, number: newNumber }]);
    };

    // Стрелки
    const startArrowing = (e) => setButtonAttachArrowStart(e.target.id);
    const endArrowing = (e) => {
        if (buttonAttachArrowStart && e.target.id) {
            setArrows(prev => [...prev, { start: buttonAttachArrowStart, end: e.target.id }]);
        }
        setButtonAttachArrowStart(null);
    };

    // Отправка данных
    const sendData = () => {
        const result = [];

        speeches.forEach(({ number }) => {
            const id = `speechTestr-${number}`;
            const name = document.getElementById(`name-${number}-speech`)?.value || "";
            const text = document.getElementById(`text-${number}-speech`)?.value || "";

            let nextIds = arrows
                .filter(a => a.start.includes(`${number}-`))
                .map(a => a.end);
            nextIds = nextIds.map(n => n.split('-')[0] + '-' + n.split('-')[2]);

            result.push({ id, type: "speech", name, text, nextIds });
        });

        choices.forEach(({ number }) => {
            const id = `choiceTest-${number}`;
            const inputs = document.querySelectorAll(`#name-${number}-choice`);
            const choiceType = document.getElementById(`choice-${number}-type-value`)?.value || "";
            const name = inputs[0]?.value || "";
            const text = inputs[1]?.value || "";

            let nextIds = arrows.find(a => a.start.includes(`${number}-`))?.end || null;
            if (nextIds) nextIds = nextIds.split('-')[0] + '-' + nextIds.split('-')[2];

            result.push({ id, type: choiceType, name, text, nextIds });
        });

        axios.post('http://localhost:5181/api/ContentCreation/PostData', result, {
            headers: { 'Content-Type': 'application/json' }
        }).then(res => console.log(res.data))
            .catch(err => console.error(err));
    };

    return (
        <div
            ref={viewportRef}
            className="viewport"
            style={{ width: '100vw', height: '100vh', overflow: 'auto', cursor: isDraggingRef.current ? 'grabbing' : 'grab' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onContextMenu={GetMenu}
            onClick={hideMenu}
        >
            <div className="canvas" style={{ width: 5000, height: 5000, position: 'relative', backgroundColor: '#eee' }}>
                {showMenu && <DynamicMenu style={{ top: spawnCoordinates.y, left: spawnCoordinates.x }} onSpawmSpeech={spawnSpeech} onSpawnChoice={spawnChoice} />}

                {speeches.map((s, i) => (
                    <Speech
                        key={i}
                        style={{ position: 'absolute', top: s.coords.y, left: s.coords.x }}
                        number={s.number}
                        onClickAnchor={buttonAttachArrowStart === null ? startArrowing : endArrowing}
                    />
                ))}

                {choices.map((c, i) => (
                    <Choice
                        key={i}
                        style={{ position: 'absolute', top: c.coords.y, left: c.coords.x }}
                        number={c.number}
                        onClickAnchor={buttonAttachArrowStart === null ? startArrowing : endArrowing}
                    />
                ))}

                {arrows.map((a, i) => <Xarrow key={i} start={a.start} end={a.end} />)}

                <SendButton id="sendButton" onClick={sendData} />
            </div>
        </div>
    );
};

export default ContentCreation;
