'use client';
import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  speed: number;
  rotation: number;
  rotationSpeed: number;
  color: string;
}

export default function FloatingParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number>();

  const colors = [
    'rgba(0, 255, 255, 0.5)',  // Cyan
    'rgba(255, 0, 255, 0.5)',  // Magenta
    'rgba(255, 255, 0, 0.5)',  // Yellow
  ];

  const createParticle = (canvas: HTMLCanvasElement): Particle => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    size: Math.random() * 20 + 10, // Size between 10 and 30
    speed: Math.random() * 0.5 + 0.2, // Speed between 0.2 and 0.7
    rotation: Math.random() * 360,
    rotationSpeed: Math.random() * 2 - 1, // Rotation speed between -1 and 1
    color: colors[Math.floor(Math.random() * colors.length)],
  });

  const initParticles = (canvas: HTMLCanvasElement) => {
    const particleCount = Math.floor((canvas.width * canvas.height) / 10000); // Responsive particle count
    particlesRef.current = Array.from({ length: particleCount }, () => createParticle(canvas));
  };

  const drawParticle = (ctx: CanvasRenderingContext2D, particle: Particle) => {
    ctx.save();
    ctx.translate(particle.x, particle.y);
    ctx.rotate((particle.rotation * Math.PI) / 180);

    // Draw circle
    ctx.beginPath();
    ctx.arc(0, 0, particle.size / 2, 0, Math.PI * 2);
    ctx.fillStyle = particle.color;
    ctx.fill();

    // Draw inner circle for more depth
    ctx.beginPath();
    ctx.arc(0, 0, particle.size / 4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fill();

    ctx.restore();
  };

  const updateParticle = (particle: Particle, canvas: HTMLCanvasElement) => {
    // Update position
    particle.y -= particle.speed;
    particle.rotation += particle.rotationSpeed;

    // Reset particle when it goes off screen
    if (particle.y + particle.size < 0) {
      particle.y = canvas.height + particle.size;
      particle.x = Math.random() * canvas.width;
    }
  };

  const animate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update and draw particles
    particlesRef.current.forEach((particle) => {
      updateParticle(particle, canvas);
      drawParticle(ctx, particle);
    });

    animationFrameRef.current = requestAnimationFrame(animate);
  };

  const handleResize = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size to match container
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Reinitialize particles
    initParticles(canvas);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Initial setup
    handleResize();
    animate();

    // Add resize listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 -z-10"
      style={{ background: 'transparent' }}
    />
  );
} 