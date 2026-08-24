"use client";

import { ChangeEvent, DragEvent, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, FileImage, LoaderCircle, ShieldCheck, Upload, X } from "lucide-react";
import { diagnoseCrop, DiagnosticResult } from "@/lib/api";

export default function CropDiagnosticUploader() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DiagnosticResult | null>(null);
  const [usingMock, setUsingMock] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function acceptFile(selected: File | undefined) {
    if (!selected) return;
    if (!selected.type.startsWith("image/")) {
      setError("Please choose a JPG, PNG, WEBP, or other image file.");
      return;
    }
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setResult(null);
    setError(null);
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    acceptFile(event.dataTransfer.files[0]);
  }

  async function runDiagnosis() {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const response = await diagnoseCrop(file);
      setResult(response.data);
      setUsingMock(response.mock);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to analyze this image.");
    } finally {
      setLoading(false);
    }
  }

  function clear() {
    setFile(null); setPreview(null); setResult(null); setError(null); setUsingMock(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="panel h-full p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <div><h2 className="flex items-center gap-2 font-semibold text-white"><FileImage size={19} className="text-emerald-400" /> Vision Diagnostic Workbench</h2><p className="mt-1 text-sm text-slate-400">Upload leaf or plant imagery for crop-health screening.</p></div>
        {usingMock && <span className="rounded-full bg-amber-400/10 px-2.5 py-1 text-xs font-medium text-amber-300">Mock inference</span>}
      </div>

      {!file ? (
        <div onClick={() => inputRef.current?.click()} onDragOver={(e) => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={onDrop} className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition ${dragging ? "border-emerald-400 bg-emerald-500/10" : "border-emerald-800/70 bg-slate-900/40 hover:border-emerald-500"}`}>
          <Upload className="mx-auto mb-3 text-emerald-400" size={29} />
          <p className="font-medium text-slate-100">Drop a crop image here</p>
          <p className="mt-1 text-sm text-slate-500">or click to browse · JPG, PNG, WEBP</p>
          <input ref={inputRef} className="hidden" type="file" accept="image/*" onChange={(e: ChangeEvent<HTMLInputElement>) => acceptFile(e.target.files?.[0])} />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="relative overflow-hidden rounded-xl border border-emerald-900/60 bg-slate-900">
            {preview && <img src={preview} alt="Selected crop sample" className="h-48 w-full object-cover" />}
            <button onClick={clear} className="absolute right-2 top-2 rounded-full bg-slate-950/80 p-1.5 text-slate-200 hover:bg-rose-900" aria-label="Remove image"><X size={15} /></button>
            <p className="truncate px-3 py-2 text-xs text-slate-400">{file.name}</p>
          </div>
          <div className="flex flex-col justify-center">
            {!result && <button onClick={runDiagnosis} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60">{loading ? <LoaderCircle className="animate-spin" size={18} /> : <ShieldCheck size={18} />}{loading ? "Running vision model…" : "Run crop diagnosis"}</button>}
            {result && <DiagnosticReport result={result} />}
            {error && <p className="mt-3 flex items-center gap-2 text-sm text-rose-300"><AlertTriangle size={16} />{error}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

function DiagnosticReport({ result }: { result: DiagnosticResult }) {
  const healthy = result.severity === "None" || result.severity === "Low";
  return <div className="rounded-xl border border-emerald-800/60 bg-emerald-950/20 p-4"><div className="flex items-start gap-3"><span className={`rounded-full p-2 ${healthy ? "bg-emerald-400/15 text-emerald-300" : "bg-amber-400/15 text-amber-300"}`}>{healthy ? <CheckCircle2 size={19} /> : <AlertTriangle size={19} />}</span><div><p className="text-xs uppercase tracking-wider text-slate-400">Likely diagnosis</p><p className="font-semibold text-white">{result.disease}</p></div></div><div className="mt-3 grid grid-cols-2 gap-2 text-sm"><Metric label="Confidence" value={`${result.confidence}%`} /><Metric label="Severity" value={result.severity} /></div><p className="mt-3 text-xs leading-5 text-slate-300">{result.treatment}</p>{result.bounding_box && <p className="mt-2 text-[11px] text-slate-500">Detection region: x={result.bounding_box.x}, y={result.bounding_box.y}, {result.bounding_box.width}×{result.bounding_box.height}px</p>}</div>;
}
function Metric({ label, value }: { label: string; value: string }) { return <div className="rounded-lg bg-slate-950/60 p-2"><p className="text-[11px] text-slate-500">{label}</p><p className="font-semibold text-slate-100">{value}</p></div>; }
