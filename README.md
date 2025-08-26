# Jazz 🎷

A 2D platform fighting game engine prototype built with TypeScript and the HTML5 Canvas.

playbe demo here: https://williamrmoore.github.io/Jazz/

Look below for a "How To Play" guide. 

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

## How to Play

### Starting a Game

You can play a running demo of the game in your browser here: [https://williamrmoore.github.io/Jazz/](https://williamrmoore.github.io/Jazz/)

Follow these steps on the game page to get started:

1.  **Select a Mode:** Use the first dropdown menu to choose a game mode like "Test" or "Local 2 player".
2.  **Select Controllers:** After selecting a mode, the controller selection dropdowns will be enabled. Assign a connected gamepad to each player.
    - If your controller doesn't appear in the list, try pressing a button on it and then click the **Refresh** button.
3.  **Start Game:** Once the mode and controllers are configured, click the **Start Game** button to begin the match.

### Controls (Gamepad)

The primary controls are as follows:

- **Movement:** Left Stick
- **Normal Attacks:** `A` button
- **Special Attacks:** `B` button
- **Power Attacks / Aerials:** Right Stick

### Debug Controls

The game engine includes a debugger with special controls that may be active in certain modes (like "Test" mode):

- **Pause/Resume:** Press the `Start` button.
- **Advance One Frame:** While the game is paused, press the `Select` (or `Back`/`View`) button to advance the game by a single frame.

![Diagran](https://raw.githubusercontent.com/WilliamRMoore/HtmxDotnet/refs/heads/main/game-architecture-Finite%20State%20Machine%20Arch.webp)
