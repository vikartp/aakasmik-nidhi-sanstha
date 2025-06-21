import { useEffect, useRef } from 'react';

// Fun animated confetti for engagement
function launchConfetti(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const W = (canvas.width = window.innerWidth);
  const H = (canvas.height = 220);
  const confettiColors = [
    '#ff9933',
    '#ffffff',
    '#138808',
    '#1976d2',
    '#ffd700',
  ]; // India flag + vibrant
  const confettiCount = 60;
  const confetti: {
    x: number;
    y: number;
    r: number;
    d: number;
    color: string;
    tilt: number;
    tiltAngleIncremental: number;
    tiltAngle: number;
  }[] = [];
  for (let i = 0; i < confettiCount; i++) {
    confetti.push({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 6 + 4,
      d: Math.random() * confettiCount,
      color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
      tilt: Math.floor(Math.random() * 10) - 10,
      tiltAngleIncremental: Math.random() * 0.07 + 0.05,
      tiltAngle: 0,
    });
  }
  let angle = 0;
  function draw() {
    if (!ctx) return;
    ctx.clearRect(0, 0, W, H);
    angle += 0.01;
    for (let i = 0; i < confettiCount; i++) {
      const c = confetti[i];
      c.tiltAngle += c.tiltAngleIncremental;
      c.y += (Math.cos(angle + c.d) + 1 + c.r / 2) / 2;
      c.x += Math.sin(angle);
      c.tilt = Math.sin(c.tiltAngle - (i % 3)) * 15;
      ctx.beginPath();
      ctx.lineWidth = c.r;
      ctx.strokeStyle = c.color;
      ctx.moveTo(c.x + c.tilt + c.r / 3, c.y);
      ctx.lineTo(c.x, c.y + c.tilt + c.r / 3);
      ctx.stroke();
    }
    requestAnimationFrame(draw);
  }
  draw();
}

export default function EngagePublic() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      launchConfetti(canvasRef.current);
    }
  }, []);

  return (
    <div
      className="w-full flex flex-col items-center justify-center relative"
      style={{ minHeight: 220 }}
    >
      <canvas
        ref={canvasRef}
        className="w-full max-w-2xl rounded-lg shadow-lg absolute top-0 left-1/2 -translate-x-1/2 z-0 pointer-events-none"
        style={{ height: 220, zIndex: 0 }}
      />
      <div className="mt-4 text-center px-4 relative z-10">
        <p className="text-lg text-green-600 font-bold animate-bounce mb-1">
          Join hundreds of youth from villages across Jharkhand who are making a
          difference!
        </p>
        <p className="text-lg text-blue-600 font-semibold animate-bounce mb-1">
          Be a part of our vibrant, caring community.
        </p>
        <p className="text-lg text-pink-600 font-semibold animate-bounce mb-1">
          Scan the QR code below to contribute or register now!
        </p>
        <div className="mt-3 flex flex-wrap gap-2 justify-center">
          <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-semibold">
            #India
          </span>
          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
            #Jharkhand
          </span>
          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
            #YouthPower
          </span>
          <span className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-xs font-semibold">
            #Community
          </span>
        </div>
      </div>
    </div>
  );
}
