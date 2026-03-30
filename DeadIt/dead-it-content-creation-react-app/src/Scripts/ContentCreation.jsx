import axios from 'axios';
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import DynamicMenu from './InterfaceComponents/DynamicMenu';
import Speech from './InterfaceComponents/Speech';
import Choice from './InterfaceComponents/Choice';
import Xarrow, { useXarrow, Xwrapper } from 'react-xarrows';
import SendButton from './InterfaceComponents/SendButton';
import './InterfaceComponents/Styles/MainScreen.css';

const CANVAS_SIZE = 5000;
const MINIMAP_W = 200;
const MINIMAP_H = 130;
const MM_SCALE = MINIMAP_W / CANVAS_SIZE;

// ─── Templates ───────────────────────────────────────────────────────────────
// Горизонт: 450px между X-координатами нод. Вертикаль: 320px между рядами.
// Обе величины с запасом перекрывают реальные размеры нод.
const TEMPLATES = [
    {
        label: 'Linear',
        icon: '→',
        hint: 'Simple speech chain with choices',
        build: (ox, oy, ns, nc) => ({
            speeches: [
                { number: ns + 1, coords: { x: ox, y: oy } },
                { number: ns + 2, coords: { x: ox + 450, y: oy } },
                { number: ns + 3, coords: { x: ox + 900, y: oy } },
            ],
            choices: [
                { number: nc + 1, coords: { x: ox + 100, y: oy + 320 } },
                { number: nc + 2, coords: { x: ox + 550, y: oy + 320 } },
            ],
            arrows: [
                { start: `speech-right-${ns + 1}-anchor`, end: `choice-left-${nc + 1}-anchor` },
                { start: `choice-right-${nc + 1}-anchor`, end: `speech-left-${ns + 2}-anchor` },
                { start: `speech-right-${ns + 2}-anchor`, end: `choice-left-${nc + 2}-anchor` },
                { start: `choice-right-${nc + 2}-anchor`, end: `speech-left-${ns + 3}-anchor` },
            ],
        }),
    },
    {
        label: 'Branch',
        icon: '⑂',
        hint: 'One speech splits into two branches',
        build: (ox, oy, ns, nc) => ({
            speeches: [
                { number: ns + 1, coords: { x: ox + 230, y: oy } },
                { number: ns + 2, coords: { x: ox, y: oy + 640 } },
                { number: ns + 3, coords: { x: ox + 460, y: oy + 640 } },
            ],
            choices: [
                { number: nc + 1, coords: { x: ox, y: oy + 320 } },
                { number: nc + 2, coords: { x: ox + 460, y: oy + 320 } },
            ],
            arrows: [
                { start: `speech-right-${ns + 1}-anchor`, end: `choice-left-${nc + 1}-anchor` },
                { start: `speech-right-${ns + 1}-anchor`, end: `choice-left-${nc + 2}-anchor` },
                { start: `choice-right-${nc + 1}-anchor`, end: `speech-left-${ns + 2}-anchor` },
                { start: `choice-right-${nc + 2}-anchor`, end: `speech-left-${ns + 3}-anchor` },
            ],
        }),
    },
    {
        label: 'Loop',
        icon: '↺',
        hint: 'Cyclic dialogue with return path',
        build: (ox, oy, ns, nc) => ({
            speeches: [
                { number: ns + 1, coords: { x: ox + 230, y: oy } },
                { number: ns + 2, coords: { x: ox + 230, y: oy + 640 } },
                { number: ns + 3, coords: { x: ox + 230, y: oy + 1280 } },
            ],
            choices: [
                { number: nc + 1, coords: { x: ox, y: oy + 320 } },
                { number: nc + 2, coords: { x: ox + 460, y: oy + 960 } },
            ],
            arrows: [
                { start: `speech-right-${ns + 1}-anchor`, end: `choice-left-${nc + 1}-anchor` },
                { start: `choice-right-${nc + 1}-anchor`, end: `speech-left-${ns + 2}-anchor` },
                { start: `speech-right-${ns + 2}-anchor`, end: `choice-left-${nc + 2}-anchor` },
                { start: `choice-right-${nc + 2}-anchor`, end: `speech-left-${ns + 3}-anchor` },
                { start: `speech-left-${ns + 3}-anchor`, end: `speech-right-${ns + 1}-anchor` },
            ],
        }),
    },
];

