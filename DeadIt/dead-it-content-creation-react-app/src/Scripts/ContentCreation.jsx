import axios from 'axios';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import DynamicMenu from './InterfaceComponents/DynamicMenu';
import Speech from './InterfaceComponents/Speech';
import Choice from './InterfaceComponents/Choice';
import Xarrow, { useXarrow, Xwrapper } from 'react-xarrows';
import SendButton from './InterfaceComponents/SendButton';
import './InterfaceComponents/Styles/MainScreen.css';

// ─── helpers ────────────────────────────────────────────────────────────────
const parseAnchorId = (id) => {
  // "speech-right-1-anchor" → { type: 'speech', number: 1 }
  const parts = id.split('-');
  return { type: parts[0], number: parseInt(parts[2]) };
};

// ─── Outliner ────────────────────────────────────────────────────────────────
const Outliner = ({ speeches, choices, arrows, selectedNodes, onSelectNode, onFocusNode, onDeleteNode, onDeleteArrow }) => {
  const allNodes = [
    ...speeches.map(s => ({ type: 'speech', number: s.number })),
    ...choices.map(c => ({ type: 'choice', number: c.number })),
  ].sort((a, b) => {
    if (a.type !== b.type) return a.type.localeCompare(b.type);
    return a.number - b.number;
  });

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
      a => a.end === `${type}-right-${number}-anchor` || a.end === `${type}-left-${number}-anchor`
    ).length;

  return (
    <aside className="outliner">
      <div className="outliner-header">
        <span className="outliner-title">Outliner</span>
        <span className="outliner-count">{allNodes.length}</span>
      </div>
      <div className="outliner-body">
        {allNodes.length === 0 && (
          <div className="outliner-empty">Right-click on canvas<br />to add nodes</div>
        )}
        {allNodes.map(({ type, number }) => {
          const key = `${type}-${number}`;
          const isSelected = selectedNodes.has(key);
          const outgoing = getOutgoing(type, number);
          const incoming = incomingCount(type, number);

          return (
            <div key={key} className={`outliner-item ${isSelected ? 'outliner-item-selected' : ''}`}>
              <div
                className="outliner-item-row"
                onClick={(e) => onSelectNode(key, e.shiftKey)}
              >
                <span className={`outliner-badge outliner-badge-${type}`}>
                  {type === 'speech' ? 'S' : 'C'}
                </span>
                <span className="outliner-label">
                  {type}
                  <span className="outliner-num"> #{number}</span>
                </span>
                <span className="outliner-meta">
                  {incoming > 0 && <span title="incoming">↙{incoming}</span>}
                  {outgoing.length > 0 && <span title="outgoing">↗{outgoing.length}</span>}
                </span>
                <button
                  className="outliner-btn"
                  onClick={(e) => { e.stopPropagation(); onFocusNode(type, number); }}
                  title="Focus on canvas"
                >⌖</button>
                <button
                  className="outliner-btn outliner-btn-del"
                  onClick={(e) => { e.stopPropagation(); onDeleteNode(type, number); }}
                  title="Delete node"
                >×</button>
              </div>

              {outgoing.map(({ index, endType, endNum }) => (
                <div key={index} className="outliner-conn">
                  <span className="outliner-conn-arrow">→</span>
                  <span className={`outliner-badge outliner-badge-${endType}`} style={{ fontSize: 8, padding: '1px 4px' }}>
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
        <div className="outliner-footer">
          {selectedNodes.size} nodes selected
        </div>
      )}
    </aside>
  );
};

// ─── Main ────────────────────────────────────────────────────────────────────
const ContentCreation = () => {
  const [showMenu, setShowMenu]           = useState(false);
  const [spawnCoords, setSpawnCoords]     = useState({ x: 300, y: 300 });
  const [speeches, setSpeeches]           = useState([]);
  const [choices, setChoices]             = useState([]);
  const [numberSpeech, setNumberSpeech]   = useState(0);
  const [numberChoice, setNumberChoice]   = useState(0);
  const [arrowStart, setArrowStart]       = useState(null);   // anchor id while connecting
  const [arrows, setArrows]               = useState([]);
  const [hasUnsaved, setHasUnsaved]       = useState(false);
  const [selectedNodes, setSelectedNodes] = useState(new Set());
  const [marquee, setMarquee]             = useState(null);   // canvas coords
  const [mouseCanvas, setMouseCanvas]     = useState({ x: -9999, y: -9999 });

  const viewportRef    = useRef();
  const updateXarrow   = useXarrow();
  const isPanRef       = useRef(false);
  const panStartRef    = useRef({ x: 0, y: 0 });
  const scrollStartRef = useRef({ left: 0, top: 0 });
  const dragRef        = useRef(null); // { startMouseCanvasX, startMouseCanvasY, nodes: [{type,number,initX,initY}] }
  const isMarqueeRef   = useRef(false);

  // ── helpers ──────────────────────────────────────────────────
  const toCanvas = useCallback((clientX, clientY) => {
    const vp = viewportRef.current;
    return { x: clientX + vp.scrollLeft, y: clientY + vp.scrollTop };
  }, []);

  // ── selection ────────────────────────────────────────────────
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

  // ── delete ───────────────────────────────────────────────────
  const deleteNode = useCallback((type, number) => {
    const anchors = [`${type}-right-${number}-anchor`, `${type}-left-${number}-anchor`];
    setArrows(prev => prev.filter(a => !anchors.includes(a.start) && !anchors.includes(a.end)));
    if (type === 'speech') setSpeeches(prev => prev.filter(s => s.number !== number));
    else                   setChoices(prev => prev.filter(c => c.number !== number));
    setSelectedNodes(prev => { const n = new Set(prev); n.delete(`${type}-${number}`); return n; });
    setHasUnsaved(true);
  }, []);

  const deleteArrow = useCallback((index) => {
    setArrows(prev => prev.filter((_, i) => i !== index));
    setHasUnsaved(true);
  }, []);

  const deleteSelected = useCallback(() => {
    selectedNodes.forEach(key => {
      const idx = key.lastIndexOf('-');
      deleteNode(key.slice(0, idx), parseInt(key.slice(idx + 1)));
    });
  }, [selectedNodes, deleteNode]);

  // ── focus node ───────────────────────────────────────────────
  const focusNode = useCallback((type, number) => {
    const node = (type === 'speech' ? speeches : choices).find(n => n.number === number);
    if (!node || !viewportRef.current) return;
    const vp = viewportRef.current;
    vp.scrollLeft = node.coords.x - (vp.clientWidth - 280) / 2 + 140;
    vp.scrollTop  = node.coords.y - vp.clientHeight / 2 + 80;
  }, [speeches, choices]);

  // ── canvas mouse down ────────────────────────────────────────
  const handleCanvasMouseDown = (e) => {
    if (e.button !== 0) return;
    const isCanvas = e.target === viewportRef.current || e.target.classList.contains('canvas');
    if (!isCanvas) return;

    const { x, y } = toCanvas(e.clientX, e.clientY);
    isMarqueeRef.current = true;
    setMarquee({ startX: x, startY: y, endX: x, endY: y });
    panStartRef.current    = { x: e.clientX, y: e.clientY };
    scrollStartRef.current = { left: viewportRef.current.scrollLeft, top: viewportRef.current.scrollTop };
  };

  // ── node drag start ──────────────────────────────────────────
  const handleNodeDragStart = useCallback((e, type, number) => {
    if (e.button !== 0) return;
    const tag = e.target.tagName;
    if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA' || tag === 'BUTTON') return;
    e.stopPropagation();
    e.preventDefault();

    const key = `${type}-${number}`;
    const { x: startX, y: startY } = toCanvas(e.clientX, e.clientY);

    // If node not in selection → select only it
    const activeSelection = selectedNodes.has(key) ? selectedNodes : new Set([key]);
    if (!selectedNodes.has(key)) setSelectedNodes(new Set([key]));

    const nodes = [...activeSelection].map(k => {
      const idx = k.lastIndexOf('-');
      const t = k.slice(0, idx);
      const n = parseInt(k.slice(idx + 1));
      const arr = (t === 'speech' ? speeches : choices).find(x => x.number === n);
      return arr ? { type: t, number: n, initX: arr.coords.x, initY: arr.coords.y } : null;
    }).filter(Boolean);

    dragRef.current = { startX, startY, nodes };
    isMarqueeRef.current = false;
    setMarquee(null);
  }, [selectedNodes, speeches, choices, toCanvas]);

  // ── mouse move ───────────────────────────────────────────────
  const handleMouseMove = useCallback((e) => {
    if (!viewportRef.current) return;
    const { x: cx, y: cy } = toCanvas(e.clientX, e.clientY);
    setMouseCanvas({ x: cx, y: cy });

    if (dragRef.current) {
      const dx = cx - dragRef.current.startX;
      const dy = cy - dragRef.current.startY;
      const su = {}, cu = {};
      dragRef.current.nodes.forEach(({ type, number, initX, initY }) => {
        if (type === 'speech') su[number] = { x: initX + dx, y: initY + dy };
        else                   cu[number] = { x: initX + dx, y: initY + dy };
      });
      if (Object.keys(su).length) setSpeeches(prev => prev.map(s => su[s.number] ? { ...s, coords: su[s.number] } : s));
      if (Object.keys(cu).length) setChoices(prev => prev.map(c => cu[c.number] ? { ...c, coords: cu[c.number] } : c));
      updateXarrow();
      return;
    }

    if (isMarqueeRef.current) {
      setMarquee(m => m ? { ...m, endX: cx, endY: cy } : null);
      return;
    }

    if (!showMenu) setSpawnCoords({ x: cx, y: cy });
  }, [showMenu, toCanvas, updateXarrow]);

  // ── mouse up ─────────────────────────────────────────────────
  const handleMouseUp = useCallback(() => {
    if (dragRef.current) {
      setHasUnsaved(true);
      dragRef.current = null;
    }

    if (isMarqueeRef.current && marquee) {
      const minX = Math.min(marquee.startX, marquee.endX);
      const maxX = Math.max(marquee.startX, marquee.endX);
      const minY = Math.min(marquee.startY, marquee.endY);
      const maxY = Math.max(marquee.startY, marquee.endY);
      const size = (maxX - minX) + (maxY - minY);

      if (size > 10) {
        const sel = new Set();
        speeches.forEach(s => {
          if (s.coords.x >= minX && s.coords.x <= maxX && s.coords.y >= minY && s.coords.y <= maxY)
            sel.add(`speech-${s.number}`);
        });
        choices.forEach(c => {
          if (c.coords.x >= minX && c.coords.x <= maxX && c.coords.y >= minY && c.coords.y <= maxY)
            sel.add(`choice-${c.number}`);
        });
        setSelectedNodes(sel);
      } else {
        setSelectedNodes(new Set());
      }
    }

    isMarqueeRef.current = false;
    isPanRef.current = false;
    setMarquee(null);
  }, [marquee, speeches, choices]);

  // ── context menu ─────────────────────────────────────────────
  const onContextMenu = (e) => { e.preventDefault(); setShowMenu(true); };
  const hideMenu = (e) => {
    const cls = typeof e.target.className === 'string' ? e.target.className : '';
    if (!cls.includes('button-menu') && !cls.includes('context-menu')) setShowMenu(false);
  };

  // ── spawn ────────────────────────────────────────────────────
  const spawnSpeech = () => {
    setShowMenu(false);
    const n = numberSpeech + 1; setNumberSpeech(n);
    setSpeeches(prev => [...prev, { coords: spawnCoords, number: n }]);
    setHasUnsaved(true);
  };
  const spawnChoice = () => {
    setShowMenu(false);
    const n = numberChoice + 1; setNumberChoice(n);
    setChoices(prev => [...prev, { coords: spawnCoords, number: n }]);
    setHasUnsaved(true);
  };

  // ── arrows ───────────────────────────────────────────────────
  const startArrowing = (e) => { e.stopPropagation(); setArrowStart(e.target.id); };
  const endArrowing = (e) => {
    e.stopPropagation();
    if (arrowStart && e.target.id && arrowStart !== e.target.id) {
      const dup = arrows.some(a => a.start === arrowStart && a.end === e.target.id);
      if (!dup) {
        setArrows(prev => [...prev, { start: arrowStart, end: e.target.id }]);
        setHasUnsaved(true);
      }
    }
    setArrowStart(null);
  };

  // ── keyboard ─────────────────────────────────────────────────
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

  // ── gather + send ─────────────────────────────────────────────
  const gatherData = useCallback(() => {
    const result = [];
    speeches.forEach(({ number }) => {
      const name = document.getElementById(`name-${number}-speech`)?.value || '';
      const text = document.getElementById(`text-${number}-speech`)?.value || '';
      let nextIds = arrows.filter(a =>
        a.start === `speech-right-${number}-anchor` || a.start === `speech-left-${number}-anchor`
      ).map(a => { const p = a.end.split('-'); return `${p[0]}-${p[2]}`; });
      result.push({ id: `speechTestr-${number}`, type: 'speech', name, text, nextIds: nextIds.length ? nextIds : null });
    });
    choices.forEach(({ number }) => {
      const inputs = document.querySelectorAll(`#name-${number}-choice`);
      const choiceType = document.getElementById(`choice-${number}-type-value`)?.value || '';
      const name = inputs[0]?.value || '';
      const text = inputs[1]?.value || '';
      let nextIds = arrows.filter(a =>
        a.start === `choice-right-${number}-anchor` || a.start === `choice-left-${number}-anchor`
      ).map(a => { const p = a.end.split('-'); return `${p[0]}-${p[2]}`; });
      result.push({ id: `choiceTest-${number}`, type: choiceType, name, text, nextIds: nextIds.length ? nextIds : null });
    });
    return result;
  }, [speeches, choices, arrows]);

  const sendData = useCallback(async () => {
    try {
      await axios.post('http://localhost:5181/api/ContentCreation/PostData', gatherData(), {
        headers: { 'Content-Type': 'application/json' },
      });
      setHasUnsaved(false);
    } catch (err) {
      console.error('Send error:', err);
    }
  }, [gatherData]);

  useEffect(() => {
    const id = setInterval(() => { if (speeches.length || choices.length) sendData(); }, 30000);
    return () => clearInterval(id);
  }, [speeches, choices, sendData]);

  // ── marquee screen rect ───────────────────────────────────────
  const marqueeRect = (() => {
    if (!marquee || !viewportRef.current) return null;
    const vp = viewportRef.current;
    const x1 = marquee.startX - vp.scrollLeft;
    const y1 = marquee.startY - vp.scrollTop + 36;
    const x2 = marquee.endX   - vp.scrollLeft;
    const y2 = marquee.endY   - vp.scrollTop + 36;
    const w  = Math.abs(x2 - x1);
    const h  = Math.abs(y2 - y1);
    if (w + h < 6) return null;
    return { left: Math.min(x1, x2), top: Math.min(y1, y2), width: w, height: h };
  })();

  const cursor = dragRef.current ? 'grabbing' : arrowStart ? 'crosshair' : 'default';

  return (
    <Xwrapper>
      {/* Status bar */}
      <div className="status-bar">
        <span className="status-logo">DeadIt</span>
        <span className="status-divider" />
        <span className="status-item"><span className="status-dot blue" />{speeches.length} speech</span>
        <span className="status-item"><span className="status-dot amber" />{choices.length} choice</span>
        <span className="status-item"><span className="status-dot dim" />{arrows.length} connections</span>
        {selectedNodes.size > 0 && !arrowStart && (
          <span className="status-item status-sel">◈ {selectedNodes.size} selected · Del to delete</span>
        )}
        {arrowStart && (
          <span className="status-item status-conn">✦ click anchor to connect · Esc to cancel</span>
        )}
      </div>

      {/* Hint bar */}
      <div className="hint-bar">
        right-click → add &nbsp;·&nbsp; drag header → move node &nbsp;·&nbsp; drag canvas → marquee select &nbsp;·&nbsp; Shift+click → multi-select &nbsp;·&nbsp; click anchor → connect &nbsp;·&nbsp; Del → delete
      </div>

      {/* Marquee */}
      {marqueeRect && (
        <div className="marquee" style={{ position: 'fixed', pointerEvents: 'none', zIndex: 599, ...marqueeRect }} />
      )}

      <div className="editor-layout">
        {/* Canvas */}
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
          <div className="canvas" style={{ width: 5000, height: 5000, position: 'relative' }}>
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
                onClickAnchor={arrowStart === null ? startArrowing : endArrowing}
                onDragStart={(e) => handleNodeDragStart(e, 'choice', c.number)}
                isSelected={selectedNodes.has(`choice-${c.number}`)}
                onSelect={(e) => { e.stopPropagation(); selectNode(`choice-${c.number}`, e.shiftKey); }}
                onDelete={() => deleteNode('choice', c.number)}
              />
            ))}

            {/* Permanent arrows */}
            {arrows.map((a, i) => (
              <Xarrow
                key={`${a.start}:${a.end}`}
                start={a.start}
                end={a.end}
                color="rgba(140,140,200,0.5)"
                strokeWidth={1.5}
                headSize={6}
                curveness={0.5}
              />
            ))}

            {/* Live arrow preview while connecting */}
            {arrowStart && (
              <>
                <div
                  id="ghost-arrow-target"
                  style={{
                    position: 'absolute',
                    left: mouseCanvas.x,
                    top: mouseCanvas.y,
                    width: 1, height: 1,
                    pointerEvents: 'none',
                  }}
                />
                <Xarrow
                  start={arrowStart}
                  end="ghost-arrow-target"
                  color="rgba(160,160,240,0.7)"
                  strokeWidth={1.5}
                  headSize={5}
                  curveness={0.4}
                  dashness={{ strokeLen: 6, nonStrokeLen: 4, animation: 0.8 }}
                />
              </>
            )}
          </div>
        </div>

        {/* Outliner panel */}
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

      <SendButton id="sendButton" onClick={sendData} hasUnsavedChanges={hasUnsaved} nodeCount={speeches.length + choices.length} />
    </Xwrapper>
  );
};

export default ContentCreation;
