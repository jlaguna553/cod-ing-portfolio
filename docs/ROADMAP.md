# Plan de ejecución

Ocho fases. Cada una termina con algo demostrable, no con "infraestructura lista".
El orden está elegido para que el riesgo técnico se descubra pronto: las fases 3 y 4
son las que pueden matar el proyecto, y por eso van antes que el pulido visual.

---

### ✅ Fase 0 — Modelo de contenido (COMPLETADA)

| Entregable | Ruta |
|---|---|
| Arquitectura y ADRs | `docs/ARCHITECTURE.md` |
| Schema Zod (fuente de verdad) | `src/lib/content/lesson.schema.ts` |
| Tipos + contrato `Runner` | `src/lib/content/types.ts` |
| Localizador profundo | `src/lib/content/localize.ts` |
| Lección ejemplo — drill frontend | `content/lessons/frontend/javascript/js-03-array-map.lesson.json` |
| Lección ejemplo — boss devops | `content/lessons/devops/docker/docker-07-layer-cache.lesson.json` |
| Validador CI + generador JSON Schema | `scripts/` — `npm run content:check`, `npm run content:schema` |

**Verificado:** 2 lecciones validan; 5 pruebas negativas (traducción faltante, ruleId
huérfano, entry inválido, drill con <3 repeticiones, interview sin bloque) son rechazadas.

---

### ✅ Fase 1 — Esqueleto Next.js + i18n (COMPLETADA)

Next 16.3 (App Router, Turbopack) · React 19 · next-intl 4 · Tailwind 4 · Zustand 5.

| Entregable | Ruta |
|---|---|
| Routing i18n + navegación consciente del locale | `src/i18n/{routing,navigation,request}.ts` |
| Proxy de detección de idioma | `src/proxy.ts` |
| Aislamiento COOP/COEP por ruta (ADR-04) | `next.config.ts` |
| Diccionarios de UI (68 claves × 2) | `messages/{es,en}.json` |
| Paridad i18n en CI | `scripts/check-i18n-parity.ts` |
| Layout de juego de 3 zonas | `src/components/layout/{GameShell,LeftPanel,RightPanel,OutputDock}.tsx` |
| Selector de idioma que conserva la ruta | `src/components/i18n/LocaleSwitch.tsx` |
| Tema CRT/cyberpunk + modo rendimiento | `src/app/globals.css` |
| Estado de sesión fuera de React | `src/stores/useSessionStore.ts` |

**Verificado en runtime** (`next build` + `next start`):

- `/` → 307 a `/es`; con `Accept-Language: en` → 307 a `/en`.
- `/es` sirve «Elige tu ruta», `/en` sirve «Pick your track»; ambos prerenderizados como estáticos.
- COOP `same-origin` presente en `/es/play/devops/*` y `/es/play/backend/*`, **ausente** en
  `/es/play/frontend/*` y en la home — el aislamiento no contamina el resto de la app.
- El chequeo de paridad detecta clave faltante, clave sobrante y placeholder ICU divergente (exit 1).

**Corrección al criterio de salida original.** Estaba mal planteado: decía «cambiar idioma no
remonta ningún componente con estado». En el App Router eso es imposible — `/es/…` → `/en/…`
cambia el segmento `[locale]`, así que React **sí** remonta el subárbol. La garantía real del
ADR-01 se consigue de otra forma: el estado vive **fuera del árbol de React**, en stores de
módulo de Zustand con `persist`. El remount ocurre y da igual.

**Criterio de salida (corregido):** ningún estado de progreso —combo, XP, pulsaciones, buffer
del editor— se guarda en `useState` dentro del subárbol de `[locale]`. `useSessionStore` es
la implementación de referencia y `SessionMeter` la prueba visible.

> Actualización tras la Fase 2: la lógica ya está cubierta por
> `tests/lesson-store.test.ts`, que prueba la supervivencia del progreso al cambiar de
> idioma a nivel de store. Sigue faltando el E2E de navegador que lo confirme con
> navegación real de cliente — pendiente de Playwright en Fase 5.

### ✅ Fase 2 — Content loader + store de lección (COMPLETADA)

| Entregable | Ruta |
|---|---|
| Loader con índice `id → fichero`, validación y caché | `src/lib/content/loader.ts` |
| Recorte de payload hacia el cliente (`toClientLesson`) | `src/lib/content/loader.ts` |
| Endpoint de pistas | `src/app/api/hint/route.ts` |
| Store de lección | `src/stores/useLessonStore.ts` |
| Guía, pistas, briefing de entrevista, markdown | `src/components/lesson/*` |
| Árbol de archivos y editor con buffer editable | `src/components/editor/*` |
| Tests del store | `tests/lesson-store.test.ts` — 8/8 |

Las 4 rutas de lección (2 lecciones × 2 idiomas) se prerenderizan desde JSON en build.

**La invariante del ADR-01 ya está probada, no solo razonada.** El test
«cambiar de idioma NO reinicia el progreso» escribe código, revela una pista, cambia
de idioma y comprueba que los textos cambian mientras el buffer, el paso y las pistas
gastadas siguen intactos. Toda la implementación es un `if` en `syncLesson`: misma
lección → sustituye solo los textos.