// ─── Minimap ─────────────────────────────────────────────────────────────────
const Minimap = ({ speeches, choices, arrows, viewportRef }) => {
    const [vp, setVp] = useState({ x: 0, y: 0, w: 0, h: 0 });

    useEffect(() => {
        const el = viewportRef.current;
        if (!el) return;
        const update = () =>
            setVp({ x: el.scrollLeft, y: el.scrollTop, w: el.clientWidth, h: el.clientHeight });
        update();
        el.addEventListener('scroll', update);
        window.addEventListener('resize', update);
        return () => {
            el.removeEventListener('scroll', update);
            window.removeEventListener('resize', update);
        };
    }, [viewportRef]);

    const handleClick = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const cx = (e.clientX - rect.left) / MM_SCALE;
        const cy = (e.clientY - rect.top) / MM_SCALE;
        const el = viewportRef.current;
        el.scrollLeft = cx - el.clientWidth / 2;
        el.scrollTop = cy - el.clientHeight / 2;
    };

    const vpRect = {
        x: vp.x * MM_SCALE,
        y: vp.y * MM_SCALE,
        w: vp.w * MM_SCALE,
        h: vp.h * MM_SCALE,
    };

    return (
        <div className="minimap" onClick={handleClick} title="Click to navigate">
            <div className="minimap-label">Minimap</div>
            <svg width={MINIMAP_W} height={MINIMAP_H} style={{ display: 'block', cursor: 'crosshair' }}>
                {/* connections */}
                {arrows.map((a, i) => {
                    const sp = a.start.split('-');
                    const ep = a.end.split('-');
                    const sn = (sp[0] === 'speech' ? speeches : choices).find(n => n.number === parseInt(sp[2]));
                    const en = (ep[0] === 'speech' ? speeches : choices).find(n => n.number === parseInt(ep[2]));
                    if (!sn || !en) return null;
                    return (
                        <line key={i}
                            x1={(sn.coords.x + 140) * MM_SCALE} y1={(sn.coords.y + 65) * MM_SCALE}
                            x2={(en.coords.x + 140) * MM_SCALE} y2={(en.coords.y + 65) * MM_SCALE}
                            stroke="rgba(140,140,200,0.25)" strokeWidth={0.8}
                        />
                    );
                })}
                {/* speech nodes */}
                {speeches.map(s => (
                    <rect key={s.number}
                        x={s.coords.x * MM_SCALE} y={s.coords.y * MM_SCALE}
                        width={280 * MM_SCALE} height={130 * MM_SCALE}
                        rx={1} fill="rgba(79,142,247,0.35)" stroke="rgba(79,142,247,0.6)" strokeWidth={0.5}
                    />
                ))}
                {/* choice nodes */}
                {choices.map(c => (
                    <rect key={c.number}
                        x={c.coords.x * MM_SCALE} y={c.coords.y * MM_SCALE}
                        width={280 * MM_SCALE} height={130 * MM_SCALE}
                        rx={1} fill="rgba(247,162,62,0.3)" stroke="rgba(247,162,62,0.55)" strokeWidth={0.5}
                    />
                ))}
                {/* viewport rect */}
                <rect
                    x={vpRect.x} y={vpRect.y} width={vpRect.w} height={vpRect.h}
                    fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.2)" strokeWidth={0.8} rx={1}
                />
            </svg>
        </div>
    );
};

