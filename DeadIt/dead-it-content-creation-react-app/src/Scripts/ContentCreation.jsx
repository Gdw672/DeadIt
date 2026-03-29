import axios from 'axios';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import DynamicMenu from './InterfaceComponents/DynamicMenu';
import Speech from './InterfaceComponents/Speech';
import Choice from './InterfaceComponents/Choice';
import Xarrow, { useXarrow, Xwrapper } from 'react-xarrows';
import SendButton from './InterfaceComponents/SendButton';
import './InterfaceComponents/Styles/MainScreen.css';

// Вспомогательный компонент Outliner вынесен для чистоты
const Outliner = ({ speeches, choices, arrows, selectedNodes, onSelectNode, onFocusNode, onDeleteNode, onDeleteArrow }) => {
    const allNodes = [
        ...speeches.map(s => ({ type: 'speech', number: s.number })),
        ...choices.map(c => ({ type: 'choice', number: c.number })),
    ].sort((a, b) => (a.type !== b.type ? a.type.localeCompare(b.type) : a.number - b.number));

    const getOutgoing = (type, number) =>
        arrows.reduce((acc, a, i) => {
            if (a.start.startsWith(`${type}-`) && a.start.includes(`-${number}-`)) {
                const parts = a.end.split('-');
                acc.push({ index: i, endType: parts[0], endNum: parseInt(parts[2]) });
            }
            return acc;
        }, []);

    return (
        <aside className="outliner">
            <div className="outliner-header">
                <span className="outliner-title">Outliner</span>
                <span className="outliner-count">{allNodes.length}</span>
            </div>
            <div className="outliner-body">
                {allNodes.map(({ type, number }) => {
                    const key = `${type}-${number}`;
                    const isSelected = selectedNodes.has(key);
                    const outgoing = getOutgoing(type, number);
                    return (
                        <div key={key} className={`outliner-item ${isSelected ? 'outliner-item-selected' : ''}`}>
                            <div className="outliner-item-row" onClick={(e) => onSelectNode(key, e.shiftKey)}>
                                <span className={`outliner-badge outliner-badge-${type}`}>{type[0].toUpperCase()}</span>
                                <span className="outliner-label">{type} #{number}</span>
                                <button className="outliner-btn" onClick={(e) => { e.stopPropagation(); onFocusNode(type, number); }}>⌖</button>
                                <button className="outliner-btn outliner-btn-del" onClick={(e) => { e.stopPropagation(); onDeleteNode(type, number); }}>×</button>
                            </div>
                            {outgoing.map((conn) => (
                                <div key={conn.index} className="outliner-conn">
                                    <span>→ {conn.endType} #{conn.endNum}</span>
                                    <button className="outliner-btn-del" onClick={() => onDeleteArrow(conn.index)}>×</button>
                                </div>
                            ))}
                        </div>
                    );
                })}
            </div>
        </aside>
    );
};

