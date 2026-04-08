import React, { useEffect } from 'react';

interface Props {
    onComplete: () => void;
}

const LogoutScreen: React.FC<Props> = ({ onComplete }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onComplete();
        }, 1800);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div className="fixed inset-0 z-[200] bg-[#0A0E27] flex flex-col items-center justify-center overflow-hidden">
            <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: 'radial-gradient(circle at 50% 50%, rgba(16,185,129,0.05), transparent 65%)' }}
            />

            <div className="flex flex-col items-center gap-6 relative z-10">
                <div className="relative">
                    <div
                        className="absolute inset-0 rounded-full"
                        style={{ background: 'rgba(16,185,129,0.15)', filter: 'blur(24px)' }}
                    />
                    <img
                        src="/favicon.png"
                        alt="Axioma"
                        className="w-14 h-14 object-contain relative z-10"
                        style={{ filter: 'drop-shadow(0 0 20px rgba(16,185,129,0.4))' }}
                    />
                </div>

                <div className="text-center">
                    <h1 className="text-white text-xl font-black tracking-[0.2em] uppercase">
                        AXIOMA
                    </h1>
                    <p className="text-[#10B981] text-[8px] font-bold tracking-[0.45em] uppercase mt-0.5">
                        VENTURES INTELLIGENCE
                    </p>
                </div>

                <p className="text-white/30 text-[10px] font-bold tracking-[0.3em] uppercase animate-pulse">
                    Cerrando sesion...
                </p>

                <div className="w-32 h-px bg-white/5 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-[#10B981] rounded-full"
                        style={{ animation: 'logoutprogress 1.6s ease-in-out forwards' }}
                    />
                </div>
            </div>

            <style>{`
        @keyframes logoutprogress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
        </div>
    );
};

export default LogoutScreen;