import React, { useEffect, useState } from 'react';

interface Heart {
  id: number;
  left: number; // percentage
  size: number; // px
  delay: number; // seconds
  duration: number; // seconds
  emoji: string;
  horizontalMovement: number; // custom drift
}

export default function HeartConfetti() {
  const [hearts, setHearts] = useState<Heart[]>([]);

  useEffect(() => {
    const emojis = ['💖', '❤️', '💕', '🌸', '🥰', '✨', '💗', '💘', '🧸'];
    const newHearts: Heart[] = Array.from({ length: 35 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: Math.random() * 22 + 12, // 12px to 34px
      delay: Math.random() * 4,
      duration: Math.random() * 3.5 + 4.5, // 4.5s to 8s
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      horizontalMovement: Math.random() * 40 - 20 // -20px to 20px drift
    }));
    setHearts(newHearts);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {hearts.map((heart) => (
        <div
          key={heart.id}
          className="absolute text-center animate-fall"
          style={{
            left: `${heart.left}%`,
            fontSize: `${heart.size}px`,
            animationDelay: `${heart.delay}s`,
            animationDuration: `${heart.duration}s`,
            top: '-50px',
            opacity: 0,
            '--drift': `${heart.horizontalMovement}px`,
          } as React.CSSProperties}
        >
          {heart.emoji}
        </div>
      ))}
      <style>{`
        @keyframes fall {
          0% {
            transform: translateY(0) translateX(0) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.95;
          }
          90% {
            opacity: 0.95;
          }
          100% {
            transform: translateY(115vh) translateX(var(--drift, 20px)) rotate(360deg);
            opacity: 0;
          }
        }
        .animate-fall {
          animation-name: fall;
          animation-iteration-count: infinite;
          animation-timing-function: linear;
        }
      `}</style>
    </div>
  );
}