const ContentCreation = () => {
    const [speeches, setSpeeches] = useState([]);
    const [choices, setChoices] = useState([]);
    const [arrows, setArrows] = useState([]);
    const [selectedNodes, setSelectedNodes] = useState(new Set());
    const [showMenu, setShowMenu] = useState(false);
    const [spawnCoords, setSpawnCoords] = useState({ x: 300, y: 300 });
    const [numberSpeech, setNumberSpeech] = useState(0);
    const [numberChoice, setNumberChoice] = useState(0);
    const [arrowStart, setArrowStart] = useState(null);
    const [hasUnsaved, setHasUnsaved] = useState(false);
    const [mouseCanvas, setMouseCanvas] = useState({ x: 0, y: 0 });
    const [marquee, setMarquee] = useState(null);

    const viewportRef = useRef();
    const updateXarrow = useXarrow();
    const dragRef = useRef(null);
    const isMarqueeRef = useRef(false);

    const API_URL = 'http://localhost:5181/api/ContentCreation';

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const res = await axios.get(`${API_URL}/GetAllData`);
                const data = res.data;
                if (!data || data.length === 0) return;

                const loadedSpeeches = [];
                const loadedChoices = [];
                const newArrows = [];
                let maxS = 0, maxC = 0;

                data.forEach(item => {
                    const baseType = item.id.toLowerCase().includes('speech') ? 'speech' : 'choice';
                    const num = parseInt(item.id.split('-')[1]);

                    const nodeData = {
                        number: num,
                        coords: { x: item.x, y: item.y },
                        name: item.name,
                        text: item.text,
                        type: item.type,
                        isFirst: item.isFirst
                    };

                    if (baseType === 'speech') {
                        loadedSpeeches.push(nodeData);
                        if (num > maxS) maxS = num;
                    } else {
                        loadedChoices.push(nodeData);
                        if (num > maxC) maxC = num;
                    }

                    if (item.nextIds) {
                        item.nextIds.forEach(nextId => {
                            const targetParts = nextId.split('-');
                            const targetType = targetParts[0].toLowerCase().includes('speech') ? 'speech' : 'choice';
                            const targetNum = targetParts[1];

                            newArrows.push({
                                start: `${baseType}-right-${num}-anchor`,
                                end: `${targetType}-left-${targetNum}-anchor`
                            });
                        });
                    }
                });

                setSpeeches(loadedSpeeches);
                setChoices(loadedChoices);
                setArrows(newArrows);
                setNumberSpeech(maxS);
                setNumberChoice(maxC);
            } catch (err) { console.error("Load error:", err); }
        };
        loadInitialData();
    }, []);

    useEffect(() => {
        updateXarrow();
    }, [speeches, choices, arrows, updateXarrow]);
    // --- 2. ОБРАБОТКА ИЗМЕНЕНИЙ ВНУТРИ УЗЛОВ ---
    const handleNodeChange = useCallback((number, field, value, nodeType) => {
        const setter = nodeType === 'speech' ? setSpeeches : setChoices;
        setter(prev => prev.map(n => n.number === number ? { ...n, [field]: value } : n));
        setHasUnsaved(true);
    }, []);

    const gatherData = useCallback(() => {
        const result = [];

        speeches.forEach(s => {
            const next = arrows
                .filter(a => a.start === `speech-right-${s.number}-anchor`)
                .map(a => {
                    const p = a.end.split('-'); // [type, side, num, anchor]
                    return `${p[0]}-${p[2]}`; // вернет например "choice-5"
                });

            result.push({
                id: `speech-${s.number}`, // Чистый ID без "Testr"
                type: 'speech',
                name: s.name,
                text: s.text,
                x: s.coords.x,
                y: s.coords.y,
                isFirst: s.isFirst,
                nextIds: next.length ? next : null
            });
        });

        choices.forEach(c => {
            const next = arrows
                .filter(a => a.start === `choice-right-${c.number}-anchor`)
                .map(a => {
                    const p = a.end.split('-');
                    return `${p[0]}-${p[2]}`;
                });

            result.push({
                id: `choice-${c.number}`,
                type: c.type || 'Text',
                name: c.name,
                text: c.text,
                x: c.coords.x,
                y: c.coords.y,
                nextIds: next.length ? next : null
            });
        });

        return result;
    }, [speeches, choices, arrows]);

    const sendData = useCallback(async () => {
        try {
            await axios.post(`${API_URL}/PostData`, gatherData());
            setHasUnsaved(false);
        } catch (err) { console.error("Save error:", err); }
    }, [gatherData]);

    // Автосохранение
    useEffect(() => {
        const id = setInterval(() => { if (hasUnsaved) sendData(); }, 15000);
        return () => clearInterval(id);
    }, [hasUnsaved, sendData]);

    // --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ (Drag, Pan, Select) ---
    const toCanvas = useCallback((clientX, clientY) => {
        const vp = viewportRef.current;
        return { x: clientX + vp.scrollLeft, y: clientY + vp.scrollTop };
    }, []);

    const handleNodeDragStart = (e, type, number) => {
        if (e.button !== 0) return;
        e.stopPropagation();
        const key = `${type}-${number}`;
        const { x: startX, y: startY } = toCanvas(e.clientX, e.clientY);
        const activeSelection = selectedNodes.has(key) ? selectedNodes : new Set([key]);
        if (!selectedNodes.has(key)) setSelectedNodes(new Set([key]));

        const nodes = [...activeSelection].map(k => {
            const [t, n] = [k.split('-')[0], parseInt(k.split('-')[1])];
            const found = (t === 'speech' ? speeches : choices).find(x => x.number === n);
            return found ? { type: t, number: n, initX: found.coords.x, initY: found.coords.y } : null;
        }).filter(Boolean);

        dragRef.current = { startX, startY, nodes };
    };

    // --- Внутри ContentCreation ---

    const handleMouseMove = useCallback((e) => {
        if (!viewportRef.current) return;
        const { x: cx, y: cy } = toCanvas(e.clientX, e.clientY);
        setMouseCanvas({ x: cx, y: cy });

        // ПРОВЕРКА: Если мы в режиме перемещения и данные существуют
        if (dragRef.current && dragRef.current.nodes) {
            const dx = cx - dragRef.current.startX;
            const dy = cy - dragRef.current.startY;

            const su = {}, cu = {};
            dragRef.current.nodes.forEach(({ type, number, initX, initY }) => {
                if (type === 'speech') su[number] = { x: initX + dx, y: initY + dy };
                else cu[number] = { x: initX + dx, y: initY + dy };
            });

            // Используем функциональный апдейт, чтобы избежать замыканий старого стейта
            if (Object.keys(su).length) {
                setSpeeches(prev => prev.map(s => su[s.number] ? { ...s, coords: su[s.number] } : s));
            }
            if (Object.keys(cu).length) {
                setChoices(prev => prev.map(c => cu[c.number] ? { ...c, coords: cu[c.number] } : c));
            }

            // Принудительный пересчет стрелок во время движения
            updateXarrow();
        }
    }, [toCanvas, updateXarrow]); // Убрали лишние зависимости, провоцирующие ре-рендер

    const handleMouseUp = useCallback(() => {
        if (dragRef.current) {
            setHasUnsaved(true);
            // После завершения движения еще раз обновляем стрелки для фиксации
            setTimeout(updateXarrow, 10);
        }
        dragRef.current = null;
        isMarqueeRef.current = false;
    }, [updateXarrow]);



    const spawnNode = (type) => {
        setShowMenu(false);
        const num = type === 'speech' ? numberSpeech + 1 : numberChoice + 1;
        const newNode = { number: num, coords: spawnCoords, name: '', text: '', type: 'Text' };
        if (type === 'speech') { setSpeeches([...speeches, newNode]); setNumberSpeech(num); }
        else { setChoices([...choices, newNode]); setNumberChoice(num); }
        setHasUnsaved(true);
    };

    const deleteNode = (type, number) => {
        setArrows(prev => prev.filter(a => !a.start.includes(`${type}-right-${number}`) && !a.end.includes(`${type}-left-${number}`)));
        if (type === 'speech') setSpeeches(prev => prev.filter(s => s.number !== number));
        else setChoices(prev => prev.filter(c => c.number !== number));
        setHasUnsaved(true);
    };

    return (
        <Xwrapper>
            <div className="status-bar">
                <span className="status-logo">DeadIt</span>
                <span>{speeches.length} S | {choices.length} C</span>
                {hasUnsaved && <span style={{ color: 'orange' }}> ● Unsaved Changes</span>}
            </div>

            <div className="editor-layout">
                <div
                    ref={viewportRef}
                    className="viewport"
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onContextMenu={(e) => { e.preventDefault(); setSpawnCoords(toCanvas(e.clientX, e.clientY)); setShowMenu(true); }}
                >
                    <div className="canvas" style={{ width: 5000, height: 5000, position: 'relative' }}>
                        {showMenu && (
                            <DynamicMenu
                                style={{ top: spawnCoords.y, left: spawnCoords.x }}
                                onSpawmSpeech={() => spawnNode('speech')}
                                onSpawnChoice={() => spawnNode('choice')}
                            />
                        )}

                        {speeches.map(s => (
                            <Speech
                                key={`s-${s.number}`}
                                style={{ position: 'absolute', top: s.coords.y, left: s.coords.x }}
                                number={s.number}
                                data={s}
                                onChange={(num, f, v) => handleNodeChange(num, f, v, 'speech')}
                                onClickAnchor={(e) => arrowStart ? (setArrows([...arrows, { start: arrowStart, end: e.target.id }]), setArrowStart(null)) : setArrowStart(e.target.id)}
                                onDragStart={(e) => handleNodeDragStart(e, 'speech', s.number)}
                                isSelected={selectedNodes.has(`speech-${s.number}`)}
                                onSelect={() => setSelectedNodes(new Set([`speech-${s.number}`]))}
                                onDelete={() => deleteNode('speech', s.number)}
                            />
                        ))}

                        {choices.map(c => (
                            <Choice
                                key={`c-${c.number}`}
                                style={{ position: 'absolute', top: c.coords.y, left: c.coords.x }}
                                number={c.number}
                                data={c}
                                onChange={(num, f, v) => handleNodeChange(num, f, v, 'choice')}
                                onClickAnchor={(e) => arrowStart ? (setArrows([...arrows, { start: arrowStart, end: e.target.id }]), setArrowStart(null)) : setArrowStart(e.target.id)}
                                onDragStart={(e) => handleNodeDragStart(e, 'choice', c.number)}
                                isSelected={selectedNodes.has(`choice-${c.number}`)}
                                onSelect={() => setSelectedNodes(new Set([`choice-${c.number}`]))}
                                onDelete={() => deleteNode('choice', c.number)}
                            />
                        ))}

                        {arrows.map((a, i) => (
                            <Xarrow
                                key={`arrow-${i}`}
                                start={a.start}
                                end={a.end}
                                color="white"
                                strokeWidth={2}
                                curveness={0.3}
                            />
                        ))}
                    </div>
                </div>

                <Outliner
                    speeches={speeches} choices={choices} arrows={arrows}
                    selectedNodes={selectedNodes}
                    onSelectNode={(k) => setSelectedNodes(new Set([k]))}
                    onFocusNode={(t, n) => {
                        const node = (t === 'speech' ? speeches : choices).find(x => x.number === n);
                        viewportRef.current.scrollTo({ left: node.coords.x - 200, top: node.coords.y - 200, behavior: 'smooth' });
                    }}
                    onDeleteNode={deleteNode}
                    onDeleteArrow={(idx) => setArrows(arrows.filter((_, i) => i !== idx))}
                />
            </div>
            <SendButton onClick={sendData} hasUnsavedChanges={hasUnsaved} nodeCount={speeches.length + choices.length} />
        </Xwrapper>
    );
};

export default ContentCreation;