/* =========================
   ГЛАВНАЯ — ЛЕТАЮЩИЕ ЗВЁЗДЫ
   ========================= */

(function () {
    "use strict";

    const home = document.getElementById("home");
    const canvas = document.getElementById("home-sky");

    if (!home || !canvas || !canvas.getContext) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const reducedMotion = window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const initialWorlds = [
        { radius: 15, color: [242, 234, 214] },
        { radius: 15, color: [242, 234, 214] },
        { radius: 15, color: [242, 234, 214] },
        { radius: 10, color: [143, 195, 238] },
        { radius: 10, color: [216, 225, 236] },
        { radius: 10, color: [233, 202, 136] }
    ];
    const decorativeStars = [
        { radius: 9, color: [190, 130, 255] },
        { radius: 12, color: [255, 115, 125] },
        { radius: 8, color: [255, 170, 110] },
        { radius: 11, color: [120, 230, 185] },
        { radius: 10, color: [255, 145, 205] },
        { radius: 8, color: [125, 220, 255] },
        { radius: 13, color: [198, 155, 255] },
        { radius: 9, color: [255, 125, 95] },
        { radius: 11, color: [245, 225, 120] },
        { radius: 8, color: [145, 245, 210] },
        { radius: 12, color: [255, 155, 155] },
        { radius: 9, color: [160, 180, 255] },
        { radius: 10, color: [255, 195, 120] },
        { radius: 8, color: [220, 145, 255] },
        { radius: 12, color: [140, 235, 255] },
        { radius: 9, color: [255, 130, 175] }
    ];

    const visibleDecorativeStars = window.matchMedia("(max-width: 700px)").matches
        ? decorativeStars.slice(0, 5)
        : decorativeStars;
    const worlds = initialWorlds.concat(visibleDecorativeStars).map(function (config) {
        return createStar(config, 12 + Math.random() * 14);
    });
    const backgroundStars = [];

    for (let i = 0; i < 180; i++) {
        backgroundStars.push(createStar({
            radius: 0.8 + Math.random() * 1.5,
            background: true
        }, 5 + Math.random() * 11));
    }

    let width = 0;
    let height = 0;
    let lastFrameTime = 0;
    let frameId = null;
    let isInView = false;
    let isPageVisible = !document.hidden;
    let backgroundColor = [140, 140, 140];
    let targetWorld = null;
    let nextHuntAt = null;
    const particles = [];
    const eater = {
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        radius: 27,
        targetX: 0,
        targetY: 0,
        mode: "rest",
        angle: 0,
        eatingWorld: null,
        eatingProgress: 0,
        spikeProgress: 0
    };

    function createStar(config, speed) {
        const angle = Math.random() * Math.PI * 2;

        return {
            config: config,
            radius: config.radius,
            state: "active",
            x: 0,
            y: 0,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            phase: Math.random() * Math.PI * 2,
            twinkleSpeed: 0.5 + Math.random() * 1.2
        };
    }

    function readBackgroundColor() {
        const value = getComputedStyle(document.body)
            .getPropertyValue("--text-placeholder")
            .trim()
            .replace("#", "");

        if (/^[0-9a-f]{6}$/i.test(value)) {
            backgroundColor = [
                parseInt(value.slice(0, 2), 16),
                parseInt(value.slice(2, 4), 16),
                parseInt(value.slice(4, 6), 16)
            ];
        }

    }

    function randomPosition(size, extent) {
        const margin = Math.min(size, extent / 2);
        return margin + Math.random() * Math.max(0, extent - margin * 2);
    }

    function resize() {
        const rect = home.getBoundingClientRect();
        const previousWidth = width;
        const previousHeight = height;

        width = rect.width;
        height = rect.height;

        const ratio = window.devicePixelRatio || 1;
        canvas.width = Math.max(1, Math.round(width * ratio));
        canvas.height = Math.max(1, Math.round(height * ratio));
        context.setTransform(ratio, 0, 0, ratio, 0, 0);

        worlds.concat(backgroundStars).forEach(function (star) {
            if (previousWidth > 0 && previousHeight > 0) {
                star.x *= width / previousWidth;
                star.y *= height / previousHeight;
            } else {
                star.x = randomPosition(star.radius, width);
                star.y = randomPosition(star.radius, height);
            }

            star.x = Math.max(star.radius, Math.min(width - star.radius, star.x));
            star.y = Math.max(star.radius, Math.min(height - star.radius, star.y));
        });

        if (previousWidth > 0 && previousHeight > 0) {
            eater.x *= width / previousWidth;
            eater.y *= height / previousHeight;
        } else {
            eater.x = width * 0.5;
            eater.y = height * 0.45;
            eater.targetX = eater.x;
            eater.targetY = eater.y;
        }

        eater.x = Math.max(eater.radius, Math.min(width - eater.radius, eater.x));
        eater.y = Math.max(eater.radius, Math.min(height - eater.radius, eater.y));

        if (reducedMotion && isInView) draw(performance.now());
    }

    function isWorldActive(world) {
        return world.state !== "absorbing" &&
            world.state !== "respawning" &&
            world.state !== "arriving";
    }

    function moveStar(star, dt) {
        const maxX = Math.max(star.radius, width - star.radius);
        const maxY = Math.max(star.radius, height - star.radius);

        star.x += star.vx * dt;
        star.y += star.vy * dt;

        if (star.x < star.radius) {
            star.x = star.radius;
            star.vx = Math.abs(star.vx);
        } else if (star.x > maxX) {
            star.x = maxX;
            star.vx = -Math.abs(star.vx);
        }

        if (star.y < star.radius) {
            star.y = star.radius;
            star.vy = Math.abs(star.vy);
        } else if (star.y > maxY) {
            star.y = maxY;
            star.vy = -Math.abs(star.vy);
        }
    }

    function resolveCollisions() {
        for (let i = 0; i < worlds.length; i++) {
            const left = worlds[i];
            if (!isWorldActive(left)) continue;

            for (let j = i + 1; j < worlds.length; j++) {
                const right = worlds[j];
                if (!isWorldActive(right)) continue;

                const dx = right.x - left.x;
                const dy = right.y - left.y;
                const distance = Math.hypot(dx, dy);
                const minDistance = left.radius + right.radius;

                if (distance >= minDistance) continue;

                const nx = distance ? dx / distance : 1;
                const ny = distance ? dy / distance : 0;
                const leftMass = left.radius * left.radius;
                const rightMass = right.radius * right.radius;
                const leftInverseMass = 1 / leftMass;
                const rightInverseMass = 1 / rightMass;
                const inverseMassSum = leftInverseMass + rightInverseMass;
                const overlap = minDistance - distance;

                left.x -= nx * overlap * leftInverseMass / inverseMassSum;
                left.y -= ny * overlap * leftInverseMass / inverseMassSum;
                right.x += nx * overlap * rightInverseMass / inverseMassSum;
                right.y += ny * overlap * rightInverseMass / inverseMassSum;

                const relativeSpeed = (right.vx - left.vx) * nx +
                    (right.vy - left.vy) * ny;

                if (relativeSpeed >= 0) continue;

                const impulse = -2 * relativeSpeed / inverseMassSum;
                left.vx -= impulse * leftInverseMass * nx;
                left.vy -= impulse * leftInverseMass * ny;
                right.vx += impulse * rightInverseMass * nx;
                right.vy += impulse * rightInverseMass * ny;
            }
        }
    }

    function createBurst(x, y, color, count, speed) {
        if (reducedMotion) return;

        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const velocity = speed * (0.45 + Math.random() * 0.9);

            particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity,
                radius: 1.5 + Math.random() * 3,
                life: 0.55 + Math.random() * 0.7,
                maxLife: 1.25,
                color: color
            });
        }
    }

    function scatterNearbyWorlds(target) {
        worlds.forEach(function (world) {
            if (world === target || !isWorldActive(world)) return;

            const dx = world.x - target.x;
            const dy = world.y - target.y;
            const distance = Math.hypot(dx, dy);
            const radius = 145;

            if (distance >= radius) return;

            const angle = distance ? Math.atan2(dy, dx) : Math.random() * Math.PI * 2;
            const strength = (1 - distance / radius) * (130 + Math.random() * 100);
            world.vx += Math.cos(angle) * strength;
            world.vy += Math.sin(angle) * strength;
        });
    }

    function findRespawnPosition(world) {
        const margin = world.radius + 4;
        let best = { x: randomPosition(margin, width), y: randomPosition(margin, height) };
        let bestDistance = -1;

        for (let attempt = 0; attempt < 60; attempt++) {
            const candidate = {
                x: randomPosition(margin, width),
                y: randomPosition(margin, height)
            };
            let nearestDistance = Math.hypot(candidate.x - eater.x, candidate.y - eater.y) -
                world.radius - eater.radius;

            worlds.forEach(function (other) {
                if (other === world || !isWorldActive(other)) return;
                nearestDistance = Math.min(
                    nearestDistance,
                    Math.hypot(candidate.x - other.x, candidate.y - other.y) -
                        world.radius - other.radius
                );
            });

            if (nearestDistance > bestDistance) {
                best = candidate;
                bestDistance = nearestDistance;
            }

            if (bestDistance > world.radius + 20) break;
        }

        return best;
    }

    function beginHunt(now) {
        const availableWorlds = worlds.filter(isWorldActive);
        if (!availableWorlds.length) {
            nextHuntAt = now + 2;
            return;
        }

        targetWorld = availableWorlds[Math.floor(Math.random() * availableWorlds.length)];
        eater.mode = "hunting";
        eater.vx = 0;
        eater.vy = 0;
    }

    function beginAbsorption(world, now) {
        world.state = "absorbing";
        world.stateStartedAt = now;
        eater.mode = "eating";
        eater.eatingWorld = world;
        eater.eatingProgress = 0;
        targetWorld = null;

        const color = world.config.color;
        createBurst(world.x, world.y, color, 28, 185);
        scatterNearbyWorlds(world);
    }

    function updateParticles(dt) {
        for (let i = particles.length - 1; i >= 0; i--) {
            const particle = particles[i];
            particle.life -= dt;

            if (particle.life <= 0) {
                particles.splice(i, 1);
                continue;
            }

            particle.x += particle.vx * dt;
            particle.y += particle.vy * dt;
            particle.vx *= Math.exp(-1.8 * dt);
            particle.vy *= Math.exp(-1.8 * dt);
        }
    }

    function updateEater(dt, now) {
        if (eater.mode === "eating") {
            eater.eatingProgress += dt / 0.72;

            if (eater.eatingProgress >= 1) {
                const world = eater.eatingWorld;
                world.state = "respawning";
                world.stateStartedAt = now;
                eater.eatingWorld = null;
                eater.mode = "rest";
                eater.vx = 0;
                eater.vy = 0;
                eater.targetX = eater.x;
                eater.targetY = eater.y;
                nextHuntAt = now + 4 + Math.random() * 4;
            }
        } else if (eater.mode === "hunting" && targetWorld) {
            if (!isWorldActive(targetWorld)) {
                targetWorld = null;
                eater.mode = "wandering";
                nextHuntAt = now + 2;
            } else {
                eater.targetX = targetWorld.x;
                eater.targetY = targetWorld.y;
                const distance = Math.hypot(targetWorld.x - eater.x, targetWorld.y - eater.y);

                if (distance < eater.radius + targetWorld.radius * 0.6) {
                    beginAbsorption(targetWorld, now);
                }
            }
        } else if (nextHuntAt === null) {
            nextHuntAt = now + 5;
        } else if (now >= nextHuntAt) {
            beginHunt(now);
        }

        if (eater.mode === "hunting" && targetWorld) {
            const dx = targetWorld.x - eater.x;
            const dy = targetWorld.y - eater.y;
            const distance = Math.hypot(dx, dy) || 1;
            const speed = 560;
            eater.vx = dx / distance * speed;
            eater.vy = dy / distance * speed;
            eater.x += eater.vx * dt;
            eater.y += eater.vy * dt;

            const margin = eater.radius * 1.4;
            eater.x = Math.max(margin, Math.min(width - margin, eater.x));
            eater.y = Math.max(margin, Math.min(height - margin, eater.y));
            eater.angle += dt * 4;
            eater.spikeProgress = Math.min(1, eater.spikeProgress + dt * 5);
        } else if (eater.mode === "rest") {
            eater.vx = 0;
            eater.vy = 0;
            eater.spikeProgress = Math.max(0, eater.spikeProgress - dt * 2.5);
        } else if (eater.mode === "eating") {
            eater.spikeProgress = Math.min(1, eater.spikeProgress + dt * 3.5);
        }

        worlds.forEach(function (world) {
            const elapsed = now - world.stateStartedAt;
            if (world.state === "absorbing" && world === eater.eatingWorld) {
                const progress = Math.min(1, eater.eatingProgress);
                world.displayX = world.x + (eater.x - world.x) * progress;
                world.displayY = world.y + (eater.y - world.y) * progress;
            } else if (world.state === "respawning" && elapsed >= 0.9) {
                const position = findRespawnPosition(world);
                world.x = position.x;
                world.y = position.y;
                world.vx = (Math.random() - 0.5) * 36;
                world.vy = (Math.random() - 0.5) * 36;
                world.state = "arriving";
                world.stateStartedAt = now;
                world.displayX = undefined;
                world.displayY = undefined;
            } else if (world.state === "arriving" && elapsed >= 0.65) {
                world.state = "active";
            }
        });

        updateParticles(dt);
    }

    function rgba(rgb, alpha) {
        return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
    }

    function drawStar(star, time) {
        const twinkle = reducedMotion
            ? 0.8
            : 0.65 + 0.35 * Math.sin(time * star.twinkleSpeed + star.phase);
        const config = star.config;

        if (config.background) {
            context.globalAlpha = 0.16 + 0.34 * twinkle;
            context.fillStyle = rgba(backgroundColor, 1);
            context.beginPath();
            context.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            context.fill();
            return;
        }

        const color = config.color;
        const absorptionProgress = star.state === "absorbing"
            ? Math.min(1, eater.eatingProgress)
            : 0;
        const arrivalProgress = star.state === "arriving"
            ? Math.min(1, (time - star.stateStartedAt) / 0.65)
            : 1;
        const drawX = Number.isFinite(star.displayX) ? star.displayX : star.x;
        const drawY = Number.isFinite(star.displayY) ? star.displayY : star.y;
        const drawScale = star.state === "absorbing"
            ? Math.max(0.02, 1 - absorptionProgress)
            : star.state === "arriving"
                ? 0.4 + arrivalProgress * 0.6
                : 1;
        const worldAlpha = star.state === "arriving" ? arrivalProgress : 1;
        const radius = star.radius * (0.85 + twinkle * 0.15) * drawScale;
        const glow = context.createRadialGradient(
            drawX, drawY, radius * 0.35,
            drawX, drawY, radius * 3.5
        );

        glow.addColorStop(
            0,
            rgba(color, 0.3 + twinkle * 0.25)
        );
        glow.addColorStop(1, rgba(color, 0));
        context.globalAlpha = worldAlpha;
        context.fillStyle = glow;
        context.beginPath();
        context.arc(drawX, drawY, radius * 3.5, 0, Math.PI * 2);
        context.fill();

        context.fillStyle = rgba(color, 0.65 + twinkle * 0.35);
        context.beginPath();
        context.arc(drawX, drawY, radius, 0, Math.PI * 2);
        context.fill();

        context.globalAlpha = 1;
    }

    function drawParticles() {
        particles.forEach(function (particle) {
            context.globalAlpha = Math.max(0, particle.life / particle.maxLife);
            context.fillStyle = rgba(particle.color, 1);
            context.beginPath();
            context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            context.fill();
        });
        context.globalAlpha = 1;
    }

    function drawEtefir() {
        const hunting = eater.mode === "hunting" || eater.mode === "eating";
        const radius = eater.radius;
        const facingX = targetWorld ? targetWorld.x : eater.x + eater.vx;
        const facingY = targetWorld ? targetWorld.y : eater.y + eater.vy;
        const facing = Math.atan2(facingY - eater.y, facingX - eater.x);

        context.save();
        context.translate(eater.x, eater.y);
        context.rotate(facing);

        for (let i = 0; i < 12; i++) {
            const angle = i * Math.PI * 2 / 12;
            const extension = eater.spikeProgress;
            const innerRadius = radius * (0.86 + extension * 0.06);
            const outerRadius = radius * (0.9 + extension * 0.65);

            if (extension <= 0) continue;

            context.fillStyle = "#17151d";
            context.strokeStyle = "#393242";
            context.lineWidth = 0.8;
            context.beginPath();
            context.moveTo(
                Math.cos(angle - 0.15) * innerRadius,
                Math.sin(angle - 0.15) * innerRadius
            );
            context.lineTo(
                Math.cos(angle) * outerRadius,
                Math.sin(angle) * outerRadius
            );
            context.lineTo(
                Math.cos(angle + 0.15) * innerRadius,
                Math.sin(angle + 0.15) * innerRadius
            );
            context.closePath();
            context.fill();
            context.stroke();
        }

        context.fillStyle = "#050507";
        context.beginPath();
        context.arc(0, 0, radius, 0, Math.PI * 2);
        context.fill();

        const rim = context.createRadialGradient(
            -radius * 0.3, -radius * 0.35, radius * 0.15,
            0, 0, radius
        );
        rim.addColorStop(0, "rgba(68, 62, 78, 0.62)");
        rim.addColorStop(0.5, "rgba(25, 23, 30, 0.22)");
        rim.addColorStop(1, "rgba(0, 0, 0, 0)");
        context.fillStyle = rim;
        context.beginPath();
        context.arc(0, 0, radius, 0, Math.PI * 2);
        context.fill();

        const mouthOpen = hunting ? 0.9 : 0.12;
        context.fillStyle = "#000000";
        context.beginPath();
        context.ellipse(
            radius * 0.62,
            0,
            radius * 0.4,
            radius * mouthOpen,
            0,
            0,
            Math.PI * 2
        );
        context.fill();

        if (hunting) {
            context.strokeStyle = "rgba(116, 91, 126, 0.78)";
            context.lineWidth = 1.5;
            context.beginPath();
            context.ellipse(
                radius * 0.62,
                0,
                radius * 0.42,
                radius * mouthOpen * 1.08,
                0,
                0,
                Math.PI * 2
            );
            context.stroke();

            context.fillStyle = "#d7cbdc";
            for (let i = -2; i <= 2; i++) {
                const toothX = radius * (0.43 + Math.abs(i) * 0.1);
                const toothY = i * radius * 0.12;
                context.beginPath();
                context.moveTo(toothX - radius * 0.045, toothY - radius * 0.035);
                context.lineTo(toothX + radius * 0.045, toothY - radius * 0.035);
                context.lineTo(toothX, toothY + radius * 0.11);
                context.closePath();
                context.fill();
            }
        }

        context.restore();
    }

    function draw(time) {
        if (width < 1 || height < 1) return;

        context.clearRect(0, 0, width, height);
        backgroundStars.forEach(function (star) {
            drawStar(star, time / 1000);
        });
        worlds.forEach(function (world) {
            if (world.state !== "respawning") drawStar(world, time / 1000);
        });
        drawParticles();
        drawEtefir();
        context.globalAlpha = 1;
    }

    function animate(now) {
        frameId = null;
        if (!isInView || !isPageVisible) return;

        const dt = lastFrameTime
            ? Math.min(0.05, (now - lastFrameTime) / 1000)
            : 0;
        lastFrameTime = now;

        if (!reducedMotion) {
            worlds.forEach(function (star) {
                if (star.state !== "absorbing" && star.state !== "respawning" && star.state !== "arriving") {
                    moveStar(star, dt);
                }
            });
            backgroundStars.forEach(function (star) {
                moveStar(star, dt);
            });
            resolveCollisions();
            updateEater(dt, now / 1000);
        }

        draw(now);

        if (!reducedMotion) {
            frameId = requestAnimationFrame(animate);
        }
    }

    function startAnimation() {
        if (!isInView || !isPageVisible || frameId !== null) return;
        frameId = requestAnimationFrame(animate);
    }

    function stopAnimation() {
        if (frameId !== null) cancelAnimationFrame(frameId);
        frameId = null;
        lastFrameTime = 0;
    }

    function updateVisibility() {
        if (isInView && isPageVisible) {
            if (reducedMotion) draw(performance.now());
            else startAnimation();
        } else {
            stopAnimation();
        }
    }

    readBackgroundColor();

    if (typeof ResizeObserver === "function") {
        new ResizeObserver(resize).observe(home);
    } else {
        window.addEventListener("resize", resize);
    }
    resize();

    if (typeof IntersectionObserver === "function") {
        new IntersectionObserver(function (entries) {
            isInView = entries.some(function (entry) { return entry.isIntersecting; });
            updateVisibility();
        }).observe(home);
    } else {
        isInView = true;
        updateVisibility();
    }

    document.addEventListener("visibilitychange", function () {
        isPageVisible = !document.hidden;
        updateVisibility();
    });

})();
