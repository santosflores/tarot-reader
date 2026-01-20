import { useProgress } from '@react-three/drei';
import { useEffect, useState } from 'react';

export const Loader = () => {
    const { active, progress } = useProgress();
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (active) {
            setShow(true);
        } else {
            // Delay hiding to ensure smooth transition
            const timer = setTimeout(() => setShow(false), 500);
            return () => clearTimeout(timer);
        }
    }, [active]);

    if (!show) return null;

    return (
        <div
            className={`fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/90 backdrop-blur-3xl transition-opacity duration-500 ${active || progress < 100 ? 'opacity-100' : 'opacity-0'
                }`}
        >
            <div className="w-80 space-y-6 text-center bg-slate-900/50 p-8 rounded-2xl border border-purple-500/20 shadow-2xl shadow-purple-900/50">
                <div className="space-y-2">
                    <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-white to-indigo-200 animate-pulse">
                        Opening the Veil...
                    </div>
                    <div className="text-sm text-purple-200/60 font-medium">
                        Attuning the energies...
                    </div>
                </div>

                <div className="relative pt-2">
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden border border-purple-500/30 shadow-inner">
                        <div
                            className="h-full bg-gradient-to-r from-purple-600 via-indigo-500 to-purple-600 transition-all duration-200 ease-out shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    <div className="mt-4 flex justify-between text-xs font-medium text-purple-300/50 uppercase tracking-widest">
                        <span>Manifesting</span>
                        <span>{Math.floor(progress)}%</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
