import React from 'react';

const BackgroundBubbles: React.FC = () => {
    return (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
            {/* Base black background is handled by the parent container or global CSS */}

            {/* Primary Orange Bubble */}
            <div
                className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[100px] animate-float-slow"
                style={{ animationDuration: '15s' }}
            />

            {/* Secondary Bubble (Smaller, faster) */}
            <div
                className="absolute bottom-1/3 right-1/4 w-[300px] h-[300px] bg-orange-600/10 rounded-full blur-[80px] animate-float-medium"
                style={{ animationDuration: '12s', animationDelay: '2s' }}
            />

            {/* Accent Bubble */}
            <div
                className="absolute top-2/3 left-1/3 w-[200px] h-[200px] bg-amber-500/5 rounded-full blur-[60px] animate-float-fast"
                style={{ animationDuration: '10s', animationDelay: '5s' }}
            />

            <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0); }
          33% { transform: translate(30px, -50px); }
          66% { transform: translate(-20px, 20px); }
        }
        .animate-float-slow {
          animation: float infinite ease-in-out;
        }
        .animate-float-medium {
             animation: float infinite ease-in-out reverse;
        }
        .animate-float-fast {
             animation: float infinite ease-in-out;
        }
      `}</style>
        </div>
    );
};

export default BackgroundBubbles;