#### Hallazgo: la solución viajaba al navegador

Al inspeccionar el HTML servido apareció que el payload RSC —texto plano dentro del
HTML— incluía `solution.files` **con el Dockerfile ya resuelto**, el texto de todas las
pistas (que cuestan XP) y las reglas marcadas como `hidden`. Abrir devtools era una
estrategia ganadora y la economía de XP no valía nada.

Corregido en tres piezas:

1. `toClientLesson()` elimina `solution`, el texto de las pistas y las reglas ocultas.
2. `/api/hint` entrega el texto de UNA pista bajo demanda, que es donde la Fase 7
   descontará el XP en servidor.
3. Las reglas `hidden: true` no viajan → **se evaluarán en servidor** en la Fase 4.
   Consecuencia de diseño a tener presente: el motor de evaluación tendrá dos rutas,
   cliente para las reglas visibles e inmediatas, servidor para las ocultas.

**Verificado:** barrido sobre el HTML servido en ES y EN — ninguna de las 5 líneas que
la solución añade sobre el código de partida aparece en el documento.

#### Hallazgo: la lección regalaba su propia respuesta

El mismo barrido destapó un problema de autoría, no de código: el paso 3 de
`docker-07-layer-cache` pegaba el Dockerfile multi-stage resuelto como material
didáctico, y un follow-up daba el flag exacto. Recortar el payload no sirve de nada si
el enunciado contiene la solución.

Ambos reescritos para enseñar la *forma* con un ejemplo ajeno (un build de Go) y dejar
que el usuario la traslade a su ejercicio. Y convertido en check automático dentro de
`validate-content.ts`, con dos matices que evitan falsos positivos:

- **Solo se aplica de `adept` en adelante.** En `novice`/`apprentice`, enseñar la
  sintaxis exacta es la pedagogía correcta; nadie deduce `COPY package*.json` en su
  primera lección de Docker.
- **Solo cuenta lo que la solución añade** sobre el código de partida. `RUN npm run build`
  ya está delante del usuario: repetirlo no revela nada.

Las pistas quedan fuera del check a propósito: la de tier 3 **sí** debe poder ser la
solución literal — cuesta XP y solo se sirve cuando el usuario decide gastarla.

**Criterio de salida:** cumplido. `npm run check` (contenido + i18n + tests + build) en verde.

### Fase 3 — Runners ⚠️ *fase de mayor riesgo*

Orden deliberado, de menor a mayor incógnita:

1. `SandpackRunner` + `DomPreview` → HTML/CSS/JS y React/Vue **sin instalación**.
2. `WebContainerRunner` + COOP/COEP → npm real, terminal y servidor de desarrollo.
3. `PyodideRunner` → Python.
4. `RemoteRunner` + `/api/run` (Piston) con rate limiting → Go, SQL, Java.
5. `CliSimRunner` + escenario `docker/layer-cache` → DevOps (ADR-03).

**Criterio de salida:** un smoke test por runner arrancando y devolviendo `RunResult`.

> **Cambio de prioridad (ver ADR-07).** WebContainers sube del puesto 4 al 2. Con la
> terminal interactiva como requisito de producto, deja de ser "lo que hace falta para
> el track de backend" y pasa a ser el motor de las lecciones de framework de frontend.
> La decisión sobre su licencia comercial ya no es un punto de decisión de esta fase:
> es **bloqueante para todo el producto** y hay que tomarla antes de escribir contenido
> que dependa de ella.

### Fase 3.5 — Workspace de proyecto real

Que el ejercicio se sienta un proyecto, no un formulario con un hueco.

**Terminal interactiva** (`XtermPane` sobre `WebContainerRunner`)

- Shell real con `npm install`, `npm create vue@latest`, `git`, `ls`, `cat`.
- El usuario **teclea el comando**: instalar Vite forma parte de la lección, no es
  andamiaje que ocurre por detrás.
- Historial persistente por lección y `cli-transcript` (regla ya existente en el schema)
  para validar que el comando correcto llegó a ejecutarse.
- Barandilla: lista de comandos permitidos por lección. No por seguridad —el contenedor
  ya está aislado— sino pedagógica: `rm -rf node_modules` a mitad de una lección de
  React solo genera una sesión de soporte.

**Árbol de archivos vivo** (`FileTree` mutable)

- Carpetas anidadas, crear / renombrar / borrar, menú contextual, arrastrar y soltar.
- **Sincronización bidireccional**: lo que el usuario crea aparece en el FS del runner,
  y lo que un comando genera (`npm create vue` escribiendo 40 archivos) aparece en el
  árbol. Este es el trabajo real de la fase; el resto es UI.
- Badges de estado: modificado, creado, generado por herramienta.
- `node_modules` colapsado y virtualizado — 300 MB de árbol no se renderizan.

**Impacto en el modelo de contenido**

`workspace.files` deja de ser la lista definitiva de archivos y pasa a ser el estado
*inicial*. Campos nuevos en el schema (ver ADR-08): `workspace.allowCreate`,
`allowDelete`, `protectedPaths`, y `runtime.terminal` con `enabled` y `allowedCommands`.

