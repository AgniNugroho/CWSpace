import { TrendingUp, TrendingDown } from "lucide-react";

interface MetricStatCardProps {
  title: string;
  value: string;
  subtitle: string;
  trend?: string;
  isPositive?: boolean;
  icon: any;
}

export function MetricStatCard({
  title,
  value,
  subtitle,
  trend,
  isPositive = true,
  icon: Icon,
}: MetricStatCardProps) {
  return (
    <article className="rounded-3xl border border-white/20 bg-white/10 p-6 backdrop-blur-xl shadow-xl space-y-3 transition hover:-translate-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-300">{title}</span>
        <div className="size-10 rounded-2xl bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center text-cyan-300">
          <Icon size={18} />
        </div>
      </div>

      <div>
        <p className="text-3xl font-black text-white tracking-tight">{value}</p>
        <p className="text-[11px] text-slate-400 mt-1">{subtitle}</p>
      </div>

      {trend && (
        <div className="flex items-center gap-1.5 pt-2 border-t border-white/10 text-xs font-bold">
          {isPositive ? (
            <>
              <TrendingUp size={14} className="text-emerald-400" />
              <span className="text-emerald-400">{trend}</span>
            </>
          ) : (
            <>
              <TrendingDown size={14} className="text-rose-400" />
              <span className="text-rose-400">{trend}</span>
            </>
          )}
          <span className="text-[10px] text-slate-400 font-normal">vs bulan lalu</span>
        </div>
      )}
    </article>
  );
}
