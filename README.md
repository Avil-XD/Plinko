# Plinko Pro

A modern, interactive implementation of the classic Plinko game using Matter.js physics engine and p5.js.

## Features

- Physical simulation using Matter.js
- Smooth animations with p5.js
- Interactive controls:
  - Click to drop particles
  - Auto-drop mode
  - Adjustable game speed
  - Particle color customization
- Performance stats (FPS, particle count)
- Visual effects toggles (glow effects)
- Sound effects with mute option
- High score tracking
- Mobile-responsive design

## Technologies Used

- Matter.js - Physics engine
- p5.js - Graphics and animation
- HTML5/CSS3 - Modern web standards
- JavaScript (ES6+) - Game logic

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/plinko-pro.git
```

2. Open `index.html` in your web browser

Or use a local development server:

```bash
# Using Python 3
python -m http.server

# Using Node.js
npx http-server
```

## Controls

- Click anywhere on the board to drop a particle
- Use the control panel to:
  - Toggle sound effects
  - Toggle glow effects
  - Adjust game speed
  - Reset the game
  - Change particle colors
  - Enable/disable auto-drop

## Performance Tips

- Disable glow effects on lower-end devices
- Reduce game speed if experiencing lag
- Clear particles using the reset button when too many accumulate

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details
