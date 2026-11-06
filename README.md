# Glitchwave | Landing Page for an Indie Game

A landing page for a fictional indie game with a pixel art and neon aesthetic: an action platformer featuring colorful worlds, boss fights, and a synthwave soundtrack. The page includes a mini-game that can be played directly in the browser and is fully responsive across mobile, tablet, and desktop devices.

**Demo:** https://YOUR_USERNAME.github.io/glitchwave/

## Features

- Homepage featuring a synthwave sun, animated grid floor, and glitch-effect title
- Real-time countdown to the game's release date
- **Mini-game** (endless runner) rendered on canvas: jump over obstacles using Space, the Up Arrow key, or touch controls. High scores are saved in the browser
- About the game section with six feature cards
- Three worlds with tabs that dynamically change the preview colors
- Three editions with different prices (Standard, Deluxe, Collector)
- Wishlist form with input validation
- FAQ section with expandable answers on click
- Retro CRT scanline effect, mobile hamburger menu, and scroll animations that are automatically disabled for users who prefer reduced motion

## Technologies

HTML, CSS, and JavaScript, with no frameworks or external dependencies. The mini-game uses the HTML `<canvas>` element. Fonts (Press Start 2P and VT323) are loaded from Google Fonts.

## Project Structure

```text
├── index.html
├── style.css
└── script.js
```

## Getting Started

Open `index.html` in your browser. No server or installation is required.

## Mini-game Controls

| Platform | Action |
|---|---|
| Desktop | `Space` or `↑` to start and jump |
| Mobile | Tap the game screen |

## Customization

| What You Want to Change | Where |
|---|---|
| Game name, email, and prices | `index.html` |
| Release date | `script.js`, the `LAUNCH` constant |
| Worlds (names, colors, descriptions) | `script.js`, the `WORLDS` object |
| Colors and fonts | `style.css`, variables at the beginning |
| Game speed, gravity, and jump physics | `script.js`, the `update` and `jump` functions |

## Note

The wishlist form validates the submitted data and displays a confirmation message, but does not actually send emails anywhere. Game information (levels, bosses, playtime) is fictional.

## License

MIT
