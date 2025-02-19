/**
 * Represents a static peg in the Plinko game with collision detection and visual effects.
 * @class Plinko
 */
class Plinko {
    /**
     * Creates a new static peg with physics properties.
     * @constructor
     * @param {number} x - X position of the peg
     * @param {number} y - Y position of the peg
     */
    constructor(x, y) {
        var options = {
            isStatic: true,
            restitution: 0.6
        }
        this.r = 10;
        this.body = Bodies.circle(x, y, this.r, options);
        World.add(world, this.body);
        this.hitEffects = [];
        this.lastHitTime = 0;
    }

    /**
     * Creates a visual effect when a particle hits the peg.
     * @method createHitEffect
     * @param {number} x - X position of the hit effect
     * @param {number} y - Y position of the hit effect
     * @param {p5.Color} color - Color of the hit effect based on particle color
     * @private
     */
    createHitEffect(x, y, color) {
        this.hitEffects.push({
            x, y,
            color,
            alpha: 255,
            size: this.r * 2
        });
    }

    /**
     * Renders the peg and updates its hit effects.
     * Also checks for collisions with particles.
     * @method display
     * @public
     */
    display() {
        var pos = this.body.position;
        
        // Draw hit effects
        for (let i = this.hitEffects.length - 1; i >= 0; i--) {
            const effect = this.hitEffects[i];
            noFill();
            stroke(red(effect.color), green(effect.color), blue(effect.color), effect.alpha);
            strokeWeight(2);
            circle(effect.x, effect.y, effect.size);
            
            // Update effect
            effect.size += 2;
            effect.alpha -= 15;
            
            // Remove faded effects
            if (effect.alpha <= 0) {
                this.hitEffects.splice(i, 1);
            }
        }
        
        // Draw peg
        push();
        translate(pos.x, pos.y);
        fill(255);
        noStroke();
        ellipseMode(RADIUS);
        circle(0, 0, this.r);
        
        // Add subtle glow to pegs
        if (glowEnabled) {
            drawingContext.shadowBlur = 5;
            drawingContext.shadowColor = 'rgba(255, 255, 255, 0.5)';
        }
        pop();

        // Check for collisions with particles
        for (let particle of particles) {
            const dx = particle.body.position.x - pos.x;
            const dy = particle.body.position.y - pos.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < this.r + particle.r && frameCount - this.lastHitTime > 5) {
                this.createHitEffect(pos.x, pos.y, particle.currentColor);
                this.lastHitTime = frameCount;
            }
        }
    }
}
