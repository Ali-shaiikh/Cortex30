"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import { CATEGORIES, CATEGORY_META, type Category } from "@/lib/types";

const AXIS = { stroke: "rgba(255,255,255,0.18)", tick: { fill: "rgba(230,233,242,0.55)", fontSize: 11 } };
const GRID = "rgba(255,255,255,0.06)";
const tooltipStyle = {
  contentStyle: { background: "rgba(10,13,22,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, fontSize: 12 },
  labelStyle: { color: "#e6e9f2" },
  itemStyle: { color: "#e6e9f2" },
};

function TableView({ headers, rows }: { headers: string[]; rows: (string | number)[][] }) {
  return (
    <details className="mt-2 text-xs text-white/60">
      <summary className="cursor-pointer select-none">Table view</summary>
      <table className="mt-2 w-full font-mono">
        <thead>
          <tr>{headers.map((h) => <th key={h} className="py-1 text-left font-normal text-white/40">{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-white/5">{r.map((c, j) => <td key={j} className="py-1">{c}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </details>
  );
}

export function SkillRadar({ data }: { data: { category: Category; score: number }[] }) {
  const rows = data.map((d) => ({ skill: CATEGORY_META[d.category].label, score: Number(d.score.toFixed(1)) }));
  return (
    <div>
      <div className="h-64">
        <ResponsiveContainer>
          <RadarChart data={rows} outerRadius="72%">
            <PolarGrid stroke={GRID} />
            <PolarAngleAxis dataKey="skill" tick={{ fill: "rgba(230,233,242,0.75)", fontSize: 12 }} />
            <PolarRadiusAxis domain={[0, 10]} tick={false} axisLine={false} />
            <Radar dataKey="score" name="Average score" stroke="#6fe7ff" strokeWidth={2} fill="#6fe7ff" fillOpacity={0.15} dot={{ r: 4, fill: "#6fe7ff" }} />
            <Tooltip {...tooltipStyle} formatter={(v) => [`${v}/10`, "Average"]} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <TableView headers={["Skill", "Avg score"]} rows={rows.map((r) => [r.skill, r.score])} />
    </div>
  );
}

export function TrendLine({ points, label }: { points: { day: number; avg: number }[]; label: string }) {
  return (
    <div>
      <div className="h-56">
        <ResponsiveContainer>
          <LineChart data={points} margin={{ top: 10, right: 16, bottom: 0, left: -18 }}>
            <CartesianGrid stroke={GRID} vertical={false} />
            <XAxis dataKey="day" {...AXIS} tickFormatter={(d) => `D${d}`} />
            <YAxis domain={[0, 10]} {...AXIS} />
            <Tooltip {...tooltipStyle} labelFormatter={(d) => `Day ${d}`} formatter={(v) => [`${v}/10`, "Daily average"]} />
            <Line type="monotone" dataKey="avg" stroke="#6fe7ff" strokeWidth={2} dot={{ r: 4, fill: "#6fe7ff", stroke: "#07090f", strokeWidth: 2 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-1 text-xs text-white/50">
        Recent trend: <span className="font-semibold text-white/80">{label}</span>
      </p>
      <TableView headers={["Day", "Average score"]} rows={points.map((p) => [p.day, p.avg])} />
    </div>
  );
}

export function CalibrationScatter({ points }: { points: { category: Category; confidence: number; score: number }[] }) {
  return (
    <div>
      <div className="h-64">
        <ResponsiveContainer>
          <ScatterChart margin={{ top: 10, right: 16, bottom: 10, left: -12 }}>
            <CartesianGrid stroke={GRID} />
            <XAxis type="number" dataKey="confidence" name="Confidence" unit="%" domain={[0, 100]} {...AXIS} />
            <YAxis type="number" dataKey="score" name="Score" unit="%" domain={[0, 100]} {...AXIS} />
            <ZAxis range={[64, 64]} />
            <ReferenceLine segment={[{ x: 0, y: 0 }, { x: 100, y: 100 }]} stroke="rgba(255,255,255,0.3)" strokeDasharray="4 4" label={{ value: "perfect calibration", fill: "rgba(230,233,242,0.45)", fontSize: 10, position: "insideTopLeft" }} />
            <Tooltip {...tooltipStyle} cursor={{ strokeDasharray: "3 3" }} />
            <Legend wrapperStyle={{ fontSize: 12, color: "#e6e9f2" }} />
            {CATEGORIES.map((c) => (
              <Scatter key={c} name={CATEGORY_META[c].label} data={points.filter((p) => p.category === c)} fill={CATEGORY_META[c].color} stroke="#07090f" strokeWidth={2} />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-1 text-xs text-white/50">Above the line = you did better than you expected. Below = overconfident.</p>
      <TableView headers={["Skill", "Confidence", "Score"]} rows={points.map((p) => [CATEGORY_META[p.category].label, `${p.confidence}%`, `${p.score}%`])} />
    </div>
  );
}
