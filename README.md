<div align="center">

# ⛳ Golf Physics Engine

**A small physics engine I wrote from scratch, playable as a 3D golf game in the browser, with every frame of the solver shown on screen.**

![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-0.180-000000?logo=threedotjs&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)
![Java](https://img.shields.io/badge/Java-core%20engine-ED8B00?logo=openjdk&logoColor=white)

</div>

---

## ✨ Overview

The project has two halves:

- **`src/`: the original Java engine.** It loads a golf course from a text file (a height function, the target, friction values and a sand pit), simulates the ball rolling over it and can render height or slope maps to PNG.
- **`web/`: an interactive 3D demo.** The same physics model is ported to TypeScript and rendered with Three.js. You set an angle and power, take the shot, and watch the live calculations update next to the scene.

### 🎮 Two simulation modes

| Mode | What it simulates |
| --- | --- |
| 🏌️ **Golf** | A ball rolling over a height-field terrain, with slope gravity, kinetic and static friction, sand traps, water hazards and a hole. |
| 🚀 **Space** | A rocket travelling from one planet to another under the Newtonian gravity of two bodies. It can reach the target, crash or escape. |

---

## 🧠 Physics model

### Golf

The terrain is a height function `h(x, y)`. Its gradient is computed with finite differences and drives the ball:

```text
∇h        = ( ∂h/∂x , ∂h/∂y )               slope of the terrain
a_gravity = −g · ∇h                          downhill pull
a_friction = −μk · g · v̂                     kinetic friction, opposes motion
a         = a_gravity + a_friction

v ← v + a · Δt                               semi-implicit Euler
p ← p + v · Δt
```

- **Static friction:** a ball at rest stays at rest while `|∇h| ≤ μs`.
- **Zones:** sand raises `μk`/`μs`, water (`h < 0`) ends the shot, and the target radius counts as holed.
- **Integrator:** fixed timestep of `1/120 s`, with `g = 9.80665 m/s²`.

### Space

```text
a = Σ  G · M_i / max(r_i, 0.85·R_i)² · r̂_i     summed over both planets
```

The step runs at a fixed `1/180 s`, and the distance is clamped so the force stays finite near the surface.

### Engine architecture

```text
World  ──►  Body  ──►  Forces  ──►  Integrator  ──►  Telemetry
terrain,    position,  slope       fixed-step       a PhysicsSnapshot
zones,      velocity,  gravity,    semi-implicit    exported every
target      mass       friction    Euler            frame for the UI
```

---

## 🚀 Getting started

### Web demo

```bash
cd web
npm install
npm run dev
```

Then open the URL that Vite prints (by default `http://localhost:5173`).

| Script | Description |
| --- | --- |
| `npm run dev` | Start the dev server with hot reload |
| `npm run build` | Type-check and build for production into `dist/` |
| `npm run preview` | Serve the production build |

### Java engine

```bash
javac -d bin $(find src -name "*.java")
java -cp bin com.darkmop.Main
```

`Main` loads `courses/example_input.txt` and writes a slope visualisation to `courses/example_input.png`.
`com.darkmop.course.Physics.Simulation` is an interactive console mode. Each line you enter is a shot (`px py vx vy`), and it prints the physics snapshot after each one.

---

## 🗺️ Course file format

Courses are plain `key = value` files. The height profile is an arbitrary math expression in `x` and `y`:

```ini
x0 = 0                 # start position
y0 = 0
xt = 4                 # target position
yt = 1
r  = 0.1               # target radius
muk = 0.1              # kinetic friction (grass)
mus = 0.2              # static friction (grass)
heightProfile = 0.5*(Math.sin((x-y)/7)+0.9)-0.25
sandPitX = -1<x<1      # sand pit bounds
sandPitY = 1<y<2
muks = 0.25            # kinetic friction (sand)
muss = 0.3             # static friction (sand)
```

---

## 📁 Project structure

```text
.
├── courses/                  # course definitions (.txt)
├── src/com/darkmop/
│   ├── Main.java             # loads a course and renders a slope map
│   ├── course/
│   │   ├── GolfCourse*.java  # course model, file parser, visualiser
│   │   ├── MathExpression.java
│   │   └── Physics/          # Ball, Physics, Simulation, snapshots
│   └── util/                 # Vec2D, console helpers
└── web/
    ├── index.html
    └── src/
        ├── engine/           # Body, Vec2, PhysicsSnapshot
        ├── golf/             # GolfCourse + GolfPhysicsEngine
        ├── space/            # SpaceWorld + SpacePhysicsEngine
        └── main.ts           # Three.js scene, UI and game loop
```

---

<div align="center">

Made by **[Aaron Mulvey](https://github.com/aaronMulveyAI)**

</div>