// ─── Outliner ─────────────────────────────────────────────────────────────────
const Outliner = ({
    speeches, choices, arrows, selectedNodes,
    onSelectNode, onFocusNode, onDeleteNode, onDeleteArrow,
}) => {
    const allNodes = [
        ...speeches.map(s => ({ type: 'speech', number: s.number })),
        ...choices.map(c => ({ type: 'choice', number: c.number })),
    ].sort((a, b) => a.type.localeCompare(b.type) || a.number - b.number);

    const getOutgoing = (type, number) =>
        arrows.reduce((acc, a, i) => {
            if (
                a.start === `${type}-right-${number}-anchor` ||
                a.start === `${type}-left-${number}-anchor`
            ) {
                const p = a.end.split('-');
                acc.push({ index: i, endType: p[0], endNum: parseInt(p[2]) });
            }
            return acc;
        }, []);

    const incomingCount = (type, number) =>
        arrows.filter(
            a =>
                a.end === `${type}-right-${number}-anchor` ||
                a.end === `${type}-left-${number}-anchor`,
        ).length;

    return (
        <aside className="outliner">
            <div className="outliner-header">
                <span className="outliner-title">Outliner</span>
                <span className="outliner-count">{allNodes.length}</span>
            </div>

            <div className="outliner-body">
                {allNodes.length === 0 && (
                    <div className="outliner-empty">Right-click canvas<br />to add nodes</div>
                )}
                {allNodes.map(({ type, number }) => {
                    const key = `${type}-${number}`;
                    const isSel = selectedNodes.has(key);
                    const outgoing = getOutgoing(type, number);
                    const incoming = incomingCount(type, number);
                    return (
                        <div key={key} className={`outliner-item${isSel ? ' outliner-item-selected' : ''}`}>
                            <div
                                className="outliner-item-row"
                                onClick={(e) => onSelectNode(key, e.shiftKey)}
                            >
                                <span className={`outliner-badge outliner-badge-${type}`}>
                                    {type === 'speech' ? 'S' : 'C'}
                                </span>
                                <span className="outliner-label">
                                    {type}<span className="outliner-num"> #{number}</span>
                                </span>
                                <span className="outliner-meta">
                                    {incoming > 0 && <span title="incoming">↙{incoming}</span>}
                                    {outgoing.length > 0 && <span title="outgoing">↗{outgoing.length}</span>}
                                </span>
                                <button
                                    className="outliner-btn"
                                    onClick={(e) => { e.stopPropagation(); onFocusNode(type, number); }}
                                    title="Focus"
                                >⌖</button>
                                <button
                                    className="outliner-btn outliner-btn-del"
                                    onClick={(e) => { e.stopPropagation(); onDeleteNode(type, number); }}
                                    title="Delete"
                                >×</button>
                            </div>
                            {outgoing.map(({ index, endType, endNum }) => (
                                <div key={index} className="outliner-conn">
                                    <span className="outliner-conn-arrow">→</span>
                                    <span
                                        className={`outliner-badge outliner-badge-${endType}`}
                                        style={{ fontSize: 8, padding: '1px 4px' }}
                                    >
                                        {endType === 'speech' ? 'S' : 'C'}
                                    </span>
                                    <span className="outliner-conn-label">{endType} #{endNum}</span>
                                    <button
                                        className="outliner-btn outliner-btn-del"
                                        onClick={() => onDeleteArrow(index)}
                                        title="Delete connection"
                                    >×</button>
                                </div>
                            ))}
                        </div>
                    );
                })}
            </div>

            {selectedNodes.size > 1 && (
                <div className="outliner-footer">{selectedNodes.size} nodes selected</div>
            )}
        </aside>
    );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
const ContentCreation = () => {
    const [showMenu, setShowMenu] = useState(false);
    const [spawnCoords, setSpawnCoords] = useState({ x: 300, y: 300 });
    const [speeches, setSpeeches] = useState([]);
    const [choices, setChoices] = useState([]);
    const [numberSpeech, setNumberSpeech] = useState(0);
    const [numberChoice, setNumberChoice] = useState(0);
    const [arrowStart, setArrowStart] = useState(null);
    const [arrows, setArrows] = useState([]);
    const [hasUnsaved, setHasUnsaved] = useState(false);
    const [selectedNodes, setSelectedNodes] = useState(new Set());
    const [marquee, setMarquee] = useState(null);
    const [mouseCanvas, setMouseCanvas] = useState({ x: -9999, y: -9999 });

    const viewportRef = useRef();
    const updateXarrow = useXarrow();
    const dragRef = useRef(null);
    const isMarqueeRef = useRef(false);

    const API_URL = 'http://localhost:5181/api/ContentCreation';

    // ── Load initial data from server ─────────────────────────────
    useEffect(() => {
        const load = async () => {
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
                        coords: { x: item.x ?? 300, y: item.y ?? 300 },
                        name: item.name,
                        text: item.text,
                        type: item.type,
                        isFirst: item.isFirst,
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
                            const parts = nextId.split('-');
                            const targetType = parts[0].toLowerCase().includes('speech') ? 'speech' : 'choice';
                            const targetNum = parts[1];
                            newArrows.push({
                                start: `${baseType}-right-${num}-anchor`,
                                end: `${targetType}-left-${targetNum}-anchor`,
                            });
                        });
                    }
                });

                setSpeeches(loadedSpeeches);
                setChoices(loadedChoices);
                setArrows(newArrows);
                setNumberSpeech(maxS);
                setNumberChoice(maxC);
            } catch (err) { console.error('Load error:', err); }
        };
        load();
    }, []);

    // ── Xarrow: update on scroll ──────────────────────────────────
    // Отдельный effect, чтобы не re-registrировать listener при каждом рендере
    useEffect(() => {
        const el = viewportRef.current;
        if (!el) return;
        const onScroll = () => updateXarrow();
        el.addEventListener('scroll', onScroll, { passive: true });
        return () => el.removeEventListener('scroll', onScroll);
    }, [updateXarrow]);

    // ── Node field change (state-driven, no DOM reads) ────────────
    const handleNodeChange = useCallback((number, field, value, nodeType) => {
        const setter = nodeType === 'speech' ? setSpeeches : setChoices;
        setter(prev => prev.map(n => n.number === number ? { ...n, [field]: value } : n));
        setHasUnsaved(true);
    }, []);

    // ── Canvas coordinate helper ──────────────────────────────────
    const toCanvas = useCallback((clientX, clientY) => {
        const vp = viewportRef.current;
        return { x: clientX + vp.scrollLeft, y: clientY + vp.scrollTop };
    }, []);

    // ── Selection (with shift multi-select) ──────────────────────
    const selectNode = useCallback((key, shift) => {
        if (shift) {
            setSelectedNodes(prev => {
                const n = new Set(prev);
                n.has(key) ? n.delete(key) : n.add(key);
                return n;
            });
        } else {
            setSelectedNodes(new Set([key]));
        }
    }, []);

    // ── Delete node ───────────────────────────────────────────────
    // FIX: точное совпадение обоих якорей (left + right), а не substring.
    // Это гарантирует удаление всех входящих и исходящих стрелок ноды.
    const deleteNode = useCallback((type, number) => {
        const anchors = [
            `${type}-right-${number}-anchor`,
            `${type}-left-${number}-anchor`,
        ];
        setArrows(prev => prev.filter(a => !anchors.includes(a.start) && !anchors.includes(a.end)));
        if (type === 'speech') setSpeeches(prev => prev.filter(s => s.number !== number));
        else setChoices(prev => prev.filter(c => c.number !== number));
        setSelectedNodes(prev => { const n = new Set(prev); n.delete(`${type}-${number}`); return n; });
        setHasUnsaved(true);
    }, []);

    const deleteArrow = useCallback((index) => {
        setArrows(prev => prev.filter((_, i) => i !== index));
        setHasUnsaved(true);
    }, []);

    const deleteSelected = useCallback(() => {
        // Снапшот ключей до начала удаления
        const keys = [...selectedNodes];
        keys.forEach(key => {
            const idx = key.lastIndexOf('-');
            deleteNode(key.slice(0, idx), parseInt(key.slice(idx + 1)));
        });
    }, [selectedNodes, deleteNode]);

    // ── Focus node (scroll to it) ─────────────────────────────────
    const focusNode = useCallback((type, number) => {
        const node = (type === 'speech' ? speeches : choices).find(n => n.number === number);
        if (!node || !viewportRef.current) return;
        const vp = viewportRef.current;
        vp.scrollTo({
            left: node.coords.x - (vp.clientWidth - 280) / 2,
            top: node.coords.y - (vp.clientHeight - 36) / 2,
            behavior: 'smooth',
        });
    }, [speeches, choices]);

    // ── Apply template ────────────────────────────────────────────
    // ВАЖНО: не вкладываем setState в updater другого setState — это антипаттерн.
    // Читаем numberSpeech/numberChoice напрямую из closure (они в deps),
    // React 18 батчит все вызовы setState в одном обработчике события.
    const applyTemplate = useCallback((tpl) => {
        const vp = viewportRef.current;
        const ox = Math.max(100, vp.scrollLeft + (vp.clientWidth - 280) / 2 - 180);
        const oy = Math.max(100, vp.scrollTop + (vp.clientHeight - 36) / 2 - 200);

        const { speeches: ns, choices: nc, arrows: na } = tpl.build(ox, oy, numberSpeech, numberChoice);
        const defaults = { name: '', text: '', type: 'Text' };

        setNumberSpeech(numberSpeech + ns.length);
        setNumberChoice(numberChoice + nc.length);
        setSpeeches(prev => [...prev, ...ns.map(s => ({ ...defaults, ...s }))]);
        setChoices(prev => [...prev, ...nc.map(c => ({ ...defaults, ...c }))]);
        setArrows(prev => [...prev, ...na]);
        setHasUnsaved(true);
    }, [numberSpeech, numberChoice]);

    // ── Canvas mouse down → marquee start ────────────────────────
    const handleCanvasMouseDown = (e) => {
        if (e.button !== 0) return;
        const isCanvas =
            e.target === viewportRef.current ||
            e.target.classList.contains('canvas');
        if (!isCanvas) return;
        setSelectedNodes(new Set());
        const { x, y } = toCanvas(e.clientX, e.clientY);
        isMarqueeRef.current = true;
        setMarquee({ startX: x, startY: y, endX: x, endY: y });
    };

    // ── Node drag start ───────────────────────────────────────────
    // Блокируем drag с input/select/button, чтобы не мешать вводу текста
    const handleNodeDragStart = useCallback((e, type, number) => {
        if (e.button !== 0) return;
        const tag = e.target.tagName;
        if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA' || tag === 'BUTTON') return;
        e.stopPropagation();
        e.preventDefault();
        isMarqueeRef.current = false;
        setMarquee(null);

        const key = `${type}-${number}`;
        const { x: startX, y: startY } = toCanvas(e.clientX, e.clientY);
        const activeSelection = selectedNodes.has(key) ? selectedNodes : new Set([key]);
        if (!selectedNodes.has(key)) setSelectedNodes(new Set([key]));

        const nodes = [...activeSelection].map(k => {
            const idx = k.lastIndexOf('-');
            const t = k.slice(0, idx);
            const n = parseInt(k.slice(idx + 1));
            const found = (t === 'speech' ? speeches : choices).find(x => x.number === n);
            return found ? { type: t, number: n, initX: found.coords.x, initY: found.coords.y } : null;
        }).filter(Boolean);

        dragRef.current = { startX, startY, nodes };
    }, [selectedNodes, speeches, choices, toCanvas]);

    // ── Mouse move ────────────────────────────────────────────────
    const handleMouseMove = useCallback((e) => {
        if (!viewportRef.current) return;
        const { x: cx, y: cy } = toCanvas(e.clientX, e.clientY);
        // Всегда обновляем позицию мыши (нужно для ghost arrow)
        setMouseCanvas({ x: cx, y: cy });

        if (dragRef.current) {
            const dx = cx - dragRef.current.startX;
            const dy = cy - dragRef.current.startY;
            const su = {}, cu = {};
            dragRef.current.nodes.forEach(({ type, number, initX, initY }) => {
                if (type === 'speech') su[number] = { x: initX + dx, y: initY + dy };
                else cu[number] = { x: initX + dx, y: initY + dy };
            });
            if (Object.keys(su).length)
                setSpeeches(prev => prev.map(s => su[s.number] ? { ...s, coords: su[s.number] } : s));
            if (Object.keys(cu).length)
                setChoices(prev => prev.map(c => cu[c.number] ? { ...c, coords: cu[c.number] } : c));
            // Пересчитываем стрелки во время движения
            updateXarrow();
            return;
        }

        if (isMarqueeRef.current) {
            setMarquee(m => m ? { ...m, endX: cx, endY: cy } : null);
            return;
        }

        if (!showMenu) setSpawnCoords({ x: cx, y: cy });
    }, [showMenu, toCanvas, updateXarrow]);

    // ── Mouse up ──────────────────────────────────────────────────
    const handleMouseUp = useCallback(() => {
        if (dragRef.current) {
            setHasUnsaved(true);
            // Небольшая задержка — DOM гарантированно обновился, стрелки встают на место
            setTimeout(updateXarrow, 10);
            dragRef.current = null;
        }

        if (isMarqueeRef.current && marquee) {
            const minX = Math.min(marquee.startX, marquee.endX);
            const maxX = Math.max(marquee.startX, marquee.endX);
            const minY = Math.min(marquee.startY, marquee.endY);
            const maxY = Math.max(marquee.startY, marquee.endY);

            if ((maxX - minX) + (maxY - minY) > 10) {
                const sel = new Set();
                speeches.forEach(s => {
                    if (s.coords.x >= minX && s.coords.x <= maxX &&
                        s.coords.y >= minY && s.coords.y <= maxY)
                        sel.add(`speech-${s.number}`);
                });
                choices.forEach(c => {
                    if (c.coords.x >= minX && c.coords.x <= maxX &&
                        c.coords.y >= minY && c.coords.y <= maxY)
                        sel.add(`choice-${c.number}`);
                });
                setSelectedNodes(sel);
            }
        }

        isMarqueeRef.current = false;
        setMarquee(null);
    }, [marquee, speeches, choices, updateXarrow]);

    // ── Context menu ──────────────────────────────────────────────
    const onContextMenu = (e) => { e.preventDefault(); setShowMenu(true); };
    const hideMenu = (e) => {
        const cls = typeof e.target.className === 'string' ? e.target.className : '';
        if (!cls.includes('button-menu') && !cls.includes('context-menu')) setShowMenu(false);
    };

    // ── Spawn nodes ───────────────────────────────────────────────
    const spawnSpeech = () => {
        setShowMenu(false);
        const n = numberSpeech + 1;
        setNumberSpeech(n);
        setSpeeches(prev => [...prev, { number: n, coords: spawnCoords, name: '', text: '', type: 'Text' }]);
        setHasUnsaved(true);
    };
    const spawnChoice = () => {
        setShowMenu(false);
        const n = numberChoice + 1;
        setNumberChoice(n);
        setChoices(prev => [...prev, { number: n, coords: spawnCoords, name: '', text: '', type: 'Text' }]);
        setHasUnsaved(true);
    };

    // ── Arrow connections ─────────────────────────────────────────
    // startArrowing — начать соединение с якоря
    // endArrowing   — завершить на другом якоре (защита от self-loop и дублей)
    const startArrowing = useCallback((e) => {
        e.stopPropagation();
        setArrowStart(e.target.id);
    }, []);

    const endArrowing = useCallback((e) => {
        e.stopPropagation();
        if (arrowStart && e.target.id && arrowStart !== e.target.id) {
            const dup = arrows.some(a => a.start === arrowStart && a.end === e.target.id);
            if (!dup) {
                setArrows(prev => [...prev, { start: arrowStart, end: e.target.id }]);
                setHasUnsaved(true);
            }
        }
        setArrowStart(null);
    }, [arrowStart, arrows]);

    // ── Keyboard shortcuts ────────────────────────────────────────
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === 'Escape') {
                setSelectedNodes(new Set());
                setArrowStart(null);
                setShowMenu(false);
            }
            if ((e.key === 'Delete' || e.key === 'Backspace') && selectedNodes.size > 0) {
                const tag = document.activeElement.tagName;
                if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
                deleteSelected();
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [selectedNodes, deleteSelected]);

    // ── Gather data for API ───────────────────────────────────────
    const gatherData = useCallback(() => {
        const result = [];
        speeches.forEach(s => {
            const next = arrows
                .filter(a => a.start === `speech-right-${s.number}-anchor`)
                .map(a => { const p = a.end.split('-'); return `${p[0]}-${p[2]}`; });
            result.push({
                id: `speech-${s.number}`,
                type: 'speech',
                name: s.name,
                text: s.text,
                x: s.coords.x,
                y: s.coords.y,
                isFirst: s.isFirst,
                nextIds: next.length ? next : null,
            });
        });
        choices.forEach(c => {
            const next = arrows
                .filter(a => a.start === `choice-right-${c.number}-anchor`)
                .map(a => { const p = a.end.split('-'); return `${p[0]}-${p[2]}`; });
            result.push({
                id: `choice-${c.number}`,
                type: c.type || 'Text',
                name: c.name,
                text: c.text,
                x: c.coords.x,
                y: c.coords.y,
                nextIds: next.length ? next : null,
            });
        });
        return result;
    }, [speeches, choices, arrows]);

    // ── Send data ─────────────────────────────────────────────────
    const sendData = useCallback(async () => {
        try {
            await axios.post(`${API_URL}/PostData`, gatherData());
            setHasUnsaved(false);
        } catch (err) { console.error('Send error:', err); }
    }, [gatherData]);

    useEffect(() => {
        const id = setInterval(() => { if (hasUnsaved) sendData(); }, 15000);
        return () => clearInterval(id);
    }, [hasUnsaved, sendData]);

    // ── Marquee screen-space rect (для overlay div) ───────────────
    const marqueeRect = useMemo(() => {
        if (!marquee || !viewportRef.current) return null;
        const vp = viewportRef.current;
        const x1 = marquee.startX - vp.scrollLeft;
        const y1 = marquee.startY - vp.scrollTop + 36; // компенсируем status bar
        const x2 = marquee.endX - vp.scrollLeft;
        const y2 = marquee.endY - vp.scrollTop + 36;
        const w = Math.abs(x2 - x1);
        const h = Math.abs(y2 - y1);
        if (w + h < 6) return null;
        return { left: Math.min(x1, x2), top: Math.min(y1, y2), width: w, height: h };
    }, [marquee]);

    // ── Фильтр валидных стрелок ───────────────────────────────────
    // Xarrow падает если DOM-элемент с нужным ID не существует.
    // Это происходит в кадре между удалением ноды из state и удалением из DOM —
    // результат: рендер ломается и нода визуально "зависает" некликабельной.
    // Решение: рендерить только стрелки, у которых оба эндпоинта живы в state.
    const validArrows = useMemo(() => {
        const speechNums = new Set(speeches.map(s => s.number));
        const choiceNums = new Set(choices.map(c => c.number));
        return arrows.filter(a => {
            const sp = a.start.split('-'); // [type, side, num, anchor]
            const ep = a.end.split('-');
            const sNum = parseInt(sp[2]);
            const eNum = parseInt(ep[2]);
            const sOk = sp[0] === 'speech' ? speechNums.has(sNum) : choiceNums.has(sNum);
            const eOk = ep[0] === 'speech' ? speechNums.has(eNum) : choiceNums.has(eNum);
            return sOk && eOk;
        });
    }, [arrows, speeches, choices]);

    const cursor = dragRef.current ? 'grabbing' : arrowStart ? 'crosshair' : 'default';

    return (
        <Xwrapper>
            {/* ── Status bar ── */}
            <div className="status-bar">
                <span className="status-logo">DeadIt</span>
                <span className="status-divider" />
                <span className="status-item">
                    <span className="status-dot blue" />{speeches.length} speech
                </span>
                <span className="status-item">
                    <span className="status-dot amber" />{choices.length} choice
                </span>
                <span className="status-item">
                    <span className="status-dot dim" />{arrows.length} connections
                </span>
                {hasUnsaved && (
                    <span className="status-item" style={{ color: '#f7a23e', marginLeft: 'auto' }}>
                        ● unsaved
                    </span>
                )}
                {selectedNodes.size > 0 && !arrowStart && (
                    <span className="status-item status-sel">
                        ◈ {selectedNodes.size} selected · Del to delete
                    </span>
                )}
                {arrowStart && (
                    <span className="status-item status-conn">
                        ✦ click anchor to connect · Esc to cancel
                    </span>
                )}
            </div>

            {/* ── Marquee overlay ── */}
            {marqueeRect && (
                <div
                    className="marquee"
                    style={{ position: 'fixed', pointerEvents: 'none', zIndex: 599, ...marqueeRect }}
                />
            )}

            <div className="editor-layout">
                {/* ── Canvas viewport ── */}
                <div
                    ref={viewportRef}
                    className="viewport"
                    style={{ cursor }}
                    onMouseDown={handleCanvasMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onContextMenu={onContextMenu}
                    onClick={hideMenu}
                >
                    <div className="canvas" style={{ width: CANVAS_SIZE, height: CANVAS_SIZE, position: 'relative' }}>
                        {showMenu && (
                            <DynamicMenu
                                style={{ top: spawnCoords.y, left: spawnCoords.x }}
                                onSpawmSpeech={spawnSpeech}
                                onSpawnChoice={spawnChoice}
                            />
                        )}

                        {speeches.map(s => (
                            <Speech
                                key={s.number}
                                style={{ position: 'absolute', top: s.coords.y, left: s.coords.x }}
                                number={s.number}
                                data={s}
                                onChange={(num, f, v) => handleNodeChange(num, f, v, 'speech')}
                                onClickAnchor={arrowStart === null ? startArrowing : endArrowing}
                                onDragStart={(e) => handleNodeDragStart(e, 'speech', s.number)}
                                isSelected={selectedNodes.has(`speech-${s.number}`)}
                                onSelect={(e) => { e.stopPropagation(); selectNode(`speech-${s.number}`, e.shiftKey); }}
                                onDelete={() => deleteNode('speech', s.number)}
                            />
                        ))}

                        {choices.map(c => (
                            <Choice
                                key={c.number}
                                style={{ position: 'absolute', top: c.coords.y, left: c.coords.x }}
                                number={c.number}
                                data={c}
                                onChange={(num, f, v) => handleNodeChange(num, f, v, 'choice')}
                                onClickAnchor={arrowStart === null ? startArrowing : endArrowing}
                                onDragStart={(e) => handleNodeDragStart(e, 'choice', c.number)}
                                isSelected={selectedNodes.has(`choice-${c.number}`)}
                                onSelect={(e) => { e.stopPropagation(); selectNode(`choice-${c.number}`, e.shiftKey); }}
                                onDelete={() => deleteNode('choice', c.number)}
                            />
                        ))}

                        {/* Постоянные стрелки — только с валидными эндпоинтами */}
                        {validArrows.map((a) => (
                            <Xarrow
                                key={`${a.start}::${a.end}`}
                                start={a.start}
                                end={a.end}
                                color="rgba(140,140,200,0.55)"
                                strokeWidth={1.5}
                                headSize={6}
                                curveness={0.3}
                            />
                        ))}

                        {/* Ghost arrow — следует за курсором при соединении */}
                        {arrowStart && (
                            <>
                                <div
                                    id="ghost-arrow-target"
                                    style={{
                                        position: 'absolute',
                                        left: mouseCanvas.x,
                                        top: mouseCanvas.y,
                                        width: 1,
                                        height: 1,
                                        pointerEvents: 'none',
                                    }}
                                />
                                <Xarrow
                                    start={arrowStart}
                                    end="ghost-arrow-target"
                                    color="rgba(160,160,240,0.75)"
                                    strokeWidth={1.5}
                                    headSize={5}
                                    curveness={0.3}
                                    dashness={{ strokeLen: 6, nonStrokeLen: 4, animation: 1 }}
                                />
                            </>
                        )}
                    </div>
                </div>

                {/* ── Outliner ── */}
                <Outliner
                    speeches={speeches}
                    choices={choices}
                    arrows={arrows}
                    selectedNodes={selectedNodes}
                    onSelectNode={selectNode}
                    onFocusNode={focusNode}
                    onDeleteNode={deleteNode}
                    onDeleteArrow={deleteArrow}
                />
            </div>

            {/* ── Bottom-left: Templates + Minimap ── */}
            <div className="bottom-left-panel">
                <div className="templates-panel">
                    <div className="templates-label">Templates</div>
                    <div className="templates-row">
                        {TEMPLATES.map(tpl => (
                            <button
                                key={tpl.label}
                                className="template-btn"
                                onClick={() => applyTemplate(tpl)}
                                title={tpl.hint}
                            >
                                <span className="template-btn-icon">{tpl.icon}</span>
                                <span className="template-btn-label">{tpl.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
                <Minimap
                    speeches={speeches}
                    choices={choices}
                    arrows={arrows}
                    viewportRef={viewportRef}
                />
            </div>

            {/* ── Hint bar ── */}
            <div className="hint-bar">
                right-click → add &nbsp;·&nbsp; drag header → move &nbsp;·&nbsp; drag canvas → marquee
                &nbsp;·&nbsp; Shift+click → multi-select &nbsp;·&nbsp; anchor → connect &nbsp;·&nbsp; Del → delete
            </div>

            <SendButton
                id="sendButton"
                onClick={sendData}
                hasUnsavedChanges={hasUnsaved}
                nodeCount={speeches.length + choices.length}
            />
        </Xwrapper>
    );
};

export default ContentCreation;
