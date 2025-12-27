import React from 'react';
import {
  Thermometer,
  Activity,
  Server,
  AlertTriangle,
  Search,
  Bell,
  Settings,
  ChevronDown,
  LayoutGrid,
  Database,
  Users,
  Clock,
  Download
} from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

// --- Mock Data ---
const performanceData = Array.from({ length: 24 }, (_, i) => ({
  time: `${i}:00`,
  temp: 22 + Math.random() * 5,
  humidity: 40 + Math.random() * 10,
  cpu: 10 + Math.random() * 30
}));

const anomalyData = Array.from({ length: 20 }, (_, i) => ({
  time: i,
  value: Math.sin(i / 2) * 10 + 20 + (i === 15 ? 15 : 0), // Spike at 15
  lower: 10,
  upper: 30
}));

interface DashboardProps {
  view?: 'overview' | 'ml' | 'alerts';
}

const MockDashboard: React.FC<DashboardProps> = ({ view = 'overview' }) => {
  return (
    <div className="flex h-full w-full bg-slate-50 text-slate-900 font-sans text-xs overflow-hidden rounded-xl border border-slate-200 shadow-xl">
      {/* Sidebar */}
      <div className="w-16 bg-slate-900 flex flex-col items-center py-4 gap-6 shrink-0 z-10">
        <div className="w-8 h-8 bg-emerald-500 rounded flex items-center justify-center font-bold text-white">G</div>
        <div className="flex flex-col gap-4 w-full px-2">
           <div className={`p-2 rounded-lg cursor-pointer transition-colors ${view === 'overview' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400 hover:text-white'}`}>
             <LayoutGrid size={20} />
           </div>
           <div className={`p-2 rounded-lg cursor-pointer transition-colors ${view === 'alerts' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400 hover:text-white'}`}>
             <AlertTriangle size={20} />
           </div>
           <div className={`p-2 rounded-lg cursor-pointer transition-colors ${view === 'ml' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400 hover:text-white'}`}>
             <Activity size={20} />
           </div>
           <div className="p-2 text-slate-400 hover:text-white cursor-pointer"><Server size={20} /></div>
           <div className="p-2 text-slate-400 hover:text-white cursor-pointer"><Database size={20} /></div>
           <div className="p-2 text-slate-400 hover:text-white cursor-pointer"><Users size={20} /></div>
        </div>
        <div className="mt-auto p-2 text-slate-400 hover:text-white cursor-pointer"><Settings size={20} /></div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">

        {/* Top Header */}
        <div className="h-12 border-b border-slate-200 flex items-center justify-between px-4 bg-white">
           <div className="flex items-center gap-4">
              <span className="font-semibold text-slate-700 text-sm">
                {view === 'overview' && 'Infrastructure / Overview'}
                {view === 'ml' && 'Intelligence / Anomaly Detection'}
                {view === 'alerts' && 'Events / Active Alerts'}
              </span>
              <div className="h-4 w-px bg-slate-200"></div>
              <div className="flex items-center gap-2 text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-200">
                 <Clock size={12} />
                 <span>Last 24 Hours</span>
                 <ChevronDown size={12} />
              </div>
           </div>
           <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full w-48 border border-transparent focus-within:border-emerald-500 focus-within:bg-white transition-all">
                 <Search size={14} className="text-slate-400" />
                 <span className="text-slate-400">Search...</span>
              </div>
              <div className="relative">
                 <Bell size={18} className="text-slate-600" />
                 <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></div>
              </div>
              <div className="w-6 h-6 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-700 flex items-center justify-center font-bold">JD</div>
           </div>
        </div>

        {/* Dashboard Content */}
        <div className="flex-1 p-4 overflow-hidden bg-slate-50/50">

           {/* VIEW: OVERVIEW */}
           {view === 'overview' && (
             <div className="grid grid-cols-4 grid-rows-3 gap-4 h-full">
                {/* Stats Row */}
                <div className="col-span-1 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                   <div className="flex justify-between items-start mb-2">
                      <span className="text-slate-500 font-medium">Avg Temp</span>
                      <Thermometer size={16} className="text-emerald-500" />
                   </div>
                   <div className="text-2xl font-bold text-slate-900">24.2°C</div>
                   <div className="text-xs text-emerald-600 mt-1 flex items-center gap-1">↑ 1.2% vs last hour</div>
                </div>
                <div className="col-span-1 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                   <div className="flex justify-between items-start mb-2">
                      <span className="text-slate-500 font-medium">Humidity</span>
                      <Activity size={16} className="text-blue-500" />
                   </div>
                   <div className="text-2xl font-bold text-slate-900">42%</div>
                   <div className="text-xs text-slate-400 mt-1">Stable</div>
                </div>
                <div className="col-span-1 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                   <div className="flex justify-between items-start mb-2">
                      <span className="text-slate-500 font-medium">Active Sensors</span>
                      <Server size={16} className="text-purple-500" />
                   </div>
                   <div className="text-2xl font-bold text-slate-900">142</div>
                   <div className="text-xs text-emerald-600 mt-1">All Systems Operational</div>
                </div>
                <div className="col-span-1 bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center">
                   <div className="text-slate-500 mb-1">System Status</div>
                   <div className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full font-bold border border-emerald-200">
                      HEALTHY
                   </div>
                </div>

                {/* Main Chart */}
                <div className="col-span-3 row-span-2 bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col">
                   <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-slate-700">Temperature & Humidity Trends</h3>
                      <button className="text-slate-400 hover:text-slate-600"><Download size={14}/></button>
                   </div>
                   <div className="flex-1 w-full min-h-0">
                      <ResponsiveContainer width="100%" height="100%">
                         <AreaChart data={performanceData}>
                            <defs>
                               <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                               </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="time" tick={{fontSize: 10, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                            <YAxis tick={{fontSize: 10, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                            <Area type="monotone" dataKey="temp" stroke="#10b981" strokeWidth={2} fill="url(#colorTemp)" />
                            <Area type="monotone" dataKey="humidity" stroke="#3b82f6" strokeWidth={2} fill="transparent" strokeDasharray="3 3" />
                         </AreaChart>
                      </ResponsiveContainer>
                   </div>
                </div>

                {/* Log Stream */}
                <div className="col-span-1 row-span-2 bg-slate-900 p-4 rounded-lg border border-slate-800 shadow-sm flex flex-col font-mono text-[10px] text-slate-400">
                   <div className="text-slate-200 font-bold mb-3 border-b border-slate-700 pb-2">Event Log</div>
                   <div className="space-y-2 overflow-y-auto">
                      <div className="flex gap-2"><span className="text-emerald-500">10:42:01</span> <span>Sensor_01 connected</span></div>
                      <div className="flex gap-2"><span className="text-emerald-500">10:42:05</span> <span>Data packet received (2kb)</span></div>
                      <div className="flex gap-2"><span className="text-blue-500">10:42:12</span> <span>Syncing with master...</span></div>
                      <div className="flex gap-2"><span className="text-emerald-500">10:42:15</span> <span>Sync complete</span></div>
                      <div className="flex gap-2"><span className="text-amber-500">10:43:00</span> <span>Minor latency detected</span></div>
                      <div className="flex gap-2"><span className="text-emerald-500">10:43:05</span> <span>Latency resolved</span></div>
                   </div>
                </div>
             </div>
           )}

           {/* VIEW: ML */}
           {view === 'ml' && (
              <div className="grid grid-cols-3 gap-4 h-full">
                 <div className="col-span-2 bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col">
                    <div className="mb-4">
                       <h3 className="font-bold text-slate-800">Anomaly Detection Model</h3>
                       <p className="text-slate-500">Isolation Forest (v2.1) • Confidence Score: 98.5%</p>
                    </div>
                    <div className="flex-1">
                       <ResponsiveContainer width="100%" height="100%">
                         <LineChart data={anomalyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="time" hide />
                            <YAxis domain={[0, 40]} hide />
                            <Tooltip
                               contentStyle={{backgroundColor: '#1e293b', border: 'none', borderRadius: '4px', color: 'white'}}
                               itemStyle={{color: '#cbd5e1'}}
                            />
                            <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} dot={{r: 3, fill: '#6366f1'}} />
                            <Line type="monotone" dataKey="upper" stroke="#ef4444" strokeDasharray="3 3" strokeWidth={1} dot={false} />
                            <Line type="monotone" dataKey="lower" stroke="#ef4444" strokeDasharray="3 3" strokeWidth={1} dot={false} />
                         </LineChart>
                       </ResponsiveContainer>
                    </div>
                 </div>
                 <div className="col-span-1 space-y-4">
                    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                       <h4 className="font-bold text-slate-700 mb-3">Model Features</h4>
                       <div className="space-y-2">
                          {['Temperature Delta', 'Humidity Rolling Avg', 'Time of Day', 'Sensor Variance'].map(f => (
                             <div key={f} className="flex justify-between items-center text-xs">
                                <span className="text-slate-600">{f}</span>
                                <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                   <div className="bg-indigo-500 h-full" style={{width: `${Math.random() * 100}%`}}></div>
                                </div>
                             </div>
                          ))}
                       </div>
                    </div>
                    <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 flex items-center gap-3">
                       <Activity className="text-indigo-600" size={24} />
                       <div>
                          <div className="font-bold text-indigo-900">Next Retraining</div>
                          <div className="text-indigo-700">Scheduled: 02:00 UTC</div>
                       </div>
                    </div>
                 </div>
              </div>
           )}

           {/* VIEW: ALERTS */}
           {view === 'alerts' && (
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm h-full flex flex-col">
                 <div className="p-3 border-b border-slate-100 flex gap-4 font-medium text-slate-600">
                    <span className="text-slate-900 border-b-2 border-emerald-500 pb-2.5 -mb-3.5">All Alerts</span>
                    <span className="hover:text-slate-900 cursor-pointer">Unacknowledged</span>
                    <span className="hover:text-slate-900 cursor-pointer">Resolved</span>
                 </div>
                 <div className="flex-1 overflow-y-auto">
                    {[
                       { severity: 'critical', msg: 'Thermal Runaway detected in Rack B4', time: '2m ago', id: '#ALT-1023' },
                       { severity: 'warning', msg: 'Humidity above threshold (45%) in Server Room A', time: '15m ago', id: '#ALT-1022' },
                       { severity: 'info', msg: 'Gateway firmware update available', time: '1h ago', id: '#SYS-004' },
                       { severity: 'info', msg: 'Weekly report generated', time: '3h ago', id: '#RPT-881' },
                       { severity: 'warning', msg: 'Connection lost: Node-04', time: '5h ago', id: '#NET-201' },
                    ].map((alert, i) => (
                       <div key={i} className="flex items-center gap-4 p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer">
                          <div className={`w-2 h-2 rounded-full shrink-0 ${
                             alert.severity === 'critical' ? 'bg-red-500' :
                             alert.severity === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                          }`}></div>
                          <div className="flex-1">
                             <div className="font-medium text-slate-800">{alert.msg}</div>
                             <div className="text-slate-400 text-[10px] mt-0.5">{alert.id} • {alert.time}</div>
                          </div>
                          <button className="px-3 py-1 border border-slate-200 rounded text-slate-600 hover:bg-white hover:border-slate-300">View</button>
                       </div>
                    ))}
                 </div>
              </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default MockDashboard;
