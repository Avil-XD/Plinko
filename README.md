# Plinko Arcade 🎮

A modern, physics-based Plinko game built with vanilla JavaScript, featuring realistic ball physics, particle effects, and an engaging scoring system.

![Plinko Arcade Demo](https://raw.githubusercontent.com/Avil-XD/Plinko/master/preview.gif)

## 🎯 Features

- **Physics-Based Gameplay**: Utilizes Matter.js for realistic ball physics and collisions
- **Dynamic Scoring System**: 
  - Multiple scoring zones with different multipliers
  - Combo system for bonus points
  - High score tracking using local storage
- **Interactive Elements**:
  - Immersive sound effects with mute option
  - Particle effects and score animations
  - Visual feedback for collisions and points
- **Multiple Difficulty Levels**:
  - Easy Mode: Standard physics
  - Medium Mode: Enhanced physics challenge
  - Hard Mode: Maximum difficulty with higher rewards
- **Responsive Design**:
  - Adapts to different screen sizes
  - Touch-friendly controls for mobile devices
  - Keyboard accessibility support

## 🎮 How to Play

1. **Starting the Game**:
   - Click the "Drop Ball" button or press Spacebar to release a ball
   - You start with 5 balls per game
   - Choose your difficulty level from the dropdown menu

2. **Scoring**:
   - Different zones at the bottom offer various multipliers (2x to 10x)
   - Quick consecutive scores build up combos for bonus points
   - Try to aim for high-value zones while maintaining combos

3. **Controls**:
   - 🖱️ Click/Tap "Drop Ball" to release a ball
   - 🎮 Use Spacebar as an alternative to drop balls
   - 🔊 Toggle sound effects with the sound button
   - ℹ️ Access game rules via the help icon
   - 🔄 Restart the game anytime with the restart button

## 🛠️ Technologies Used

- **Matter.js**: Physics engine for realistic ball movement
- **Howler.js**: Audio library for sound effects
- **HTML5 Canvas**: Game rendering
- **CSS3**: Animations and responsive design
- **Vanilla JavaScript**: Game logic and interactions

## ⚙️ Technical Implementation

- **Performance Optimizations**:
  - Efficient ball cleanup system
  - Optimized collision detection
  - Pooled sound effects for smooth playback
  - Responsive canvas scaling
- **Modern JavaScript Features**:
  - ES6+ syntax
  - Event-driven architecture
  - Error handling system
  - Modular code structure

## 🚀 Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/Avil-XD/Plinko.git
   ```

2. Open `index.html` in a modern web browser.

3. Start playing!

## 💻 Development

To modify or enhance the game:

1. Adjust physics parameters in the `CONFIG` object
2. Modify scoring multipliers in the `multipliers` array
3. Customize colors and styles in `style.css`
4. Add new sound effects to the `sounds` object

## 🌟 Future Enhancements

- [ ] Additional game modes
- [ ] Power-ups and special balls
- [ ] Online leaderboard
- [ ] Achievement system
- [ ] Custom themes