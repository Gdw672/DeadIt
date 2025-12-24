import axios from 'axios';
import React, { useState, useRef, useEffect, useCallback } from 'react';
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
    const [lastSavedData, setLastSavedData] = useState(null); // Храним последние сохраненные данные для сравнения
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false); // Флаг изменений

    const viewportRef = useRef();
    const isDraggingRef = useRef(false);
    const dragStartRef = useRef({ x: 0, y: 0 });
    const scrollStartRef = useRef({ left: 0, top: 0 });

    // Панорамирование canvas мышью
    const handleMouseDown = (e) => {
        if (e.button !== 0) return;
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
        setHasUnsavedChanges(true);
    };

    const spawnChoice = () => {
        setShowMenu(false);
        const newNumber = numberChoice + 1;
        setNumberChoice(newNumber);
        setChoices(prev => [...prev, { coords: spawnCoordinates, number: newNumber }]);
        setHasUnsavedChanges(true);
    };

    // Стрелки
    const startArrowing = (e) => setButtonAttachArrowStart(e.target.id);
    const endArrowing = (e) => {
        if (buttonAttachArrowStart && e.target.id) {
            setArrows(prev => {
                const newArrows = [...prev, { start: buttonAttachArrowStart, end: e.target.id }];
                // Проверяем, действительно ли добавилась новая стрелка
                if (prev.length !== newArrows.length) {
                    setHasUnsavedChanges(true);
                }
                return newArrows;
            });
        }
        setButtonAttachArrowStart(null);
    };

    // Функция сбора данных (та же логика, что и в sendData)
    const gatherData = useCallback(() => {
        const result = [];

        // Обработка speeches
        speeches.forEach(({ number }) => {
            const id = `speechTestr-${number}`;
            const name = document.getElementById(`name-${number}-speech`)?.value || "";
            const text = document.getElementById(`text-${number}-speech`)?.value || "";

            let nextIds = arrows
                .filter(a => a.start === `speech-right-${number}-anchor` || a.start === `speech-left-${number}-anchor`)
                .map(a => a.end);

            nextIds = nextIds.length ? nextIds.map(n => n.split('-')[0] + '-' + n.split('-')[2]) : null;

            result.push({ id, type: "speech", name, text, nextIds });
        });

        // Обработка choices
        choices.forEach(({ number }) => {
            const id = `choiceTest-${number}`;
            const inputs = document.querySelectorAll(`#name-${number}-choice`);
            const choiceType = document.getElementById(`choice-${number}-type-value`)?.value || "";
            const name = inputs[0]?.value || "";
            const text = inputs[1]?.value || "";

            let nextIds = arrows
                .filter(a => a.start === `choice-right-${number}-anchor` || a.start === `choice-left-${number}-anchor`)
                .map(a => a.end);

            nextIds = nextIds.length ? nextIds.map(n => n.split('-')[0] + '-' + n.split('-')[2]) : null;

            result.push({ id, type: choiceType, name, text, nextIds });
        });

        return result;
    }, [speeches, choices, arrows]);

    // Функция отправки данных
    const sendData = useCallback(async (isAutoSave = false) => {
        const currentData = gatherData();

        // Для автосохранения проверяем, есть ли изменения
        if (isAutoSave) {
            // Если нет элементов вообще - не отправляем
            if (currentData.length === 0) {
                console.log('Автосохранение: нет элементов для сохранения');
                return;
            }

            // Если нет изменений с последнего сохранения - не отправляем
            if (lastSavedData && JSON.stringify(currentData) === JSON.stringify(lastSavedData)) {
                console.log('Автосохранение: нет изменений');
                return;
            }
        }

        console.log(`${isAutoSave ? 'Автосохранение:' : 'Ручное сохранение:'}`, JSON.stringify(currentData, null, 2));

        try {
            const response = await axios.post('http://localhost:5181/api/ContentCreation/PostData', currentData, {
                headers: { 'Content-Type': 'application/json' }
            });

            console.log(`${isAutoSave ? 'Автосохранение успешно:' : 'Данные отправлены:'}`, response.data);

            // Сохраняем текущие данные как последние сохраненные
            setLastSavedData(currentData);
            setHasUnsavedChanges(false);

            return response.data;
        } catch (err) {
            console.error(`${isAutoSave ? 'Ошибка автосохранения:' : 'Ошибка отправки:'}`, err);
            throw err;
        }
    }, [gatherData, lastSavedData]);

    // Обработчик ручной отправки (старая логика)
    const handleManualSend = () => {
        sendData(false).catch(err => {
            // Ошибка уже обработана в sendData
        });
    };

    // Механизм автосохранения каждые 5 минут
    useEffect(() => {
        const autoSaveInterval = setInterval(() => {
            if (speeches.length > 0 || choices.length > 0) {
                sendData(); // отправляем полный список
            } else {
                console.log('Автосохранение: нет элементов для отправки');
            }
        }, 30000);

        return () => clearInterval(autoSaveInterval);
    }, [speeches, choices, sendData]);

    // Отслеживание изменений в полях ввода (для флага изменений)
    useEffect(() => {
        const handleInputChange = () => {
            setHasUnsavedChanges(true);
        };

        // Находим все поля ввода в компонентах Speech и Choice
        const speechInputs = document.querySelectorAll('[id*="-speech"]');
        const choiceInputs = document.querySelectorAll('[id*="-choice"]');

        const allInputs = [...speechInputs, ...choiceInputs];

        allInputs.forEach(input => {
            input.addEventListener('input', handleInputChange);
            input.addEventListener('change', handleInputChange);
        });

        return () => {
            allInputs.forEach(input => {
                input.removeEventListener('input', handleInputChange);
                input.removeEventListener('change', handleInputChange);
            });
        };
    }, [speeches.length, choices.length]); // Переустанавливаем обработчики при изменении количества элементов

    // Также отслеживаем изменения в самих массивах элементов
    useEffect(() => {
        setHasUnsavedChanges(true);
    }, [speeches, choices, arrows]);

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

                <SendButton
                    id="sendButton"
                    onClick={handleManualSend}
                    hasUnsavedChanges={hasUnsavedChanges}
                />
            </div>
        </div>
    );
};

export default ContentCreation;