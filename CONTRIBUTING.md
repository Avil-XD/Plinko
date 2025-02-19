# Contributing to Plinko Pro

Thank you for your interest in contributing to Plinko Pro! This document provides guidelines and steps for contributing.

## Development Setup

1. Fork and clone the repository:
```bash
git clone https://github.com/yourusername/plinko-pro.git
cd plinko-pro
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

## Code Style

- Use consistent indentation (2 spaces)
- Follow JSDoc conventions for documentation
- Add comments for complex logic
- Use meaningful variable and function names
- Keep functions focused and modular

## Project Structure

```
plinko-pro/
├── js/               # JavaScript source files
│   ├── achievements/ # Achievement system
│   ├── powerups/     # Powerup mechanics
│   └── utils/        # Utility functions
├── assets/
│   ├── images/       # Game images
│   └── sounds/       # Sound effects
└── styles/           # CSS files
```

## Pull Request Process

1. Create a new branch for your feature:
```bash
git checkout -b feature/your-feature-name
```

2. Make your changes and test thoroughly

3. Update documentation if needed

4. Commit your changes using descriptive commit messages:
```bash
git commit -m "feat: add new powerup type"
```

5. Push to your fork and submit a pull request

## Reporting Bugs

When reporting bugs, please include:

- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Browser and system information
- Screenshots if applicable

## Feature Requests

Feature requests are welcome! Please provide:

- Clear description of the feature
- Use cases and benefits
- Any technical considerations
- Mock-ups or sketches if applicable

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow
- Report inappropriate behavior

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
