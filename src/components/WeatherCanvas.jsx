import React, { useEffect, useRef } from 'react';

export default function WeatherCanvas({ weatherType = 'clear', isDay = 1 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particles setup
    const particles = [];
    const numParticles = weatherType === 'rain' ? 140 : weatherType === 'snow' ? 90 : 45;

    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        length: Math.random() * 20 + 10,
        speedY: Math.random() * 8 + 6, // rain speed
        speedX: Math.random() * 2 - 1, // drift
        radius: Math.random() * 3 + 1, // snow radius
        opacity: Math.random() * 0.6 + 0.2
      });
    }

    // Lightning setup
    let lightningTimer = 0;
    let isLightningActive = false;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Rain Effect
      if (weatherType === 'rain') {
        ctx.strokeStyle = 'rgba(186, 230, 253, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.lineCap = 'round';

        for (let p of particles) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.speedX, p.y + p.length);
          ctx.stroke();

          p.y += p.speedY;
          p.x += p.speedX;

          if (p.y > height) {
            p.y = -20;
            p.x = Math.random() * width;
          }
        }
      }
      // 2. Snow Effect
      else if (weatherType === 'snow') {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        for (let p of particles) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();

          p.y += (p.radius * 0.6);
          p.x += Math.sin(p.y * 0.01) * 0.8;

          if (p.y > height) {
            p.y = -10;
            p.x = Math.random() * width;
          }
        }
      }
      // 3. Thunderstorm
      else if (weatherType === 'thunder') {
        // Rain particles
        ctx.strokeStyle = 'rgba(216, 180, 254, 0.5)';
        ctx.lineWidth = 2;
        for (let p of particles) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.speedX * 1.5, p.y + p.length * 1.2);
          ctx.stroke();

          p.y += p.speedY * 1.2;
          p.x += p.speedX * 1.5;

          if (p.y > height) {
            p.y = -20;
            p.x = Math.random() * width;
          }
        }

        // Lightning flash
        lightningTimer++;
        if (lightningTimer % 220 === 0) {
          isLightningActive = true;
          setTimeout(() => {
            isLightningActive = false;
          }, 120);
        }

        if (isLightningActive) {
          ctx.fillStyle = 'rgba(243, 232, 255, 0.15)';
          ctx.fillRect(0, 0, width, height);
        }
      }
      // 4. Sunny / Clear Day Sunbeams or Night Stars
      else if (weatherType === 'clear') {
        if (isDay) {
          // Subtle warm floating dust / light motes
          ctx.fillStyle = 'rgba(254, 240, 138, 0.4)';
          for (let p of particles) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius * 0.8, 0, Math.PI * 2);
            ctx.fill();

            p.y -= 0.3;
            p.x += Math.sin(p.y * 0.02) * 0.3;

            if (p.y < 0) {
              p.y = height + 10;
              p.x = Math.random() * width;
            }
          }
        } else {
          // Night twinkling stars
          for (let p of particles) {
            const twinkle = Math.sin(Date.now() * 0.003 + p.x) * 0.4 + 0.5;
            ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity * twinkle})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius * 0.7, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [weatherType, isDay]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.8
      }}
    />
  );
}
