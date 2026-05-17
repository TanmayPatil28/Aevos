'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts';
import {
  TrendingUp,
  BarChart2,
  LineChart as LineChartIcon,
  Sparkles,
  Sliders,
  Target,
  CheckCircle2,
  AlertOctagon,
} from 'lucide-react';
import { useForecast, useTrajectory } from '@/lib/hooks/use-analytics';
import { useAcademicStore } from '@/lib/stores/academic-store';

interface TooltipPayloadItem {
  value: number;
  dataKey: string;
  name: string;
  payload: {
    name: string;
    gpa: number;
    cgpa?: number;
    type: 'historical' | 'forecast' | 'simulated';
  };
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

export default function TrendChartSection({ data: fallbackData }: { data: any[] }) {
  const { semesters } = useAcademicStore();
  const { forecast, isLoading: forecastLoading } = useForecast();
  const { trajectory, isLoading: trajLoading } = useTrajectory();

  const [view, setView] = useState<'bar' | 'line'>('line');
  const [isSimulating, setIsSimulating] = useState(false);

  // What-If Simulation State
  const [simSgpa, setSimSgpa] = useState(8.5);
  const [simCredits, setSimCredits] = useState(20);
  const [targetCgpa, setTargetCgpa] = useState<number | ''>('');

  // Simulation Results
  const [simResult, setSimResult] = useState<{
    newCgpa: number;
    cgpaDelta: number;
    requiredSgpa?: number | 'impossible';
  } | null>(null);
  const [simLoading, setSimLoading] = useState(false);

  // Load active trajectory simulation
  useEffect(() => {
    if (!isSimulating) {
      setSimResult(null);
      return;
    }

    const runSimulation = async () => {
      setSimLoading(true);
      try {
        const payload: any = {
          simulatedSgpa: Number(simSgpa),
          simulatedSemesterCredits: Number(simCredits),
        };
        if (targetCgpa !== '') {
          payload.targetCgpa = Number(targetCgpa);
        }

        const res = await fetch('/api/simulations/what-if', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setSimResult(data.data);
          }
        }
      } catch (err) {
        console.error('Simulation failed:', err);
      } finally {
        setSimLoading(false);
      }
    };

    const debounce = setTimeout(runSimulation, 250);
    return () => clearTimeout(debounce);
  }, [simSgpa, simCredits, targetCgpa, isSimulating]);

  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      const typeLabel =
        payload[0].payload.type === 'historical'
          ? 'Completed'
          : payload[0].payload.type === 'forecast'
            ? 'Predicted (AI)'
            : 'Simulated';
      return (
        <div className="glass-card bg-neutral-950/90 border border-primary/20 p-4 rounded-2xl shadow-2xl backdrop-blur-3xl">
          <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">
            {label} ({typeLabel})
          </p>
          <div className="space-y-1">
            <p className="text-sm font-bold text-primary flex items-center justify-between gap-4">
              <span>SGPA:</span> <span>{payload[0].value.toFixed(2)}</span>
            </p>
            {payload[0].payload.cgpa !== undefined && (
              <p className="text-sm font-bold text-purple-400 flex items-center justify-between gap-4">
                <span>CGPA:</span> <span>{payload[0].payload.cgpa.toFixed(2)}</span>
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  // Construct unified data points from real database + forecast
  const chartData = (() => {
    const completed = semesters.filter((s) => s.isCompleted);
    if (completed.length === 0) {
      return fallbackData.map((d: any) => ({
        name: d.name,
        gpa: d.gpa,
        cgpa: d.cgpa,
        type: 'historical' as const,
      }));
    }

    const points: any[] = [];
    let currentCredits = 0;
    let runningPoints = 0;

    // 1. Add historical
    completed.forEach((sem) => {
      const semCredits = sem.subjects.reduce((sum, s) => sum + s.credits, 0) || 20;
      const semSgpa = sem.sgpa ?? 0;
      currentCredits += semCredits;
      runningPoints += semSgpa * semCredits;

      points.push({
        name: `Sem ${sem.semesterNumber}`,
        gpa: semSgpa,
        cgpa: Number((runningPoints / currentCredits).toFixed(2)),
        type: 'historical',
      });
    });

    // 2. Add forecast OR simulation for next semester
    const nextSemNum = completed.length + 1;
    if (isSimulating && simResult) {
      points.push({
        name: `Sem ${nextSemNum} (Sim)`,
        gpa: simSgpa,
        cgpa: simResult.newCgpa,
        type: 'simulated',
      });
    } else if (forecast) {
      currentCredits += 20;
      runningPoints += forecast.predictedSgpa * 20;
      points.push({
        name: `Sem ${nextSemNum} (Est)`,
        gpa: forecast.predictedSgpa,
        cgpa: Number((runningPoints / currentCredits).toFixed(2)),
        type: 'forecast',
      });
    }

    return points;
  })();

  const avgCgpa =
    chartData.length > 0
      ? chartData.reduce((acc, curr) => acc + (curr.cgpa || 0), 0) / chartData.length
      : 0;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="xl:col-span-8 relative group p-8 rounded-[32px] bg-[#0A0F1E]/40 backdrop-blur-[50px] border border-white/[0.05] shadow-[0_30px_90px_rgba(0,0,0,0.8)] h-[520px] flex flex-col justify-between"
      >
        {/* Shimmer Border */}
        <div className="absolute inset-0 rounded-[32px] border-[0.5px] border-white/[0.1] pointer-events-none z-10" />

        <div className="flex items-center justify-between mb-8 z-10">
          <div>
            <h3 className="text-2xl font-black font-headline tracking-tighter text-white flex items-center gap-3">
              <TrendingUp size={24} className="text-[#4F8EF7]" />
              {isSimulating ? 'Academic Projection Lab' : 'CGPA Trajectory & Forecast'}
            </h3>
            <p className="text-[10px] text-white/30 font-black mt-2 uppercase tracking-[0.2em] flex items-center gap-1.5">
              <Sparkles size={10} className="text-primary animate-pulse" />
              {isSimulating ? 'Interactive Simulation Active' : 'Predictive Analytics Enabled'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSimulating(!isSimulating)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                isSimulating
                  ? 'bg-primary/20 text-primary border-primary/30'
                  : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10'
              }`}
            >
              <Sliders size={14} />
              {isSimulating ? 'Close Sandbox' : 'What-If Simulator'}
            </button>

            <div className="bg-white/5 p-1 rounded-xl border border-white/10 flex items-center gap-1">
              <button
                onClick={() => setView('bar')}
                className={`p-2 rounded-lg transition-all ${view === 'bar' ? 'bg-primary text-white' : 'text-white/50 hover:text-white'}`}
              >
                <BarChart2 size={14} />
              </button>
              <button
                onClick={() => setView('line')}
                className={`p-2 rounded-lg transition-all ${view === 'line' ? 'bg-primary text-white' : 'text-white/50 hover:text-white'}`}
              >
                <LineChartIcon size={14} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 w-full min-h-0 relative z-10">
          {forecastLoading || trajLoading ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              {view === 'bar' ? (
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }}
                    dy={10}
                  />
                  <YAxis
                    domain={[0, 10]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }}
                  />
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                  />
                  <Bar dataKey="gpa" radius={[8, 8, 0, 0]} animationDuration={1000}>
                    {chartData.map((entry: any, index: number) => {
                      let color = 'url(#barHistorical)';
                      if (entry.type === 'simulated') color = 'url(#barSimulated)';
                      else if (entry.type === 'forecast') color = 'url(#barForecast)';
                      return <Cell key={`cell-${index}`} fill={color} />;
                    })}
                  </Bar>
                  <ReferenceLine
                    y={avgCgpa}
                    stroke="#fff"
                    strokeDasharray="5 5"
                    strokeOpacity={0.2}
                  />
                  <defs>
                    <linearGradient id="barHistorical" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4F8EF7" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#4F8EF7" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="barForecast" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#A855F7" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#A855F7" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="barSimulated" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22C55E" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#22C55E" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                </BarChart>
              ) : (
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }}
                    dy={10}
                  />
                  <YAxis
                    domain={[0, 10]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="gpa"
                    stroke="#4F8EF7"
                    strokeWidth={4}
                    dot={(props: any) => {
                      const { cx, cy, payload } = props;
                      const fill =
                        payload.type === 'simulated'
                          ? '#22C55E'
                          : payload.type === 'forecast'
                            ? '#A855F7'
                            : '#4F8EF7';
                      return (
                        <circle
                          cx={cx}
                          cy={cy}
                          r={5}
                          fill={fill}
                          stroke="#0A0F1E"
                          strokeWidth={2}
                        />
                      );
                    }}
                    activeDot={{ r: 7, strokeWidth: 0, fill: '#fff' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="cgpa"
                    stroke="#A855F7"
                    strokeWidth={3}
                    strokeDasharray="6 4"
                    dot={false}
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          )}
        </div>

        <div className="mt-6 pt-6 border-t border-white/5 relative z-10 flex items-center justify-between text-xs text-white/50">
          <p className="italic">
            {isSimulating
              ? 'Sandbox mode lets you run hypothetical scenarios without mutating core databases.'
              : trajectory?.insights[0] ||
                'Consistency holds standard academic progression models.'}
          </p>
          <div className="flex gap-4 text-[10px] font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#4F8EF7]" /> Completed
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#A855F7]" /> Forecasted
            </span>
          </div>
        </div>
      </motion.div>

      {/* Simulator Control Drawer */}
      <AnimatePresence>
        {isSimulating && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="xl:col-span-4 p-8 rounded-[32px] bg-[#0A0F1E]/60 border border-white/[0.05] flex flex-col justify-between h-[520px] shadow-2xl backdrop-blur-xl"
          >
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-black font-headline text-white flex items-center gap-2">
                  <Sliders size={18} className="text-emerald-400" /> What-If Simulator
                </h4>
                <p className="text-[10px] text-white/40 mt-1">Test target GPA paths instantly</p>
              </div>

              {/* Slider 1: Simulated SGPA */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-white/70">
                  <span>Simulated SGPA</span>
                  <span className="text-emerald-400 font-mono text-sm">{simSgpa.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="10.0"
                  step="0.05"
                  value={simSgpa}
                  onChange={(e) => setSimSgpa(Number(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                />
              </div>

              {/* Slider 2: Simulated Credits */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-white/70">
                  <span>Semester Credits</span>
                  <span className="text-emerald-400 font-mono text-sm">{simCredits} Credits</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="30"
                  step="1"
                  value={simCredits}
                  onChange={(e) => setSimCredits(Number(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                />
              </div>

              {/* Target CGPA Goal */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-white/70">
                  <span className="flex items-center gap-1">
                    <Target size={12} /> Target CGPA Goal
                  </span>
                </div>
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.01"
                  placeholder="e.g. 9.0"
                  value={targetCgpa}
                  onChange={(e) => {
                    const val = e.target.value;
                    setTargetCgpa(val === '' ? '' : Number(val));
                  }}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 text-sm focus:outline-none focus:border-emerald-400/50 transition-colors"
                />
              </div>
            </div>

            {/* Results Dashboard */}
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-white/40 font-black uppercase">
                  Projected Graduation
                </span>
                {simLoading && (
                  <span className="text-[10px] text-emerald-400 animate-pulse">Computing...</span>
                )}
              </div>

              {simResult ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-baseline">
                    <span className="text-2xl font-black text-white">
                      {simResult.newCgpa.toFixed(2)}
                    </span>
                    <span
                      className={`text-xs font-bold ${simResult.cgpaDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}
                    >
                      {simResult.cgpaDelta >= 0 ? '+' : ''}
                      {simResult.cgpaDelta.toFixed(2)}
                    </span>
                  </div>

                  {targetCgpa !== '' && simResult.requiredSgpa !== undefined && (
                    <div className="pt-2 border-t border-white/5 flex items-start gap-2">
                      {simResult.requiredSgpa === 'impossible' ? (
                        <>
                          <AlertOctagon size={14} className="text-rose-400 flex-shrink-0 mt-0.5" />
                          <p className="text-[10px] text-rose-400/80 leading-snug">
                            Target mathematically unreachable this semester.
                          </p>
                        </>
                      ) : (
                        <>
                          <CheckCircle2
                            size={14}
                            className="text-emerald-400 flex-shrink-0 mt-0.5"
                          />
                          <p className="text-[10px] text-emerald-400/80 leading-snug">
                            You need a minimum SGPA of{' '}
                            <span className="font-black text-white">
                              {simResult.requiredSgpa.toFixed(2)}
                            </span>{' '}
                            to achieve your goal.
                          </p>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-white/30 italic">
                  Adjust parameters to simulate outcomes.
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
