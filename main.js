// ==UserScript==
// @name         DOM Load Indicator
// @namespace    https://github.com/aket0r/
// @version      1.0
// @description  Показывает количество DOM-элементов на странице с цветовой индикацией (🟢🟡🔴)
// @author       aket0r
// @match        http://*/*
// @match        https://*/*
// @exclude      https://chat.openai.com/*
// @exclude		   https://chatgpt.com/*
// @grant        none
// @license		   MIT
// @icon         https://raw.githubusercontent.com/aket0r/dom-indicator-loading/main/DOM-indicator-loading.png
// ==/UserScript==


function initDOMIndicator() {
	if (window.top !== window.self) {
	  return; // Прекратить выполнение внутри iframe (например, плееров)
	}

	console.log(`%c[${new Date().toLocaleString()}] Page Elements (DOM) indicator loaded.`, 'color: lime;');
	let badge = document.createElement("div");
	badge.id = "dom-indicator";
	badge.style.cssText = `
			position: fixed;
			bottom: 10px;
			right: 10px;
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
		`;
	badge.textContent = "DOM Nodes: loading...";
	document.body.prepend(badge);

	setInterval(() => {
		const count = document.querySelectorAll("*").length;
		badge.textContent = `DOM nodes: ${count}`;

		if (count > 30000) {
			badge.style.color = "#f55";
			badge.style.background = "#300";
		} else if (count > 15000) {
			badge.style.color = "#ff0";
			badge.style.background = "#442";
		} else {
			badge.style.color = "#0f0";
			badge.style.background = "#222";
		}
	}, 1000);
}

window.addEventListener("load", function() {
	setTimeout(initDOMIndicator, 200);
});

