class UI {
    constructor() {
        this.gameState = 'menu'; // menu, game, settings, tutorial
        this.menuAlpha = 255;
        this.notifications = [];
        this.achievements = [];
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Menu buttons
        document.querySelectorAll('[data-action]').forEach(button => {
            button.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                this.handleMenuAction(action);
            });
        });
    }

    handleMenuAction(action) {
        switch(action) {
            case 'play':
                this.startGame('classic');
                break;
            case 'timeAttack':
                this.startGame('timeAttack');
                break;
            case 'challenge':
                this.startGame('challenge');
                break;
            case 'settings':
                this.showSettings();
                break;
            case 'tutorial':
                this.showTutorial();
                break;
        }
    }

    draw() {
        switch(this.gameState) {
            case 'menu':
                this.drawMenu();
                break;
            case 'game':
                this.drawHUD();
                break;
            case 'settings':
                this.drawSettings();
                break;
            case 'tutorial':
                this.drawTutorial();
                break;
        }

        // Always draw notifications and achievements
        this.updateNotifications();
        this.updateAchievements();
    }

    drawMenu() {
        push();
        background(0, this.menuAlpha);
        
        // Title
        textAlign(CENTER);
        textSize(64);
        fill(255);
        textFont('Montserrat');
        textStyle(BOLD);
        text('PLINKO PRO', width/2, height/3);

        // Animated subtitle
        textSize(24);
        textStyle(NORMAL);
        const pulseAmount = sin(frameCount * 0.05) * 20 + 200;
        fill(255, pulseAmount);
        text('Click to Start', width/2, height/2);

        // Menu buttons
        this.drawMenuButtons();
        pop();
    }

    drawMenuButtons() {
        const buttons = [
            { text: 'Classic Mode', action: 'play' },
            { text: 'Time Attack', action: 'timeAttack' },
            { text: 'Daily Challenge', action: 'challenge' },
            { text: 'Settings', action: 'settings' },
            { text: 'How to Play', action: 'tutorial' }
        ];

        const buttonHeight = 50;
        const spacing = 20;
        const totalHeight = buttons.length * (buttonHeight + spacing);
        let y = height/2 + 100;

        buttons.forEach((btn, i) => {
            const x = width/2;
            const w = 250;
            const isHovered = this.isMouseOverButton(x - w/2, y, w, buttonHeight);
            
            // Button background
            fill(isHovered ? color(255, 100) : color(255, 50));
            noStroke();
            rect(x - w/2, y, w, buttonHeight, 25);
            
            // Button text
            fill(255);
            textSize(20);
            textAlign(CENTER, CENTER);
            text(btn.text, x, y + buttonHeight/2);
            
            y += buttonHeight + spacing;
        });
    }

    drawHUD() {
        push();
        textAlign(LEFT);
        textSize(24);
        fill(255);
        
        // Score
        text(`Score: ${game.score}`, 20, 40);
        text(`High Score: ${game.highScore}`, 20, 70);
        
        // Mode-specific HUD
        if (game.mode === 'timeAttack') {
            text(`Time: ${Math.ceil(game.timeLeft)}s`, width - 150, 40);
        } else if (game.mode === 'challenge') {
            text(`Particles: ${game.particlesLeft}`, width - 150, 40);
        }
        
        // Combo
        if (game.combo > 1) {
            textAlign(CENTER);
            textSize(32);
            fill(255, 200);
            text(`${game.combo}x Combo!`, width/2, 50);
        }
        pop();
    }

    drawSettings() {
        push();
        background(0, 200);
        
        textAlign(CENTER);
        textSize(48);
        fill(255);
        text('Settings', width/2, 100);
        
        // Settings options
        this.drawSettingsOptions();
        pop();
    }

    drawTutorial() {
        push();
        background(0, 200);
        
        textAlign(CENTER);
        textSize(48);
        fill(255);
        text('How to Play', width/2, 100);
        
        // Tutorial steps
        textSize(24);
        textAlign(LEFT);
        const steps = [
            'Click anywhere to drop particles',
            'Score points as particles land in zones',
            'Chain combos for bonus points',
            'Collect power-ups for special effects',
            'Complete achievements to unlock rewards'
        ];
        
        let y = 200;
        steps.forEach((step, i) => {
            text(`${i + 1}. ${step}`, width/4, y);
            y += 50;
        });
        pop();
    }

    addNotification(text, type = 'info') {
        this.notifications.push({
            text,
            type,
            alpha: 255,
            y: height - 100,
            targetY: height - 100
        });
    }

    updateNotifications() {
        for (let i = this.notifications.length - 1; i >= 0; i--) {
            const notif = this.notifications[i];
            
            // Update position
            notif.y = lerp(notif.y, notif.targetY, 0.1);
            
            // Draw notification
            push();
            textAlign(CENTER);
            textSize(20);
            fill(255, notif.alpha);
            text(notif.text, width/2, notif.y);
            pop();
            
            // Fade out
            notif.alpha -= 5;
            if (notif.alpha <= 0) {
                this.notifications.splice(i, 1);
            }
            
            // Stack notifications
            notif.targetY = height - 100 - (this.notifications.length - 1 - i) * 40;
        }
    }

    addAchievement(title, description) {
        this.achievements.push({
            title,
            description,
            alpha: 255,
            x: -300,
            progress: 0
        });
    }

    updateAchievements() {
        for (let i = this.achievements.length - 1; i >= 0; i--) {
            const achieve = this.achievements[i];
            
            // Slide in from left
            achieve.x = lerp(achieve.x, 20, 0.1);
            
            // Draw achievement
            push();
            fill(0, 150);
            rect(achieve.x, 100 + i * 80, 280, 70, 10);
            
            textAlign(LEFT);
            fill(255, achieve.alpha);
            textSize(18);
            text(achieve.title, achieve.x + 10, 125 + i * 80);
            textSize(14);
            text(achieve.description, achieve.x + 10, 145 + i * 80);
            
            // Progress bar
            noFill();
            stroke(255, achieve.alpha);
            rect(achieve.x + 10, 155 + i * 80, 260, 5);
            fill(255, achieve.alpha);
            noStroke();
            rect(achieve.x + 10, 155 + i * 80, achieve.progress * 260, 5);
            pop();
            
            // Fade out after showing progress
            if (achieve.progress >= 1) {
                achieve.alpha -= 2;
            }
            
            if (achieve.alpha <= 0) {
                this.achievements.splice(i, 1);
            }
        }
    }

    isMouseOverButton(x, y, w, h) {
        return mouseX > x && mouseX < x + w && mouseY > y && mouseY < y + h;
    }

    startGame(mode) {
        this.gameState = 'game';
        game.start(mode);
        this.addNotification(`Starting ${mode} mode!`);
    }

    showSettings() {
        this.gameState = 'settings';
    }

    showTutorial() {
        this.gameState = 'tutorial';
    }
}