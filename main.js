// ==UserScript==
// @name         DOM + FPS Load Indicator
// @namespace    https://github.com/aket0r/
// @version      2.0
// @description  Показывает количество DOM-элементов на странице с цветовой индикацией (🟢🟡🔴)
// @author       aket0r
// @match        http://*/*
// @match        https://*/*
// @exclude      https://chat.openai.com/*
// @exclude      https://chatgpt.com/*
// @grant        none
// @license	 MIT
// @icon         https://raw.githubusercontent.com/aket0r/dom-indicator-loading/main/DOM-indicator-loading.png
// ==/UserScript==
 
(() => {
  'use strict';
 
  // ----- Настройки -----
  const DOM_THRESHOLDS = { warn: 15000, danger: 30000 }; // пороги DOM
  const DOM_UPDATE_EVERY_MS = 1000;
 
  const FPS_ENABLED = true;     // показать строку FPS
  const FPS_WINDOW = 60;        // сглаживание (кол-во кадров)
  const FPS_UI_UPDATE_MS = 1000; // частота обновления строки FPS
 
  const SPARKLINE_ENABLED = true; // мини-график ms/кадр
  const SPARK = {
    length: 120,
    width: 140,
    height: 28,
    padX: 4,
    padY: 3,
    clampMs: { min: 8, max: 100 } // авто-масштаб в пределах 8..100ms
  };
 
  // ----- Ранний выход для iframes -----
  if (window.top !== window.self) return;
 
  // ----- FPS-модуль -----
  const FPSMeter = (() => {
    let rafId = null;
    let last = 0;
    let samples = [];
    let lastUiUpdate = 0;
 
    // буфер ms/кадр для спарклайна
    const msBuf = [];
 
    function loop(ts) {
      if (!last) last = ts;
      const delta = ts - last;
      last = ts;
 
      // игнорируем большие паузы (свёрнутая вкладка и т.п.)
      if (delta > 0 && delta < 250) {
        const fps = 1000 / delta;
        samples.push(fps);
        if (samples.length > FPS_WINDOW) samples.shift();
 
        if (SPARKLINE_ENABLED) {
          msBuf.push(delta);
          if (msBuf.length > SPARK.length) msBuf.shift();
        }
      }
 
      if (FPS_ENABLED && ts - lastUiUpdate >= FPS_UI_UPDATE_MS) {
        lastUiUpdate = ts;
        updateFPSLine(getStats(), msBuf);
        if (SPARKLINE_ENABLED) drawSparkline(msBuf);
      }
 
      rafId = requestAnimationFrame(loop);
    }
 
    function getStats() {
      if (samples.length === 0) return { avg: 0, min: 0, max: 0 };
      let sum = 0, min = Infinity, max = -Infinity;
      for (const v of samples) { sum += v; if (v < min) min = v; if (v > max) max = v; }
      return { avg: sum / samples.length, min, max };
    }
 
    function start() {
      if (rafId != null || !FPS_ENABLED) return;
      samples = [];
      last = 0;
      lastUiUpdate = 0;
      rafId = requestAnimationFrame(loop);
    }
 
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') last = performance.now();
    });
 
    return { start };
  })();
 
  // ----- UI бейдж -----
  function initBadge() {
    console.log(`%c[${new Date().toLocaleString()}] DOM + FPS indicator loaded.`, 'color: lime;');
 
    let badge = document.getElementById('dom-indicator');
    if (badge) return; // уже создан
 
    badge = document.createElement('div');
    badge.id = 'dom-indicator';
    badge.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 80px;
      background: #222;
      color: #0f0;
      font-family: monospace;
      padding: 6px 10px;
      border-radius: 8px;
      font-size: 13px;
      z-index: 99999;
      box-shadow: 0 0 4px rgba(0,0,0,0.4);
      user-select: none;
      pointer-events: none;
      line-height: 1.25;
      white-space: nowrap;
    `;
    badge.innerHTML = `
      <div id="dom-line">DOM nodes: loading...</div>
      ${FPS_ENABLED ? `<div id="fps-line">FPS: --.- (ms: --.-)</div>` : ``}
      ${SPARKLINE_ENABLED ? `<canvas id="fps-spark" width="${SPARK.width}" height="${SPARK.height}" style="display:block;margin-top:4px;opacity:.9;"></canvas>` : ``}
    `;
    document.body.prepend(badge);
 
    // Запускаем DOM-счётчик
    setInterval(updateDOMLine, DOM_UPDATE_EVERY_MS);
  }
 
  function updateDOMLine() {
    const badge = document.getElementById('dom-indicator');
    const line = document.getElementById('dom-line');
    if (!badge || !line) return;
 
    const count = document.querySelectorAll('*').length;
    line.textContent = `DOM nodes: ${count}`;
 
    if (count > DOM_THRESHOLDS.danger) {
      badge.style.color = '#f55';
      badge.style.background = '#300';
    } else if (count > DOM_THRESHOLDS.warn) {
      badge.style.color = '#ff0';
      badge.style.background = '#442';
    } else {
      badge.style.color = '#0f0';
      badge.style.background = '#222';
    }
  }
 
  function updateFPSLine(stats, msBuf) {
    const el = document.getElementById('fps-line');
    const badge = document.getElementById('dom-indicator');
    if (!el || !badge) return;
 
    const avg = stats.avg || 0;
    const ms = avg > 0 ? (1000 / avg) : 0;
 
    el.textContent = `FPS: ${avg.toFixed(1)} (ms: ${ms.toFixed(1)})`;
 
    // Лёгкая подсветка по усреднённому ms, если фон в «зелёном» состоянии
    const bg = badge.style.background;
    const looksDefault = !bg || bg === '#222' || bg === 'rgb(34, 34, 34)';
    if (looksDefault) {
      if (ms <= 18) { // ~60 FPS и выше
        badge.style.background = '#1f2a1f';
        badge.style.color = '#aef1ae';
      } else if (ms <= 25) {
        badge.style.background = '#2a281f';
        badge.style.color = '#ffe9a6';
      } else {
        badge.style.background = '#2a1f1f';
        badge.style.color = '#ffb3b3';
      }
    }
  }
 
  // ----- Спарклайн (canvas) -----
  function drawSparkline(msBuf) {
    const canvas = document.getElementById('fps-spark');
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    ctx.imageSmoothingEnabled = false;
 
    const W = canvas.width, H = canvas.height;
    const px = SPARK.padX, py = SPARK.padY;
    const plotW = W - px * 2, plotH = H - py * 2;
 
    ctx.clearRect(0, 0, W, H);
    if (!msBuf || msBuf.length < 2) return;
 
    // авто-масштаб (с клампом)
    let min = Math.min(...msBuf);
    let max = Math.max(...msBuf);
    min = Math.max(min, SPARK.clampMs.min);
    max = Math.min(Math.max(max, min + 1), SPARK.clampMs.max);
 
    // baseline 60fps (16.7ms) и 30fps (33.3ms)
    ctx.globalAlpha = 0.15;
    ctx.fillStyle = '#ffffff';
    const ms60 = 1000 / 60;
    const ms30 = 1000 / 30;
    const y60 = py + (plotH * (max - ms60) / (max - min));
    const y30 = py + (plotH * (max - ms30) / (max - min));
    ctx.fillRect(px, Math.max(py, Math.min(H - py - 1, y60)), plotW, 1);
    ctx.fillRect(px, Math.max(py, Math.min(H - py - 1, y30)), plotW, 1);
    ctx.globalAlpha = 1;
 
    // цвет по последнему значению
    const lastMs = msBuf[msBuf.length - 1];
    const stroke =
      lastMs <= 18 ? '#aef1ae' :
      lastMs <= 25 ? '#ffe9a6' :
                     '#ffb3b3';
 
    // линия
    ctx.lineWidth = 1;
    ctx.strokeStyle = stroke;
    ctx.beginPath();
    for (let i = 0; i < msBuf.length; i++) {
      const ms = Math.min(Math.max(msBuf[i], min), max);
      const x = px + (i / (SPARK.length - 1)) * plotW;
      const y = py + (plotH * (max - ms) / (max - min));
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
 
    // лёгкая подзаливка
    const grad = ctx.createLinearGradient(0, py, 0, H - py);
    grad.addColorStop(0, 'rgba(255,255,255,0.18)');
    grad.addColorStop(1, 'rgba(255,255,255,0.02)');
    ctx.fillStyle = grad;
    ctx.lineTo(px + plotW, H - py);
    ctx.lineTo(px, H - py);
    ctx.closePath();
    ctx.fill();
  }
 
  // ----- Старт -----
  window.addEventListener('load', () => {
    setTimeout(() => {
      initBadge();
      if (FPS_ENABLED) FPSMeter.start();
    }, 200);
  });
