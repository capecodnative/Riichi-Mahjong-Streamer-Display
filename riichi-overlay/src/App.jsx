import React, { useMemo, useState, useRef, useLayoutEffect } from "react";
import YAKU from "./yaku";

const UI = {
  outerPad: 24,
  framePad: 16,
  buttonCols: 4,
  buttonW: 92,
  buttonH: 52,
  buttonGap: 8,
  buttonFontSize: 13,
  leftExtra: 12,
  frameTop: 24,
  frameH: 932,
  overlayGap: 2,
};

const leftInnerWidth =
  UI.buttonCols * UI.buttonW + (UI.buttonCols - 1) * UI.buttonGap;

const leftFrameWidth =
  leftInnerWidth + UI.framePad * 2 + UI.leftExtra;

const rightFrameLeft = UI.outerPad + leftFrameWidth + UI.outerPad;

const styles = {
  app: {
    width: "1500px",
    height: "980px",
    background: "#09090b",
    color: "white",
    fontFamily: "Arial, sans-serif",
    position: "absolute",
    left: "0px",
    top: "0px",
    overflow: "hidden",
  },
  leftFrame: {
    position: "absolute",
    left: `${UI.outerPad}px`,
    top: `${UI.frameTop}px`,
    width: `${leftFrameWidth}px`,
    height: `${UI.frameH}px`,
    border: "1px solid #27272a",
    borderRadius: "20px",
    background: "#18181b",
    padding: `${UI.framePad}px`,
    boxSizing: "border-box",
    overflow: "hidden",
  },
  rightFrame: {
    position: "absolute",
    left: `${rightFrameLeft}px`,
    top: `${UI.frameTop}px`,
    width: `${1500 - rightFrameLeft - UI.outerPad}px`,
    height: `${UI.frameH}px`,
    border: "1px solid #27272a",
    borderRadius: "0px",
    background: "#000000",
    padding: "20px",
    boxSizing: "border-box",
    overflow: "hidden",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: `repeat(${UI.buttonCols}, ${UI.buttonW}px)`,
    gridAutoRows: `${UI.buttonH}px`,
    gap: `${UI.buttonGap}px`,
    justifyContent: "start",
    marginBottom: "18px",
  },
  clearButton: {
    width: "100%",
    height: "40px",
    borderRadius: "10px",
    border: "1px solid #3f3f46",
    background: "#27272a",
    color: "white",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    marginBottom: "14px",
  },
  scrollArea: {
    height: `${UI.frameH - UI.framePad * 2 - 54}px`,
    overflowY: "auto",
    overflowX: "hidden",
    paddingRight: "4px",
    boxSizing: "border-box",
  },
  sectionLabel: {
    fontSize: "11px",
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    color: "#a1a1aa",
    marginBottom: "8px",
  },
  captureArea: {
    position: "relative",
    width: "942px",
    height: "892px",
    margin: "0 auto",
    background: "#000000",
    overflow: "hidden",
  },
};

function buttonStyle(active, isYakuman) {
  return {
    width: `${UI.buttonW}px`,
    height: `${UI.buttonH}px`,
    borderRadius: "8px",
    border: `1px solid ${active ? (isYakuman ? "#ef4444" : "#10b981") : "#3f3f46"}`,
    background: active ? (isYakuman ? "rgba(239,68,68,0.20)" : "rgba(16,185,129,0.20)") : "#27272a",
    color: "white",
    fontSize: `${UI.buttonFontSize}px`,
    fontWeight: 600,
    lineHeight: 1.1,
    padding: "4px",
    textAlign: "center",
    cursor: "pointer",
    overflow: "hidden",
  };
}

export default function App() {
  const [selectedIds, setSelectedIds] = useState([]);
  const [overlayHeights, setOverlayHeights] = useState({});
  const imgRefs = useRef({});

  const common = useMemo(() => YAKU.filter((y) => y.group === "common"), []);
  const yakuman = useMemo(() => YAKU.filter((y) => y.group === "yakuman"), []);
  const selected = useMemo(
    () => YAKU.filter((y) => selectedIds.includes(y.id)),
    [selectedIds]
  );

  function toggleYaku(id) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function clearAll() {
    setSelectedIds([]);
  }

  function measureOverlay(id) {
    const img = imgRefs.current[id];
    if (!img) return;

    const h = img.getBoundingClientRect().height;
    if (!h) return;

    setOverlayHeights((prev) => {
      if (prev[id] === h) return prev;
      return { ...prev, [id]: h };
    });
  }

  useLayoutEffect(() => {
    const nextHeights = {};

    selected.forEach((yaku) => {
      const img = imgRefs.current[yaku.id];
      if (img) {
        const h = img.getBoundingClientRect().height;
        if (h > 0) nextHeights[yaku.id] = h;
      }
    });

    setOverlayHeights((prev) => {
      const prevKeys = Object.keys(prev);
      const nextKeys = Object.keys(nextHeights);
      if (
        prevKeys.length === nextKeys.length &&
        nextKeys.every((k) => prev[k] === nextHeights[k])
      ) {
        return prev;
      }
      return nextHeights;
    });
  }, [selected]);

  let runningTop = 0;

  const overlayPositions = selected.map((yaku) => {
    const top = runningTop;
    runningTop += (overlayHeights[yaku.id] ?? 0) + UI.overlayGap;
    return { ...yaku, top };
  });

  return (
    <div style={styles.app}>
      <div style={styles.leftFrame}>
        <button onClick={clearAll} style={styles.clearButton}>Clear</button>
        <div style={styles.scrollArea}>
          <div style={styles.sectionLabel}>Common yaku</div>
          <div style={styles.grid}>
            {common.map((yaku) => (
              <button
                key={yaku.id}
                onClick={() => toggleYaku(yaku.id)}
                title={yaku.name}
                style={buttonStyle(selectedIds.includes(yaku.id), false)}
              >
                {yaku.name}
              </button>
            ))}
          </div>

          <div style={styles.sectionLabel}>Yakuman</div>
          <div style={styles.grid}>
            {yakuman.map((yaku) => (
              <button
                key={yaku.id}
                onClick={() => toggleYaku(yaku.id)}
                title={yaku.name}
                style={buttonStyle(selectedIds.includes(yaku.id), true)}
              >
                {yaku.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={styles.rightFrame}>
        <div style={styles.captureArea}>
          {overlayPositions.map((yaku) => (
            <img
              key={yaku.id}
              ref={(el) => {
                imgRefs.current[yaku.id] = el;
              }}
              src={`${import.meta.env.BASE_URL}overlays/${yaku.overlay}`}
              alt=""
              onLoad={() => {
                const img = imgRefs.current[yaku.id];
                if (!img) return;
                const h = img.getBoundingClientRect().height;
                if (!h) return;
                setOverlayHeights((prev) => ({ ...prev, [yaku.id]: h }));
              }}
              style={{
                position: "absolute",
                left: "0px",
                top: `${yaku.top}px`,
                width: "942px",
                height: "auto",
                display: "block",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
