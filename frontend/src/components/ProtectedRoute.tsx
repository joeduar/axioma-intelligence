import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface Props {
    children: React.ReactNode;
    role?: 'cliente' | 'asesor';
}

const ProtectedRoute: React.FC<Props> = ({ children, role }) => {
    const { user, profile, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0A0E27] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <img
                        src="/favicon.png"
                        alt="Axioma"
                        className="w-10 h-10 object-contain animate-pulse"
                        style={{ filter: 'drop-shadow(0 0 12px rgba(16,185,129,0.4))' }}
                    />
                    <div className="w-32 h-px bg-white/5 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-[#10B981] rounded-full"
                            style={{ animation: 'loadprogress 1.5s ease-in-out infinite' }}
                        />
                    </div>
                </div>
                <style>{`
          @keyframes loadprogress {
            0% { width: 0%; }
            50% { width: 100%; }
            100% { width: 0%; }
          }
        `}</style>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (role && profile?.role !== role) {
        if (profile?.role === 'asesor') {
            return <Navigate to="/dashboard/asesor" replace />;
        }
        return <Navigate to="/dashboard/cliente" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;