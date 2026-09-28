'use client';

const PRESETS = [30, 50, 100];

interface PhotoLimitFieldProps {
  value: number;
  onChange: (value: number) => void;
}

export default function PhotoLimitField({ value, onChange }: PhotoLimitFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs uppercase tracking-wide text-white/50">
        Límite de fotos a seleccionar
      </label>
      <div className="flex flex-wrap items-center gap-2">
        {PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => onChange(preset)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
              value === preset
                ? 'bg-gold text-obsidian'
                : 'border border-glassborder text-white/60 hover:border-gold/50 hover:text-gold'
            }`}
          >
            {preset}
          </button>
        ))}
        <input
          type="number"
          min={1}
          max={1000}
          value={value}
          onChange={(e) => {
            const parsed = parseInt(e.target.value, 10);
            onChange(Number.isNaN(parsed) ? 0 : parsed);
          }}
          className="w-24 rounded-lg border border-glassborder bg-charcoal px-3 py-1.5 text-sm text-offwhite outline-none transition focus:border-gold/60"
        />
      </div>
    </div>
  );
}
