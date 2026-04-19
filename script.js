/**
 * script.js - Advanced Interactive Canvas & UI Behaviors
 */

document.addEventListener('DOMContentLoaded', () => {

    /* --- DOM UI LOGIC --- */
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    const observerOptions = { root: null, rootMargin: '0px', threshold: 0.15 };
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.slide-up, .fade-in.hidden, .fade-in');
    animatedElements.forEach(el => observer.observe(el));

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if(targetElement) {
                const navHeight = navbar.offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - navHeight;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });


    /* --- ADVANCED ML/MATH CANVAS ANIMATION --- */
    const canvas = document.getElementById('ml-math-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width, height;
    let particles = [];
    
    // The physics/network parameters
    const connectionDistance = 160;
    const mouseRepelDistance = 150;
    const numParticlesBase = 60; // will adjust by screen size

    let mouse = { x: null, y: null };

    // Common Math and ML formulas / symbols to inject as special particles
    const mathSymbols = [
        "∫ f(x)dx", "∑", "∂L/∂w", "∇f", "σ(x)", "ŷ = wX + b", 
        "{0, 1}", "Δ", "log(p)", "R²"
    ];

    function initCanvas() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        particles = [];
        
        const numParticles = Math.floor(width * height / 20000); 

        for (let i = 0; i < numParticles; i++) {
            // About 15% of nodes will be text math symbols, the rest are network dots
            const isText = Math.random() < 0.15;
            const text = isText ? mathSymbols[Math.floor(Math.random() * mathSymbols.length)] : null;
            
            particles.push(new Particle(
                Math.random() * width,
                Math.random() * height,
                isText,
                text
            ));
        }
    }

    class Particle {
        constructor(x, y, isText, text) {
            this.x = x;
            this.y = y;
            this.isText = isText;
            this.text = text;
            this.size = isText ? (Math.random() * 6 + 12) : (Math.random() * 2 + 1.5);
            this.speedX = (Math.random() - 0.5) * 0.8;
            this.speedY = (Math.random() - 0.5) * 0.8;
            this.baseSize = this.size;
            
            if(!isText) {
                // Determine color for dots: Most are faint gray, some are tech green/navy
                const chance = Math.random();
                if(chance < 0.2) this.color = 'rgba(13, 110, 60, 0.5)'; // green
                else if(chance < 0.4) this.color = 'rgba(0, 21, 51, 0.4)'; // navy
                else this.color = 'rgba(150, 160, 180, 0.3)'; // neutral
            }
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            // Bounce on edges
            if (this.x > width || this.x < 0) this.speedX = -this.speedX;
            if (this.y > height || this.y < 0) this.speedY = -this.speedY;

            // Mouse interaction logic (Repel slightly)
            if (mouse.x != null && mouse.y != null) {
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < mouseRepelDistance) {
                    let forceDirectionX = dx / distance;
                    let forceDirectionY = dy / distance;
                    // Repel factor
                    this.x -= forceDirectionX * 1.5;
                    this.y -= forceDirectionY * 1.5;
                }
            }
        }

        draw() {
            if (this.isText) {
                ctx.font = `600 ${this.size}px 'Fira Code', monospace`;
                ctx.fillStyle = 'rgba(13, 110, 60, 0.25)';
                ctx.textAlign = 'center';
                ctx.fillText(this.text, this.x, this.y);
            } else {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.fill();
            }
        }
    }

    function connectParticles() {
        for (let a = 0; a < particles.length; a++) {
            for (let b = a; b < particles.length; b++) {
                let dx = particles[a].x - particles[b].x;
                let dy = particles[a].y - particles[b].y;
                let distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < connectionDistance) {
                    let opacity = 1 - (distance / connectionDistance);
                    // Network line styling
                    ctx.strokeStyle = `rgba(150, 170, 200, ${opacity * 0.25})`;
                    ctx.lineWidth = 1;

                    // If one of them connects to mouse, make the line cooler
                    if (mouse.x && mouse.y) {
                        let da = Math.sqrt(Math.pow(mouse.x - particles[a].x, 2) + Math.pow(mouse.y - particles[a].y, 2));
                        if(da < mouseRepelDistance) {
                            ctx.strokeStyle = `rgba(13, 110, 60, ${opacity * 0.4})`;
                        }
                    }

                    ctx.beginPath();
                    ctx.moveTo(particles[a].x, particles[a].y);
                    ctx.lineTo(particles[b].x, particles[b].y);
                    ctx.stroke();
                }
            }
        }
    }

    function animateCanvas() {
        ctx.clearRect(0, 0, width, height);
        
        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();
        }
        
        connectParticles();
        requestAnimationFrame(animateCanvas);
    }

    // Set up listeners
    window.addEventListener('resize', initCanvas);
    
    // Mouse tracking for physics
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.x;
        mouse.y = e.y;
    });
    
    window.addEventListener('mouseout', () => {
        mouse.x = null;
        mouse.y = null;
    });

    // Boot
    initCanvas();
    animateCanvas();
});
