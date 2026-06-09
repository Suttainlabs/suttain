import { useEffect, useRef } from 'react';
import { mlToOz } from './useHydrationUnit';

export default function ProgressRing({ intake, goal, size = 220, unit = 'ml' }) {
    const canvasRef = useRef(null);
    const pct = Math.min(intake / Math.max(goal, 1), 1);
    const radius = (size - 24) / 2;
    const cx = size / 2;
    const cy = size / 2;
    const circumference = 2 * Math.PI * radius;

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, size, size);

        // Background ring
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 18;
        ctx.lineCap = 'round';
        ctx.stroke();

        if (pct > 0) {
            // Gradient fill
            const grad = ctx.createLinearGradient(0, 0, size, size);
            grad.addColorStop(0, '#0d9488');
            grad.addColorStop(1, '#2563eb');
            ctx.beginPath();
            ctx.arc(cx, cy, radius, -Math.PI / 2, -Math.PI / 2 + 2 * Math.PI * pct);
            ctx.strokeStyle = grad;
            ctx.lineWidth = 18;
            ctx.lineCap = 'round';
            ctx.stroke();
        }
    }, [pct, size, radius, cx, cy]);

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <canvas ref={canvasRef} width={size} height={size} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-extrabold text-slate-800">
                    {unit === 'oz' ? mlToOz(intake) : intake}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                    of {unit === 'oz' ? mlToOz(goal) : goal} {unit}
                </span>
                <span className="text-xs text-teal-600 font-semibold mt-0.5">{Math.round(pct * 100)}%</span>
            </div>
        </div>
    );
}