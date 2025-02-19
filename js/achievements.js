class AchievementSystem {
    constructor() {
        this.achievements = {
            scoring: [
                {
                    id: 'score_1000',
                    title: 'Beginner\'s Luck',
                    description: 'Score 1,000 points in a single game',
                    requirement: score => score >= 1000,
                    reward: 'Rainbow Trail Effect'
                },
                {
                    id: 'score_10000',
                    title: 'Professional',
                    description: 'Score 10,000 points in a single game',
                    requirement: score => score >= 10000,
                    reward: 'Golden Particles'
                },
                {
                    id: 'score_100000',
                    title: 'Plinko Master',
                    description: 'Score 100,000 points in a single game',
                    requirement: score => score >= 100000,
                    reward: 'Master Badge'
                }
            ],
            combo: [
                {
                    id: 'combo_5',
                    title: 'Combo Starter',
                    description: 'Achieve a 5x combo',
                    requirement: combo => combo >= 5,
                    reward: 'Combo Counter Effect'
                },
                {
                    id: 'combo_10',
                    title: 'Combo Expert',
                    description: 'Achieve a 10x combo',
                    requirement: combo => combo >= 10,
                    reward: 'Particle Trail Effect'
                },
                {
                    id: 'combo_20',
                    title: 'Combo Master',
                    description: 'Achieve a 20x combo',
                    requirement: combo => combo >= 20,
                    reward: 'Lightning Effect'
                }
            ],
            powerups: [
                {
                    id: 'powerup_collector',
                    title: 'Power Player',
                    description: 'Collect 10 powerups in a single game',
                    requirement: count => count >= 10,
                    reward: 'Extended Powerup Duration'
                },
                {
                    id: 'powerup_master',
                    title: 'Powerup Master',
                    description: 'Have 3 powerups active simultaneously',
                    requirement: active => active >= 3,
                    reward: 'Powerup Magnet Effect'
                }
            ],
            challenges: [
                {
                    id: 'perfect_run',
                    title: 'Perfect Run',
                    description: 'Score points with every particle in Challenge Mode',
                    requirement: ratio => ratio === 1,
                    reward: 'Golden Trail Effect'
                },
                {
                    id: 'speed_demon',
                    title: 'Speed Demon',
                    description: 'Score 5000 points in under 30 seconds',
                    requirement: (score, time) => score >= 5000 && time <= 30,
                    reward: 'Fire Trail Effect'
                }
            ]
        };

        this.unlockedAchievements = new Set(
            JSON.parse(localStorage.getItem('unlockedAchievements')) || []
        );
        this.activeRewards = new Set();
    }

    check(type, ...args) {
        const categoryAchievements = this.achievements[type];
        if (!categoryAchievements) return;

        for (const achievement of categoryAchievements) {
            if (!this.unlockedAchievements.has(achievement.id) && 
                achievement.requirement(...args)) {
                this.unlock(achievement);
            }
        }
    }

    unlock(achievement) {
        this.unlockedAchievements.add(achievement.id);
        localStorage.setItem('unlockedAchievements', 
            JSON.stringify([...this.unlockedAchievements]));

        // Show unlock notification
        ui.addNotification(
            `Achievement Unlocked: ${achievement.title}!`,
            'achievement'
        );

        // Create unlock effect
        this.createUnlockEffect();

        // Apply reward
        this.applyReward(achievement);
    }

    applyReward(achievement) {
        this.activeRewards.add(achievement.reward);
        
        // Apply visual effects based on reward
        switch (achievement.reward) {
            case 'Rainbow Trail Effect':
                particles.forEach(p => p.enableRainbowTrail());
                break;
            case 'Golden Particles':
                currentColor = color('#FFD700');
                break;
            case 'Particle Trail Effect':
                particles.forEach(p => p.enableTrail());
                break;
            // Add more reward effects here
        }
    }

    createUnlockEffect() {
        // Create particles bursting from the center
        const center = createVector(width/2, height/2);
        for (let i = 0; i < 20; i++) {
            const angle = random(TWO_PI);
            const velocity = p5.Vector.fromAngle(angle).mult(random(5, 10));
            this.effects.push({
                pos: center.copy(),
                vel: velocity,
                color: color(random(['#FFD700', '#FFA500', '#FF4500'])),
                alpha: 255,
                size: random(5, 10)
            });
        }
    }

    display() {
        // Draw achievement unlock effects
        for (let i = this.effects.length - 1; i >= 0; i--) {
            const effect = this.effects[i];
            effect.pos.add(effect.vel);
            effect.alpha -= 5;

            push();
            noStroke();
            fill(effect.color.levels[0], effect.color.levels[1], 
                 effect.color.levels[2], effect.alpha);
            circle(effect.pos.x, effect.pos.y, effect.size);
            pop();

            if (effect.alpha <= 0) {
                this.effects.splice(i, 1);
            }
        }
    }

    getProgress(achievementId) {
        const achievement = Object.values(this.achievements)
            .flat()
            .find(a => a.id === achievementId);
        
        if (!achievement) return 0;
        
        // Calculate progress based on achievement type
        switch(achievement.id) {
            case 'score_1000':
                return min(game.score / 1000, 1);
            case 'combo_5':
                return min(game.combo / 5, 1);
            // Add more progress calculations
            default:
                return 0;
        }
    }

    reset() {
        this.effects = [];
        this.activeRewards.clear();
    }
}

const achievements = new AchievementSystem();