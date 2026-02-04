import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI, Type } from "@google/genai";
import { 
  ClipboardList, 
  Target, 
  Calendar, 
  BarChart3, 
  Settings2, 
  Zap, 
  Users,
  CheckCircle2,
  Search,
  TrendingUp,
  ShieldCheck,
  Lightbulb,
  Rocket
} from 'lucide-react';

// --- Types ---
type Section = 'activities' | 'workplan' | 'controls' | 'kpis';

interface POActivity {
  title: string;
  description: string;
  frequency: string;
  impact: 'Alto' | 'Medio' | 'Crítico';
  icon: React.ReactNode;
}

interface KPIItem {
  name: string;
  formula: string;
  target: string;
  category: string;
  action: string;
}

// --- App Component ---
const App = () => {
  const [activeSection, setActiveSection] = useState<Section>('activities');
  const [productContext, setProductContext] = useState('');
  const [generatedKpis, setGeneratedKpis] = useState<KPIItem[]>([]);
  const [loading, setLoading] = useState(false);

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const activities: POActivity[] = [
    { 
      title: 'Estrategia y Visión', 
      description: 'Definir el "Norte" del producto, alineando los objetivos de negocio con las necesidades reales del mercado.',
      frequency: 'Trimestral',
      impact: 'Crítico',
      icon: <Target className="w-5 h-5 text-rose-500" />
    },
    { 
      title: 'Product Discovery', 
      description: 'Investigación continua con usuarios para validar hipótesis antes de comprometer recursos de desarrollo.',
      frequency: 'Continuo',
      impact: 'Alto',
      icon: <Search className="w-5 h-5 text-indigo-500" />
    },
    { 
      title: 'Backlog Health', 
      description: 'Priorización despiadada basada en ROI, urgencia y viabilidad técnica para maximizar el valor entregado.',
      frequency: 'Semanal',
      impact: 'Alto',
      icon: <ClipboardList className="w-5 h-5 text-emerald-500" />
    },
    { 
      title: 'Stakeholder Management', 
      description: 'Negociar expectativas y gestionar la comunicación entre el equipo técnico y los líderes de negocio.',
      frequency: 'Diario',
      impact: 'Medio',
      icon: <Users className="w-5 h-5 text-blue-500" />
    },
    { 
      title: 'Validación de Resultados', 
      description: 'Análisis de data post-lanzamiento para confirmar si las funcionalidades lograron el impacto deseado.',
      frequency: 'Fin de Sprint',
      impact: 'Crítico',
      icon: <TrendingUp className="w-5 h-5 text-amber-500" />
    },
    { 
      title: 'Gestión de Riesgos', 
      description: 'Identificar cuellos de botella legales, técnicos o de mercado que puedan comprometer el roadmap.',
      frequency: 'Quincenal',
      impact: 'Medio',
      icon: <ShieldCheck className="w-5 h-5 text-slate-500" />
    }
  ];

  const generatePlanAndKPIs = async () => {
    if (!productContext) return;
    setLoading(true);
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Como experto en Product Management (CPO), analiza el siguiente producto: "${productContext}".
        Genera 6 KPIs fundamentales divididos por categorías (Negocio, Producto, Usuario) y una recomendación táctica para cada uno.
        Devuelve la respuesta exclusivamente en formato JSON con la estructura: 
        { "kpis": [{ "name": "...", "formula": "...", "target": "...", "category": "...", "action": "..." }] }`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              kpis: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    formula: { type: Type.STRING },
                    target: { type: Type.STRING },
                    category: { type: Type.STRING },
                    action: { type: Type.STRING }
                  },
                  required: ["name", "formula", "target", "category", "action"]
                }
              }
            },
            required: ["kpis"]
          }
        }
      });

      const data = JSON.parse(response.text);
      setGeneratedKpis(data.kpis);
      setActiveSection('kpis');
    } catch (error) {
      console.error("Error generating content:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Sidebar Moderno */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col p-8 fixed h-full shadow-sm">
        <div className="flex items-center gap-3 mb-12">
          <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-2.5 rounded-xl shadow-lg shadow-indigo-100">
            <Rocket className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-xl text-slate-900 leading-none">PO Master</h1>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Framework v2.0</span>
          </div>
        </div>

        <nav className="flex flex-col gap-1.5">
          <NavItem active={activeSection === 'activities'} onClick={() => setActiveSection('activities')} icon={<ClipboardList size={18} />} label="Áreas de Responsabilidad" />
          <NavItem active={activeSection === 'workplan'} onClick={() => setActiveSection('workplan')} icon={<Calendar size={18} />} label="Ciclo de Vida del PO" />
          <NavItem active={activeSection === 'controls'} onClick={() => setActiveSection('controls')} icon={<Settings2 size={18} />} label="Matriz de Seguimiento" />
          <NavItem active={activeSection === 'kpis'} onClick={() => setActiveSection('kpis')} icon={<BarChart3 size={18} />} label="KPIs Personalizados" />
        </nav>

        <div className="mt-auto pt-8">
          <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-4 h-4 text-indigo-600" />
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Consultor Pro</p>
            </div>
            <textarea 
              className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none h-28 resize-none placeholder:text-slate-300"
              placeholder="Ej: App de delivery B2B para restaurantes en Latam..."
              value={productContext}
              onChange={(e) => setProductContext(e.target.value)}
            />
            <button 
              onClick={generatePlanAndKPIs}
              disabled={loading}
              className="w-full mt-4 bg-slate-900 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-600 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Zap size={16} /> Generar Inteligencia
                </>
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-72 flex-1 p-12">
        <header className="mb-12">
          <div className="flex items-center gap-2 text-indigo-600 font-semibold text-sm mb-2">
            <div className="w-8 h-px bg-indigo-200" />
            Recurso para Product Owners
          </div>
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            {activeSection === 'activities' && 'Responsabilidades de Alto Impacto'}
            {activeSection === 'workplan' && 'Roadmap de Trabajo del PO'}
            {activeSection === 'controls' && 'Controles de Negocio y Producto'}
            {activeSection === 'kpis' && 'Dashboard de Métricas Generadas'}
          </h2>
          <p className="text-slate-500 mt-3 text-lg max-w-2xl leading-relaxed">
            {activeSection === 'activities' && 'Las 6 dimensiones críticas donde el Product Owner debe enfocar su tiempo para asegurar el retorno de inversión.'}
            {activeSection === 'workplan' && 'Un proceso estructurado desde la concepción estratégica hasta el escalamiento de la solución.'}
            {activeSection === 'controls' && 'Herramientas y artefactos para mantener el rumbo, mitigar riesgos y comunicar el progreso.'}
            {activeSection === 'kpis' && 'Métricas derivadas específicamente para tu contexto de producto mediante análisis de IA.'}
          </p>
        </header>

        {activeSection === 'activities' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {activities.map((act, idx) => (
              <div key={idx} className="bg-white p-7 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-start justify-between mb-6">
                  <div className="p-3.5 bg-slate-50 rounded-2xl">{act.icon}</div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-bold text-slate-400 uppercase mb-1">Impacto</span>
                    <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${
                      act.impact === 'Crítico' ? 'bg-rose-50 text-rose-600' :
                      act.impact === 'Alto' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
                    }`}>
                      {act.impact}
                    </span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{act.title}</h3>
                <p className="text-slate-500 leading-relaxed text-sm mb-6">{act.description}</p>
                <div className="pt-4 border-t border-slate-50 flex items-center gap-2 text-slate-400">
                  <Calendar size={14} />
                  <span className="text-xs font-medium">Revisión: {act.frequency}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeSection === 'workplan' && (
          <div className="space-y-10 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
            <TimelineItem 
              phase="FASE 1: Estrategia y Alineación" 
              tasks={['Definición del North Star Metric', 'Customer Persona Mapping', 'Análisis de Market-Fit']} 
              status="Fundación"
              color="indigo"
            />
            <TimelineItem 
              phase="FASE 2: Descubrimiento y Diseño" 
              tasks={['Prototipado de baja fidelidad', 'Pruebas de usabilidad', 'Definición de Historias de Usuario']} 
              status="Definición"
              color="blue"
            />
            <TimelineItem 
              phase="FASE 3: Entrega Continua (Build)" 
              tasks={['Planificación de Sprints', 'Refinamiento de Backlog', 'Gestión de Deuda Técnica']} 
              status="Ejecución"
              color="emerald"
            />
            <TimelineItem 
              phase="FASE 4: Medición y Optimización" 
              tasks={['A/B Testing', 'Análisis de Embudo de Conversión', 'Feedback de Stakeholders']} 
              status="Crecimiento"
              color="amber"
            />
          </div>
        )}

        {activeSection === 'controls' && (
          <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Matriz de Control Estratégico</h3>
                <p className="text-sm text-slate-500 mt-1">Cómo asegurar que el equipo camina en la dirección correcta.</p>
              </div>
              <div className="flex gap-2">
                <span className="bg-white px-3 py-1 rounded-full border border-slate-200 text-xs font-semibold text-slate-600">6 Controles Activos</span>
              </div>
            </div>
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white border-b border-slate-100">
                  <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Artefacto / Control</th>
                  <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Responsabilidad PO</th>
                  <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Indicador Clave</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm">
                <TableRow item="OKRs (Objectives & Key Results)" purpose="Asegurar alineación con metas de la empresa" freq="Nivel de Cumplimiento" />
                <TableRow item="Burndown Chart / Velocity" purpose="Predecir fechas de entrega y detectar bloqueos" freq="Consistencia del Equipo" />
                <TableRow item="User Feedback Loop" purpose="Validar que la funcionalidad resuelve el problema" freq="NPS / CSAT" />
                <TableRow item="Matriz de Riesgos" purpose="Anticipar fallos de cumplimiento o técnicos" freq="Nivel de Exposición" />
                <TableRow item="Experiment Backlog" purpose="Priorizar qué aprender sobre qué construir" freq="Hipótesis Validadas" />
                <TableRow item="DORA Metrics" purpose="Salud técnica del flujo de entrega" freq="Lead Time / Change Failure" />
              </tbody>
            </table>
          </div>
        )}

        {activeSection === 'kpis' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {generatedKpis.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {generatedKpis.map((kpi, idx) => (
                  <div key={idx} className="bg-white p-7 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-indigo-200 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <BarChart3 size={60} />
                    </div>
                    <div className="flex justify-between items-start mb-6">
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-3 py-1 rounded-full uppercase font-bold tracking-tighter">{kpi.category}</span>
                    </div>
                    <h4 className="text-xl font-bold text-slate-900 mb-2">{kpi.name}</h4>
                    <p className="text-xs text-slate-400 font-medium mb-6">{kpi.formula}</p>
                    
                    <div className="space-y-4">
                      <div className="bg-indigo-50/50 p-4 rounded-2xl">
                        <p className="text-[10px] text-indigo-400 uppercase font-bold tracking-wider mb-1">Target Sugerido</p>
                        <p className="text-lg font-extrabold text-indigo-700">{kpi.target}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-2 flex items-center gap-1">
                          <Zap size={10} /> Acción Táctica
                        </p>
                        <p className="text-sm text-slate-600 leading-relaxed italic">{kpi.action}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BarChart3 className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Sin Datos Generados</h3>
                <p className="text-slate-400 max-w-sm mx-auto">Describe el contexto de tu producto en el panel de la izquierda para generar KPIs inteligentes.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

// --- Sub-components ---

const NavItem = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-3.5 px-5 py-4 rounded-2xl text-sm font-semibold transition-all duration-200 ${
      active 
      ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' 
      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
    }`}
  >
    <span className={active ? 'text-indigo-400' : 'text-slate-300'}>{icon}</span>
    {label}
  </button>
);

const TimelineItem = ({ phase, tasks, status, color }: { phase: string, tasks: string[], status: string, color: string }) => {
  const colorMap: any = {
    indigo: 'bg-indigo-600 border-indigo-100 text-indigo-700 bg-indigo-50',
    blue: 'bg-blue-600 border-blue-100 text-blue-700 bg-blue-50',
    emerald: 'bg-emerald-600 border-emerald-100 text-emerald-700 bg-emerald-50',
    amber: 'bg-amber-600 border-amber-100 text-amber-700 bg-amber-50',
  };

  return (
    <div className="flex gap-8 group">
      <div className="flex flex-col items-center">
        <div className={`w-6 h-6 rounded-full ${colorMap[color].split(' ')[0]} border-4 border-white shadow-sm z-10 transition-transform group-hover:scale-125`} />
      </div>
      <div className="pb-4 flex-1">
        <div className="flex items-center gap-4 mb-4">
          <h4 className="font-extrabold text-2xl text-slate-900">{phase}</h4>
          <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter ${colorMap[color].split(' ').slice(1).join(' ')}`}>
            {status}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {tasks.map((t, i) => (
            <div key={i} className="flex items-center gap-3 bg-white border border-slate-100 p-4 rounded-2xl shadow-sm text-sm font-medium text-slate-700 hover:border-slate-300 transition-colors">
              <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
              {t}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const TableRow = ({ item, purpose, freq }: { item: string, purpose: string, freq: string }) => (
  <tr className="hover:bg-slate-50/50 transition-colors">
    <td className="px-8 py-6">
      <div className="flex flex-col">
        <span className="font-bold text-slate-900">{item}</span>
      </div>
    </td>
    <td className="px-8 py-6 text-slate-600 max-w-xs">{purpose}</td>
    <td className="px-8 py-6">
      <span className="text-xs font-bold bg-slate-100 px-3 py-1.5 rounded-lg text-slate-500 uppercase tracking-tighter">{freq}</span>
    </td>
  </tr>
);

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<App />);