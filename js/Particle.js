/**
 * Represents a particle in the Plinko game with physics properties and visual effects.
 * @class Particle
 */
class Particle {
    /**
     * Creates a new particle with physics properties and visual effects.
     * @constructor
     * @param {number} x - Initial x position
     * @param {number} y - Initial y position
     * @param {number} r - Particle radius
     * @param {p5.Color} [particleColor] - Optional custom color for the particle
     */
    constructor(x, y, r, particleColor) {
        var options = {
            restitution: 0.4,
            friction: 0.5,
            density: 0.8,
            frictionAir: 0.01
        }
        this.r = r;
        this.body = Bodies.circle(x, y, this.r, options);
        this.targetColor = particleColor || color(random(50, 200), random(50, 200), random(50, 200));
        this.currentColor = this.targetColor;
        this.colorTransitionSpeed = 0.1;
        this.trail = [];
        this.maxTrailLength = 10;
        this.isNew = true;
        World.add(world, this.body);
    }

    /**
     * Sets a new target color for smooth color transition.
     * @method setColor
     * @param {p5.Color} newColor - New target color
     * @public
     */
    setColor(newColor) {
        this.targetColor = newColor;
    }

    /**
     * Updates the current color by smoothly interpolating towards the target color.
     * @method updateColor
     * @private
     */
    updateColor() {
        // Smoothly transition to target color
        const currentRed = red(this.currentColor);
        const currentGreen = green(this.currentColor);
        const currentBlue = blue(this.currentColor);
        
        const targetRed = red(this.targetColor);
        const targetGreen = green(this.targetColor);
        const targetBlue = blue(this.targetColor);
        
        const newRed = lerp(currentRed, targetRed, this.colorTransitionSpeed);
        const newGreen = lerp(currentGreen, targetGreen, this.colorTransitionSpeed);
        const newBlue = lerp(currentBlue, targetBlue, this.colorTransitionSpeed);
        
        this.currentColor = color(newRed, newGreen, newBlue);
    }

    /**
     * Renders the particle with trail effects and glow if enabled.
     * @method display
     * @public
     */
    display() {
        this.updateTrail();
        this.updateColor();
        const pos = this.body.position;
        const vel = this.body.velocity;
        const speed = Math.sqrt(vel.x * vel.x + vel.y * vel.y);
        
        // Draw trail
        if (glowEnabled && !this.isNew) {
            noFill();
            for (let i = 0; i < this.trail.length - 1; i++) {
                const t = this.trail[i];
                const next = this.trail[i + 1];
                const alpha = map(i, 0, this.trail.length, 50, 0);
                stroke(red(this.currentColor), green(this.currentColor), blue(this.currentColor), alpha);
                line(t.x, t.y, next.x, next.y);
            }
        }

        // Draw particle
        push();
        translate(pos.x, pos.y);
        rotate(this.body.angle);
        
        if (glowEnabled) {
            drawingContext.shadowBlur = map(speed, 0, 20, 5, 15);
            drawingContext.shadowColor = color(red(this.currentColor), green(this.currentColor), blue(this.currentColor), 100);
        }
        
        noStroke();
        fill(red(this.currentColor), green(this.currentColor), blue(this.currentColor),
             map(pos.y, 0, height, 255, 200));
        
        ellipseMode(RADIUS);
        ellipse(0, 0, this.r * (this.isNew ? 1.2 : 1), this.r * (this.isNew ? 1.2 : 1));
        pop();
        
        // Remove new particle effect
        if (this.isNew && frameCount % 10 === 0) this.isNew = false;
    }

    /**
     * Updates the particle's trail positions for visual effects.
     * @method updateTrail
     * @private
     */
    updateTrail() {
        const pos = this.body.position;
        this.trail.push(createVector(pos.x, pos.y));
        if (this.trail.length > this.maxTrailLength) {
            this.trail.shift();
        }
    }
}
