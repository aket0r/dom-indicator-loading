# 🟢 DOM + FPS Indicator Loading (RU)

**DOM Indicator** — это лёгкий и наглядный скрипт-индикатор, отображающий количество DOM-элементов на странице в реальном времени. Позволяет отслеживать нагрузку на интерфейс и вовремя замечать перегрузку страниц.

---

## 📦 Возможности

- Отображает количество DOM-узлов и FPS (`document.querySelectorAll("*").length`)
- Цветовая индикация:
  - 🟩 зелёный — < 6000 элементов
  - 🟨 жёлтый — от 6000 до 9000
  - 🟥 красный — от 9000 до 15000
  - ⚠️ мерцающий режим + иконка — при > 15000
- Уведомление `⚠️` и анимация для перегруженных страниц
- Лёгкий стиль, не мешает навигации
- Не работает во `iframe`, чтобы избежать дублирования

---

# 🟢 DOM + FPS Indicator Loading (ENG)

**DOM Indicator** is a lightweight visual tool that displays the number of DOM nodes on a web page in real time. It helps developers monitor page complexity and detect overloads that may cause performance issues.

---

## 📦 Features

- Shows live DOM node count and FPS (`document.querySelectorAll("*").length`)
- Color status indicator:
  - 🟩 Green — under 6000 elements
  - 🟨 Yellow — between 6000 and 9000
  - 🟥 Red — between 9000 and 15000
  - ⚠️ Blinking warning + icon — above 15000 elements
- Automatically updates every second
- Visible indicator in bottom-right corner
- Does **not** run in iframes (prevents duplicates in players/widgets)

---
