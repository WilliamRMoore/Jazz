# Jazz 🎷

A 2D platform fighting game engine prototype built with TypeScript and the HTML5 Canvas.

## About The Project

Jazz is a foundational project for creating 2D platform fighting games. It leverages modern web technologies to deliver a responsive gaming experience directly in the browser. The engine is designed with a focus on a clear and extensible architecture to make character creation and gameplay logic easy to manage.

Key features include:

- Written in **TypeScript** for type safety and a better developer experience.
- **Finite State Machine (FSM)** for player and attack logic.
- **Gamepad API** support for controller input.
- Bundled with **esbuild** for fast development and builds.

## Architecture

The core of the player character's logic is built around a **Finite State Machine (FSM)**. This architectural choice is central to how character actions and states are managed.

- **States**: Every action a character can perform—such as standing, walking, jumping, or attacking—is represented as a distinct state within the FSM. This isolates the logic for each action, making the system easier to understand, debug, and extend.

- **Character Configuration**: Characters are defined through configuration objects. As seen in `game/character/default.ts`, a character's properties are highly configurable, including:
  - **Frame Data**: Durations for different states (e.g., jump squat, dash).
  - **Physics**: Walking/running speeds, fall speeds, jump velocity, and weight.
  - **Attacks**: A map of attack definitions, each with its own properties like knockback, damage, and active frames.
  - **Hitboxes & Hurtboxes**: Defined capsules for collision detection.

This component-based and data-driven approach allows for new characters and mechanics to be added with minimal changes to the core engine code.

## Getting Started

Follow these steps to get a local copy up and running.

### Prerequisites

- Node.js and npm
  ```sh
  npm install npm@latest -g
  ```

### Installation

1.  Clone the repo
    ```sh
    git clone https://github.com/WilliamRMoore/Jazz.git
    ```
2.  Install NPM packages
    ```sh
    npm install
    ```

### Running the Project

1.  Start the development server:
    ```sh
    npm start
    ```
    This will build the project, start a local server, and watch for any file changes.
2.  Open your browser and navigate to the local address provided by esbuild (usually `http://127.0.0.1:8000/`).
3.  Connect a gamepad and select a game mode to start.

### Building for Production

To create a bundled version of the game for deployment, run:

```sh
npm run build
```

This will generate a bundled JavaScript file in the `dist/` directory.

![Diagran](https://raw.githubusercontent.com/WilliamRMoore/HtmxDotnet/refs/heads/main/game-architecture-Finite%20State%20Machine%20Arch.webp)