**Criterio de salida:** una lección donde el usuario abre la terminal, ejecuta
`npm create vite@latest`, ve aparecer el árbol generado, edita un archivo y el preview
se recarga — todo dentro de la pestaña.

### Fase 4 — Motor de evaluación (Entregable 5)

- `RuleDispatcher` con las tres fases (`type` / `run` / `submit`) y debounce de 120ms.
- Validadores por orden de valor: `regex-*` → `stdout-match` → `dom-assert` →
  `dockerfile-lint` → `ast-query` (web-tree-sitter en worker) → `unit-test` → `http-assert`.
- `parser.worker.ts` fuera del hilo de UI.

**Criterio de salida:** las 7 reglas de la lección de Docker evalúan correctamente
contra la solución de referencia y contra el estado inicial roto.

### Fase 5 — Editor gamificado (Entregable 4)

- `CodeCanvas`: Monaco con carga dinámica por lenguaje del track.
- `PowerModeFX`: partículas en canvas sobre la posición del cursor; shake en la línea dañada.
- `XtermPane` conectado al `Runner` vía `onOutput`.
- `prefers-reduced-motion` + toggle "Modo rendimiento" desde el primer commit, no al final.

**Criterio de salida:** 60fps sostenidos tecleando rápido con FX activos.

### Fase 6 — Gamificación y audio (Entregable 3)

- `useGameStore`: combo con ventana y decay, keystrokes, XP, nivel, energía.
- Anti-cheat del combo (ADR-06): paste >40 chars rompe el combo.
- `lib/game/achievements.ts` evaluando los triggers del catálogo.
- `AchievementToast` + `canvas-confetti` + curva de niveles.

#### Sistema de sonido de tecleo

Packs seleccionables desde el panel izquierdo, junto al selector de idioma:

| Pack | Carácter |
|---|---|
| `mechanical` | Teclado mecánico, switches táctiles. El respetable. |
| `typewriter` | Máquina de escribir con campana al `Enter`. |
| `duck` | Un pato por tecla. Absurdo y adictivo. |
| `blades` | Espadas y aceros — encaja con el combo y el "daño". |
| `retro` | Bleeps de 8 bits. |
| `silent` | Sin sonido. **Es el valor por defecto.** |

Diseño técnico (`lib/audio/`):

- **Web Audio API, no `<audio>`.** Un elemento `<audio>` por pulsación acumula latencia
  y se corta a sí mismo; a 8 pulsaciones por segundo se nota y arruina el efecto.
  `AudioBuffer` decodificado una vez + un `AudioBufferSourceNode` desechable por tecla.
- **Pool de voces con techo** (~12 simultáneas). Escribir rápido no puede convertirse en
  un muro de ruido ni disparar decenas de nodos por segundo.
- **Variación por muestra**: 3-4 grabaciones por pack y un ±6% de `playbackRate`
  aleatorio. Sin esa variación, la repetición exacta suena a máquina rota en 20 teclas.
- **Teclas distintas suenan distinto**: `Enter`, `Backspace` y la barra espaciadora
  tienen su propia muestra. Es lo que separa "suena bien" de "suena a demo".
- **Enganchado al combo**: el tono sube ligeramente con el multiplicador, y hay un
  sonido propio para romper combo y para subir de nivel.
- **Autoplay policy**: el `AudioContext` arranca suspendido y solo se reanuda tras el
  primer gesto real del usuario. Sin esto, Chrome lo bloquea y el pack parece roto.
- **Precarga perezosa**: el pack se descarga al seleccionarlo, no en el arranque.
  Presupuesto: < 150 KB por pack en `.webm`/Opus.

Accesibilidad y respeto: por defecto **silencio**, control de volumen independiente,
y el "Modo rendimiento" apaga también el audio. `prefers-reduced-motion` no cubre el
sonido, así que necesita su propio interruptor — sonido inesperado en unos auriculares
es hostil, no divertido.

**Criterio de salida:** tecleo sostenido a 10 pulsaciones/segundo sin cortes, sin clics
audibles y sin caída de fps.

### Fase 7 — Persistencia y perfil

- Postgres + Drizzle, Auth.js, `/api/progress` con autosave debounced.
- Reanudar desde `code_snapshot`; racha diaria; mapa de mundos con progreso.

### Fase 8 — Escalar contenido

Aquí es donde el proyecto se gana o se pierde. La tecnología ya no es el cuello de botella.

- `docs/AUTHORING.md` + una lección plantilla por arquetipo (`concept`, `drill`, `challenge`, `interview`).
- Objetivo v1: ~12 lecciones por módulo × 3 tracks, cada una con su boss `interview`.
- CI: `content:check` + paridad i18n bloqueando merge.

---

## Riesgo que conviene tener presente

El esfuerzo de autoría bilingüe supera al de desarrollo a partir de la Fase 8. Un módulo
de 12 lecciones son ~12 000 palabras × 2 idiomas más código de partida, solución y reglas.
Merece la pena decidir pronto si v1 lanza con **un track completo** (recomendado: Frontend,
el de runners más simples) o con tres tracks a medias.
