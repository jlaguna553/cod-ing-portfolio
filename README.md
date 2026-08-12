# CodeQuest — Plataforma gamificada de aprendizaje técnico

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React%2019-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind%20CSS%204-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-764ABC?style=for-the-badge&logo=redux&logoColor=white)
![Monaco](https://img.shields.io/badge/Monaco%20Editor-5C2D91?style=for-the-badge&logo=visualstudio&logoColor=white)
![License](https://img.shields.io/badge/Licencia-MIT-green?style=for-the-badge)

> **Aprende a programar resolviendo lecciones en un editor de código real, con XP, combos y logros — bilingüe ES/EN desde el día uno.**

CodeQuest es una plataforma de aprendizaje técnico gamificado: cada lección es un reto de programación que se resuelve en un editor **Monaco** dentro del navegador, con evaluación automática, feedback inmediato y mecánicas de juego (XP, rachas, logros).

## ✨ Características

- **Editor Monaco integrado** — el mismo motor de VS Code, con *power mode* de partículas
- **Evaluación en tiempo real** — tests automáticos y salida en vivo en el navegador
- **Gamificación por diseño** — XP, niveles, combos y logros derivados de eventos reales (keystrokes, reglas superadas, pasos completados)
- **Bilingüe ES/EN desde el día 0** — el esquema de contenido lo exige, no es un retrofit
- **Contenido = datos** — cada lección es un JSON validado por schema; añadir lecciones no requiere tocar React
- **UI a 60fps** — parseo, linting y tests corren en Web Workers para no bloquear el hilo principal
- **Verificación de integridad** — tests unitarios, chequeo de contenido y paridad i18n vía scripts (`npm run check`)

## 🛠 Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js (App Router) |
| UI | React 19 + Tailwind CSS 4 + lucide-react |
| Estado | Zustand |
| Editor | Monaco (`@monaco-editor/react`) |
| Contenido | JSON versionado con schema (react-markdown) |
| i18n | next-intl |
| Testing | tsx + Node test runner |

## 🚀 Inicio rápido

```bash
npm install
npm run dev        # http://localhost:3000
```

Verificación completa (tests + contenido + i18n + build):

```bash
npm run check
```

## 📁 Estructura

```
cod-ing/
├── content/               # Lecciones en JSON (schema validado)
│   ├── lessons/
│   └── schema/
├── docs/
│   ├── ARCHITECTURE.md    # Decisiones de diseño y diagramas
│   └── ROADMAP.md         # Plan de fases
├── scripts/               # Validación de contenido, schema e i18n
├── src/                   # App Next.js (Monaco, paneles, HUD)
└── tests/                 # Tests unitarios
```

## 🧠 Detalles técnicos

- El **motor de evaluación** y la **gamificación** están desacoplados: el store escucha eventos (`keystroke`, `rule:failed`, `step:passed`) y deriva XP/combo/logros sin que el evaluador sepa qué es el XP.
- El `Runner` es una interfaz única (Sandpack, Pyodide, runner remoto o simulador de CLI implementan el mismo contrato), así que la UI no sabe qué motor está ejecutando.
- Cada lección es bilingüe por contrato: si el ES/EN no está en el schema, la validación falla antes de llegar al build.

<!-- Agrega capturas en docs/screenshots/ -->

---

## Desarrollado por Francisco Javier Laguna

Full-stack developer · React · Vue · .NET · PHP

[GitHub](https://github.com/jlaguna553) · [LinkedIn](https://www.linkedin.com/in/francisco-javier-laguna-mondrag%C3%B3n-80a798154/) · [CV Online](https://cv-online.jlaguna553.workers.dev/v/xrdcnyej)
