import React from 'react';

interface AnimatedBotanicalProps {
  className?: string;
}

export const AnimatedBotanical: React.FC<AnimatedBotanicalProps> = ({ className = '' }) => (
  <svg className={className} viewBox="0 0 100 200" xmlns="http://www.w3.org/2000/svg">
    <style>{`
      .botanical-path { 
        stroke: currentColor; 
        stroke-width: 0.5; 
        fill: none; 
        stroke-dasharray: 1000; 
        stroke-dashoffset: 1000; 
        animation: draw 5s ease-in-out forwards; 
      }
      @keyframes draw { 
        to { stroke-dashoffset: 0; } 
      }
    `}</style>
    <path 
      className="botanical-path" 
      d="M50 200V80 C 50 80 10 70 20 40 C 30 10 50 10 50 10 M50 80 C 50 80 90 70 80 40 C 70 10 50 10 50 10 M50 70 C 50 70 30 60 30 45 M50 70 C 50 70 70 60 70 45 M50 60 C 50 60 40 55 40 45 M50 60 C 50 60 60 55 60 45"
    />
  </svg>
);