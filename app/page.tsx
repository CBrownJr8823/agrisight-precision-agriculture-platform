"use client";

import { Activity, CloudSun, Droplets, Leaf, MapPinned, Satellite, Sprout, Waves } from "lucide-react";
import CropDiagnosticUploader from "@/components/CropDiagnosticUploader";
import YieldPredictor from "@/components/YieldPredictor";

const parcels = [
  { name: "North 12", crop: "Corn", acres: 86, moisture: 68, status: "Optimal", color: "bg-emerald-500" },
  { name: "East 07", crop: "Soybean", acres: 64, moisture: 51, status: "Monitor", color: "bg-amber-400" },
  { name: "South 21", crop: "Corn", acres: 94, moisture: 73, status: "Optimal", color: "bg-emerald-500" },
  { name: "West 03", crop: "Wheat", acres: 41, moisture: 39, status: "Irrigate", color: "bg-rose-500" }
];

const heatmap = [62, 68, 74, 65, 51, 58, 72, 79, 47, 52, 61, 69, 36, 43, 55, 64];

function heatColor(value: number) {
  if (value >= 70) return "bg-emerald-400";
  if (value >= 60) return "bg-emerald-500/80";
  if (value >= 50) return "bg-lime-400/80";
  if (value >= 40) return "bg-amber-400/80";
  return "bg-rose-500/80";
}

export default function DashboardPage() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-7 flex flex-col gap-5 border-b border-emerald-900/50 pb-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-emerald-500 p-3 text-slate-950 shadow-lg shadow-emerald-900/40">
            <Sprout size={27} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-400">AgriSight Intelligence</p>
            <h1 className="text-2xl font-bold tracking-tight text-white">Precision Agriculture Command Center</h1>
          </div>
        </div>
        <div className="flex items-center gap-3 self-start rounded-full border border-emerald-800/70 bg-emerald-950/40 px-4 py-2 text-sm text-emerald-200 md:self-auto">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-400" />
          Live telemetry · Central Florida Farm
        </div>
      </header>

      <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={<MapPinned size={20} />} label="Managed acreage" value="285 ac" detail="4 active field parcels" tone="emerald" />
        <StatCard icon={<Droplets size={20} />} label="Average soil moisture" value="58.9%" detail="2.4% above weekly target" tone="sky" />
        <StatCard icon={<Leaf size={20} />} label="Crop health index" value="91 / 100" detail="Excellent growing conditions" tone="lime" />
        <StatCard icon={<CloudSun size={20} />} label="7-day rainfall" value="1.84 in" detail="Next event: Tuesday" tone="amber" />
      </section>

      <section className="grid gap-6 xl:grid-cols-5">
        <div className="panel p-5 xl:col-span-3">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-white"><Satellite size={19} className="text-emerald-400" /><h2 className="font-semibold">Interactive Field Map</h2></div>
              <p className="mt-1 text-sm text-slate-400">Satellite moisture scan • updated 8 minutes ago</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400"><Waves size={15} className="text-cyan-400" /> Moisture heatmap</div>
          </div>
          <div className="grid grid-cols-4 gap-2 rounded-xl border border-emerald-900/40 bg-slate-900/80 p-3 sm:gap-3">
            {heatmap.map((moisture, index) => (
              <div key={index} className={`grid-cell ${heatColor(moisture)} relative aspect-[1.25] rounded-lg p-2 text-xs font-bold text-slate-950`} title={`Zone ${index + 1}: ${moisture}% moisture`}>
                <span>Z{String(index + 1).padStart(2, "0")}</span>
                <span className="absolute bottom-2 right-2">{moisture}%</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-400">
            <span><i className="mr-1 inline-block h-2.5 w-2.5 rounded-full bg-emerald-400" />Optimal 60–80%</span>
            <span><i className="mr-1 inline-block h-2.5 w-2.5 rounded-full bg-amber-400" />Watch 40–59%</span>
            <span><i className="mr-1 inline-block h-2.5 w-2.5 rounded-full bg-rose-500" />Irrigate &lt;40%</span>
          </div>
        </div>

        <div className="panel p-5 xl:col-span-2">
          <div className="mb-4 flex items-center gap-2 text-white"><Activity size={19} className="text-emerald-400" /><h2 className="font-semibold">Field Parcel Status</h2></div>
          <div className="space-y-3">
            {parcels.map((parcel) => (
              <div key={parcel.name} className="rounded-xl border border-white/5 bg-white/[0.035] p-3">
                <div className="flex items-center justify-between gap-3">
                  <div><p className="font-medium text-slate-100">{parcel.name}</p><p className="text-xs text-slate-400">{parcel.crop} · {parcel.acres} acres</p></div>
                  <span className="text-sm font-bold text-white">{parcel.moisture}%</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800"><div className={`${parcel.color} h-full rounded-full`} style={{ width: `${parcel.moisture}%` }} /></div>
                <p className="mt-2 text-xs text-slate-400">Status: <span className="text-slate-200">{parcel.status}</span></p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="panel p-5 lg:col-span-1">
          <h2 className="mb-4 flex items-center gap-2 font-semibold text-white"><Leaf size={19} className="text-emerald-400" /> Nutrient Profile</h2>
          <div className="grid grid-cols-3 gap-3">
            <Nutrient label="Nitrogen" symbol="N" value="84" unit="ppm" color="text-sky-300" />
            <Nutrient label="Phosphorus" symbol="P" value="39" unit="ppm" color="text-amber-300" />
            <Nutrient label="Potassium" symbol="K" value="172" unit="ppm" color="text-violet-300" />
          </div>
          <div className="mt-4 rounded-lg border border-emerald-800/50 bg-emerald-950/30 p-3 text-sm text-emerald-100">pH 6.4 is within the optimal 6.0–6.8 target range for corn.</div>
        </div>
        <div className="lg:col-span-2"><CropDiagnosticUploader /></div>
      </section>

      <section className="mt-6"><YieldPredictor /></section>
      <footer className="py-8 text-center text-xs text-slate-500">AgriSight · Vision inference falls back to deterministic simulated telemetry when the API is unavailable.</footer>
    </main>
  );
}

function StatCard({ icon, label, value, detail, tone }: { icon: React.ReactNode; label: string; value: string; detail: string; tone: "emerald" | "sky" | "lime" | "amber" }) {
  const styles = { emerald: "bg-emerald-500/15 text-emerald-300", sky: "bg-sky-500/15 text-sky-300", lime: "bg-lime-500/15 text-lime-300", amber: "bg-amber-500/15 text-amber-300" };
  return <div className="panel p-4"><div className="flex items-start justify-between"><div><p className="text-sm text-slate-400">{label}</p><p className="mt-1 text-2xl font-bold text-white">{value}</p></div><span className={`rounded-xl p-2 ${styles[tone]}`}>{icon}</span></div><p className="mt-2 text-xs text-slate-500">{detail}</p></div>;
}

function Nutrient({ label, symbol, value, unit, color }: { label: string; symbol: string; value: string; unit: string; color: string }) {
  return <div className="metric-card text-center"><p className={`text-lg font-bold ${color}`}>{symbol}</p><p className="mt-1 text-lg font-semibold text-white">{value}</p><p className="text-[11px] text-slate-500">{unit}</p><p className="mt-2 text-xs text-slate-300">{label}</p></div>;
}
