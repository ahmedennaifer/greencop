import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Menu,
  X,
  ArrowRight,
  CheckCircle2,
  Check,
  Zap,
  Shield,
  BarChart3,
  Database,
  Activity,
  AlertTriangle,
  Server,
  Lock,
  Clock,
  Bot,
  HardDrive,
  BrainCircuit,
  Sparkles,
  MessageSquare,
  FlaskConical,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import Button from '../components/ui/Button';

// Import screenshots
import mainPageImg from '../assets/mainPage.png';
import predictionsImg from '../assets/predictions.png';
import anomaliesImg from '../assets/anomalies.png';
import alertsImg from '../assets/alerts.png';
import aiAssistantImg from '../assets/AiAssistant.png';

// ----------------------------------------------------------------------
// --- LANDING PAGE COMPONENT ---
// ----------------------------------------------------------------------

const LandingPage: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  // Image references
  const screenshots = {
    dashboard: mainPageImg,
    predictions: predictionsImg,
    anomalies: anomaliesImg,
    alerts: alertsImg,
    assistant: aiAssistantImg,
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      
      {/* --- Navigation --- */}
      <nav className="fixed w-full z-50 bg-white/90 backdrop-blur border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="bg-emerald-600 p-1.5 rounded text-white">
                <Shield size={20} fill="currentColor" />
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-900">GreenCop</span>
            </div>
            
            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
              <a href="#product" className="hover:text-emerald-600 transition-colors">Product</a>
              <a href="#features" className="hover:text-emerald-600 transition-colors">Features</a>
              <a href="#solutions" className="hover:text-emerald-600 transition-colors">Solutions</a>
              <a href="#pricing" className="hover:text-emerald-600 transition-colors">Pricing</a>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-emerald-600">Log in</Link>
              <Link to="/register">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-md px-4 py-2 text-sm shadow-sm">
                  Start Free Trial
                </Button>
              </Link>
            </div>

            <button className="md:hidden p-2 text-slate-500" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
               {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </nav>

      {/* --- Hero Section (Dashboard) --- */}
      <section id="product" className="pt-32 pb-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium mb-6 border border-emerald-100">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              v2.4 Release: AI Fleet Assistant is now live
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-slate-900 tracking-tight mb-6 leading-[1.1]">
              Full-stack observability for <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">physical infrastructure.</span>
            </h1>
            <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Monitor server rooms, data centers, and critical hardware with intelligent telemetry. 
              Prevent thermal runaway with predictive AI alerts and an intelligent fleet assistant.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/register">
                <Button className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3.5 text-base rounded-md w-full sm:w-auto">
                  Create Free Account
                </Button>
              </Link>
              <Button variant="outline" className="px-8 py-3.5 text-base w-full sm:w-auto">
                Schedule Demo
              </Button>
            </div>
            <div className="mt-8 flex items-center justify-center gap-6 text-sm text-slate-500">
               <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> No credit card required</span>
               <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> 14-day free trial</span>
            </div>
          </div>

          {/* Hero Image - Massive Dashboard */}
          <div className="relative rounded-xl bg-slate-100 p-2 shadow-2xl border border-slate-200">
             <div className="w-full bg-slate-50 rounded-lg overflow-hidden shadow-inner">
                <img
                  src={screenshots.dashboard}
                  alt="GreenCop Live Sensor Monitoring Dashboard"
                  className="w-full h-auto"
                />
             </div>
             {/* Decorative Elements */}
             <div className="absolute -z-10 -bottom-10 -right-10 w-64 h-64 bg-emerald-500/20 blur-[100px] rounded-full"></div>
             <div className="absolute -z-10 -top-10 -left-10 w-64 h-64 bg-blue-500/20 blur-[100px] rounded-full"></div>
          </div>
        </div>
      </section>

      {/* --- Trusted By Strip --- */}
      <section className="py-10 border-y border-slate-100 bg-slate-50/50">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-xs font-semibold text-slate-500 uppercase tracking-widest mb-6">Trusted by engineering teams at</p>
            <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-60 grayscale">
               {['Acme Corp', 'GlobalTech', 'Nebula', 'Vertex', 'Quantico'].map(logo => (
                  <div key={logo} className="text-lg font-bold text-slate-800 flex items-center gap-2">
                     <div className="w-6 h-6 bg-slate-800 rounded-sm"></div> {logo}
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* --- Feature 1: Predictive Forecasting --- */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
           <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
              <div className="w-full lg:w-5/12">
                 <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold mb-4">
                    <Activity size={14} /> PREDICTIVE INTELLIGENCE
                 </div>
                 <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4 leading-tight">
                    Latest Predictions, <br/> Updating Live.
                 </h2>
                 <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                    Visualize the immediate future. Our system compares "Actual" vs "Predicted" values for both Temperature and Humidity in real-time. See the divergence instantly and intercept thermal runaway before it triggers an alert.
                 </p>
                 <ul className="space-y-4">
                    {[
                       'Real-time forecasting visualization',
                       'Compare "Actual" vs "Predicted" metrics',
                       'Drift detection and variance analysis',
                    ].map(item => (
                       <li key={item} className="flex items-center gap-3 text-slate-700">
                          <CheckCircle2 size={20} className="text-emerald-500" />
                          {item}
                       </li>
                    ))}
                 </ul>
              </div>
              <div className="w-full lg:w-3/5">
                 <div className="rounded-xl shadow-2xl border border-slate-200 overflow-hidden bg-slate-50 transform hover:scale-[1.02] transition-transform duration-500">
                    <img
                      src={screenshots.predictions}
                      alt="Latest Predictions Graph showing Actual vs Predicted values"
                      className="w-full h-auto"
                    />
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* --- Feature 2: Anomaly Detection --- */}
      <section className="py-24 bg-slate-50 border-y border-slate-200">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
           <div className="flex flex-col lg:flex-row-reverse items-center gap-16 lg:gap-24">
              <div className="w-full lg:w-5/12">
                 <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold mb-4">
                    <Zap size={14} /> ANOMALY AI
                 </div>
                 <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4 leading-tight">
                    ML-Detected Anomalies.
                 </h2>
                 <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                    Filter and analyze confirmed anomalous behavior. Our ML engine flags specific incidents—like "humidity=38.29% (ML prediction)"—allowing you to audit exactly when and why the system flagged a deviation.
                 </p>
                 <div className="grid grid-cols-2 gap-6">
                    <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
                       <div className="text-3xl font-bold text-slate-900 mb-1">57</div>
                       <div className="text-sm text-slate-500">Recent Anomalies</div>
                    </div>
                    <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
                       <div className="text-3xl font-bold text-slate-900 mb-1">98%</div>
                       <div className="text-sm text-slate-500">Confidence Score</div>
                    </div>
                 </div>
              </div>
              <div className="w-full lg:w-3/5">
                 <div className="rounded-xl shadow-2xl border border-slate-200 overflow-hidden bg-white transform hover:scale-[1.02] transition-transform duration-500">
                    <img
                      src={screenshots.anomalies}
                      alt="Recent Anomalies List with Filters"
                      className="w-full h-auto"
                    />
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* --- Feature 3: Alerts --- */}
      <section className="py-24 bg-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
           <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
              <div className="w-full lg:w-5/12">
                 <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-bold mb-4">
                    <AlertTriangle size={14} /> ALERT MANAGEMENT
                 </div>
                 <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4 leading-tight">
                    Active Alerts & History.
                 </h2>
                 <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                    A centralized view for immediate attention. See your "Active Alerts" count instantly (target: 0), or review the "Recent Alert History" to audit acknowledged incidents and ensure full resolution.
                 </p>
                 <Button variant="outline" className="gap-2">
                    View Alert Documentation <ArrowRight size={16} />
                 </Button>
              </div>
              <div className="w-full lg:w-3/5">
                 <div className="rounded-xl shadow-2xl border border-slate-200 overflow-hidden bg-white transform hover:scale-[1.02] transition-transform duration-500">
                    <img
                      src={screenshots.alerts}
                      alt="Active Alerts and Alert History View"
                      className="w-full h-auto"
                    />
                 </div>
              </div>
           </div>
        </div>
      </section>

       {/* --- Feature 4: AI Assistant (Separate Section) --- */}
       <section className="py-24 bg-slate-900 text-white border-y border-slate-800">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
           <div className="flex flex-col lg:flex-row-reverse items-center gap-16 lg:gap-24">
              <div className="w-full lg:w-5/12">
                 <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-bold mb-4 border border-emerald-500/30">
                    <Sparkles size={14} /> GENERATIVE AI ASSISTANT
                 </div>
                 <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4 leading-tight">
                    "Hello! I'm your GreenCop Assistant."
                 </h2>
                 <p className="text-lg text-slate-400 mb-8 leading-relaxed">
                    An AI-powered interface for managing your IoT monitoring system. Use natural language to perform data queries, manage system configurations, or ask for "Smart Insights" about your infrastructure.
                 </p>
                 <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                       <MessageSquare size={20} className="text-emerald-500 mt-1" />
                       <div>
                          <strong className="block text-white">Data Queries</strong>
                          <span className="text-slate-400 text-sm">"Analyze temperature patterns for Sensor X."</span>
                       </div>
                    </li>
                    <li className="flex items-start gap-3">
                       <BrainCircuit size={20} className="text-emerald-500 mt-1" />
                       <div>
                          <strong className="block text-white">System Management</strong>
                          <span className="text-slate-400 text-sm">Create rooms, register sensors, or configure thresholds via chat.</span>
                       </div>
                    </li>
                 </ul>
              </div>
              <div className="w-full lg:w-3/5">
                 <div className="rounded-xl shadow-2xl border border-slate-700 overflow-hidden bg-slate-800 transform hover:scale-[1.02] transition-transform duration-500">
                    <img
                      src={screenshots.assistant}
                      alt="GreenCop Assistant AI Chat Interface"
                      className="w-full h-auto"
                    />
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* --- Feature 5: Automatic Model Retraining --- */}
      <section className="py-24 bg-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
           <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
              <div className="w-full lg:w-5/12">
                 <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-bold mb-4">
                    <FlaskConical size={14} /> SELF-IMPROVING AI
                 </div>
                 <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4 leading-tight">
                    Models That Learn<br />From Your Feedback.
                 </h2>
                 <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                    Every time you validate a prediction, you're training the AI. After 100 validated predictions, the system automatically retrains both anomaly detection and forecasting models with zero downtime.
                 </p>
                 <ul className="space-y-4 mb-8">
                    {[
                       { icon: RefreshCw, title: 'Automatic Triggers', desc: 'Retrains every 100 validated predictions' },
                       { icon: TrendingUp, title: 'Performance Tracking', desc: 'F1 Score, Accuracy, RMSE metrics for every run' },
                       { icon: Zap, title: 'Zero Downtime', desc: 'New models deploy instantly without service interruption' },
                    ].map(item => (
                       <li key={item.title} className="flex items-start gap-3">
                          <div className="mt-1">
                             <item.icon size={20} className="text-emerald-500" />
                          </div>
                          <div>
                             <strong className="block text-slate-900">{item.title}</strong>
                             <span className="text-slate-600 text-sm">{item.desc}</span>
                          </div>
                       </li>
                    ))}
                 </ul>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                       <div className="text-2xl font-bold text-purple-900 mb-1">95%+</div>
                       <div className="text-xs text-purple-600">Accuracy After 500 Validations</div>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                       <div className="text-2xl font-bold text-blue-900 mb-1">0s</div>
                       <div className="text-xs text-blue-600">Deployment Downtime</div>
                    </div>
                 </div>
              </div>
              <div className="w-full lg:w-3/5">
                 <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-8 border border-slate-200 shadow-xl">
                    <div className="space-y-4">
                       <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
                          <div className="flex items-center justify-between mb-4">
                             <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                                   <FlaskConical className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                   <div className="font-bold text-slate-900">Run #428</div>
                                   <div className="text-xs text-slate-500">Completed in 3s</div>
                                </div>
                             </div>
                             <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">Completed</span>
                          </div>
                          <div className="grid grid-cols-3 gap-4 mb-4">
                             <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <div className="text-lg font-bold text-blue-900">6,560</div>
                                <div className="text-xs text-blue-600">Training Rows</div>
                             </div>
                             <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                                <div className="text-lg font-bold text-green-900">120</div>
                                <div className="text-xs text-green-600">Validated</div>
                             </div>
                             <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
                                <div className="text-lg font-bold text-purple-900">Both</div>
                                <div className="text-xs text-purple-600">Model Type</div>
                             </div>
                          </div>
                          <div className="space-y-2 text-sm">
                             <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                                <span className="text-blue-700 font-medium">Anomaly F1</span>
                                <span className="font-bold text-blue-900">0.865</span>
                             </div>
                             <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                                <span className="text-green-700 font-medium">Forecast RMSE</span>
                                <span className="font-bold text-green-900">5.20°C</span>
                             </div>
                          </div>
                       </div>
                       <div className="flex items-center justify-center gap-2 text-slate-500 text-sm">
                          <RefreshCw size={16} className="animate-spin" />
                          <span>Continuous learning in progress...</span>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* --- Feature Grid (Solutions) --- */}
      <section id="solutions" className="py-24 bg-slate-50 text-slate-900 border-y border-slate-200">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
               <h2 className="text-3xl font-bold mb-4">Solutions for every scale.</h2>
               <p className="text-slate-500 max-w-2xl mx-auto">
                  Built for enterprise reliability. Deploy one sensor or ten thousand.
               </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
               {[
                  { icon: Database, title: "Historical Archives", desc: "Access up to 2 years of granular sensor data without sampling." },
                  { icon: Shield, title: "Role-Based Access", desc: "Granular permissions for admins, viewers, and maintenance staff." },
                  { icon: Bot, title: "AI Fleet Manager", desc: "Use natural language to query fleet status and automate routine maintenance." },
                  { icon: BarChart3, title: "Custom Reports", desc: "Automated PDF/CSV reports sent to management weekly." },
                  { icon: Zap, title: "API First", desc: "Full REST API access to all your data for custom integrations." },
                  { icon: CheckCircle2, title: "99.99% Uptime", desc: "Redundant infrastructure ensures we never lose a data packet." }
               ].map((feat, i) => (
                  <div key={i} className="bg-slate-50 p-8 rounded-xl border border-slate-200 hover:border-emerald-500/50 hover:shadow-lg transition-all">
                     <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-emerald-600 mb-6">
                        <feat.icon size={24} />
                     </div>
                     <h3 className="text-xl font-bold mb-3">{feat.title}</h3>
                     <p className="text-slate-600 leading-relaxed text-sm">{feat.desc}</p>
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* --- Pricing Section --- */}
      <section id="pricing" className="py-24 bg-slate-50 border-t border-slate-200">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Infrastructure-Grade Pricing</h2>
            <p className="text-slate-500 text-lg mb-8">
              Predictable billing for high-volume telemetry. <br/>
              Built for teams who cannot afford downtime.
            </p>
            
            <div className="inline-flex p-1 bg-white rounded-lg border border-slate-200 shadow-sm mb-4">
              <button 
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${billingCycle === 'monthly' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
              >
                Monthly billing
              </button>
              <button 
                onClick={() => setBillingCycle('yearly')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${billingCycle === 'yearly' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
              >
                Yearly billing <span className="ml-1 text-[10px] text-emerald-500 font-bold uppercase">Save 15%</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
            
            {/* 1. Developer Tier */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
               <div className="mb-4">
                 <div className="text-emerald-600 font-bold text-xs uppercase tracking-wider mb-1">Starter</div>
                 <h3 className="text-xl font-bold text-slate-900">Developer</h3>
                 <p className="text-slate-500 text-sm mt-1">Proof of concept & testing.</p>
               </div>
               <div className="mb-6 pb-6 border-b border-slate-100">
                 <span className="text-4xl font-bold text-slate-900">$0</span>
                 <span className="text-slate-500">/mo</span>
               </div>
               <div className="flex-1 space-y-4 mb-8">
                  <div className="flex gap-3 text-sm text-slate-700">
                    <Server size={18} className="text-slate-400 shrink-0" /> 
                    <span>Up to <strong>5 Sensors</strong></span>
                  </div>
                  <div className="flex gap-3 text-sm text-slate-700">
                    <HardDrive size={18} className="text-slate-400 shrink-0" /> 
                    <span><strong>100MB</strong> Data Retention</span>
                  </div>
                  <div className="flex gap-3 text-sm text-slate-700">
                    <Clock size={18} className="text-slate-400 shrink-0" /> 
                    <span>5-min polling interval</span>
                  </div>
                  <div className="flex gap-3 text-sm text-slate-700">
                    <Check size={18} className="text-slate-400 shrink-0" /> 
                    <span>Email Alerts</span>
                  </div>
               </div>
               <Button variant="outline" className="w-full">Create Free Account</Button>
            </div>

            {/* 2. Professional Tier (ML & AI Starts Here) */}
            <div className="bg-white rounded-2xl p-6 border-2 border-emerald-500 shadow-xl relative flex flex-col h-full z-10">
               <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm uppercase tracking-wide">
                 Most Popular
               </div>
               <div className="mb-4 mt-2">
                 <div className="text-emerald-600 font-bold text-xs uppercase tracking-wider mb-1">Professional</div>
                 <h3 className="text-xl font-bold text-slate-900">Small Team</h3>
                 <p className="text-slate-500 text-sm mt-1">Production environments.</p>
               </div>
               <div className="mb-6 pb-6 border-b border-slate-100">
                 <span className="text-4xl font-bold text-slate-900">${billingCycle === 'monthly' ? '599' : '549'}</span>
                 <span className="text-slate-500">/mo</span>
               </div>
               <div className="flex-1 space-y-4 mb-8">
                  <div className="flex gap-3 text-sm text-slate-700 font-medium">
                    <Server size={18} className="text-emerald-500 shrink-0" /> 
                    <span>Up to <strong>50 Sensors</strong></span>
                  </div>
                  <div className="flex gap-3 text-sm text-slate-700">
                     <HardDrive size={18} className="text-emerald-500 shrink-0" /> 
                     <span><strong>50GB</strong> Data Retention</span>
                  </div>
                  <div className="flex gap-3 text-sm text-slate-700">
                    <Zap size={18} className="text-emerald-500 shrink-0" /> 
                    <span><strong>ML Anomaly Detection</strong></span>
                  </div>
                  <div className="flex gap-3 text-sm text-slate-700">
                    <Bot size={18} className="text-emerald-500 shrink-0" /> 
                    <span><strong>GreenCop AI Assistant</strong></span>
                  </div>
                  <div className="flex gap-3 text-sm text-slate-700">
                    <Activity size={18} className="text-emerald-500 shrink-0" /> 
                    <span>1s Polling Rate</span>
                  </div>
               </div>
               <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200">Start 14-Day Trial</Button>
            </div>

             {/* 3. Business Tier (New Category) */}
             <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
               <div className="mb-4">
                 <div className="text-emerald-600 font-bold text-xs uppercase tracking-wider mb-1">Business</div>
                 <h3 className="text-xl font-bold text-slate-900">Scale</h3>
                 <p className="text-slate-500 text-sm mt-1">Data-intensive operations.</p>
               </div>
               <div className="mb-6 pb-6 border-b border-slate-100">
                 <span className="text-4xl font-bold text-slate-900">${billingCycle === 'monthly' ? '999' : '899'}</span>
                 <span className="text-slate-500">/mo</span>
               </div>
               <div className="flex-1 space-y-4 mb-8">
                  <div className="flex gap-3 text-sm text-slate-700">
                    <Server size={18} className="text-purple-500 shrink-0" /> 
                    <span>Up to <strong>150 Sensors</strong></span>
                  </div>
                  <div className="flex gap-3 text-sm text-slate-700">
                     <HardDrive size={18} className="text-purple-500 shrink-0" /> 
                     <span><strong>1TB</strong> Data Storage</span>
                  </div>
                  <div className="flex gap-3 text-sm text-slate-700">
                    <BrainCircuit size={18} className="text-purple-500 shrink-0" /> 
                    <span><strong>Predictive Forecasting</strong></span>
                  </div>
                  <div className="flex gap-3 text-sm text-slate-700">
                    <Bot size={18} className="text-purple-500 shrink-0" /> 
                    <span>AI Fleet Manager (Adv.)</span>
                  </div>
                  <div className="flex gap-3 text-sm text-slate-700">
                    <Check size={18} className="text-purple-500 shrink-0" /> 
                    <span>Priority Support</span>
                  </div>
               </div>
               <Button variant="outline" className="w-full">Contact Sales</Button>
            </div>

            {/* 4. Mission Critical Tier */}
            <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl flex flex-col text-white h-full">
               <div className="mb-4">
                 <div className="text-emerald-400 font-bold text-xs uppercase tracking-wider mb-1">Enterprise</div>
                 <h3 className="text-xl font-bold text-white">Mission Critical</h3>
                 <p className="text-slate-400 text-sm mt-1">Regulatory compliance.</p>
               </div>
               <div className="mb-6 pb-6 border-b border-slate-800">
                 <span className="text-3xl font-bold text-white">Custom</span>
               </div>
               <div className="flex-1 space-y-4 mb-8">
                  <div className="flex gap-3 text-sm text-slate-300">
                    <Server size={18} className="text-emerald-400 shrink-0" /> 
                    <span><strong>Unlimited Sensors</strong></span>
                  </div>
                  <div className="flex gap-3 text-sm text-slate-300">
                    <Database size={18} className="text-emerald-400 shrink-0" /> 
                    <span>Unlimited Cold Storage</span>
                  </div>
                  <div className="flex gap-3 text-sm text-slate-300">
                    <Lock size={18} className="text-emerald-400 shrink-0" /> 
                    <span>SOC2 Compliance Logs</span>
                  </div>
                  <div className="flex gap-3 text-sm text-slate-300">
                    <Check size={18} className="text-emerald-400 shrink-0" /> 
                    <span>99.99% Uptime SLA</span>
                  </div>
                  <div className="flex gap-3 text-sm text-slate-300">
                    <Check size={18} className="text-emerald-400 shrink-0" /> 
                    <span>Dedicated Solution Engineer</span>
                  </div>
               </div>
               <Button variant="outline" className="w-full border-slate-700 text-white hover:bg-slate-800 hover:text-white hover:border-slate-600">Contact Sales</Button>
            </div>
          </div>

          <div className="mt-16 text-center border-t border-slate-200 pt-10">
             <h4 className="text-lg font-bold text-slate-900 mb-2">Need a custom deployment?</h4>
             <p className="text-slate-500 mb-6">
               We support massive on-premise deployments for data centers and industrial campuses. 
             </p>
             <a href="#" className="text-emerald-600 font-bold hover:underline inline-flex items-center gap-1">
               Contact Enterprise Sales <ArrowRight size={16} />
             </a>
          </div>
        </div>
      </section>

      {/* --- CTA --- */}
      <section className="py-24 bg-emerald-600 relative overflow-hidden">
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
         <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
            <h2 className="text-4xl font-bold text-white mb-6">Ready to upgrade your monitoring?</h2>
            <p className="text-emerald-100 text-lg mb-10 max-w-2xl mx-auto">
               Join 5,000+ infrastructure teams who trust GreenCop for their critical environments.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
               <Link to="/register">
                  <button className="inline-flex items-center justify-center bg-white text-emerald-800 hover:bg-emerald-50 w-full sm:w-auto px-10 py-4 text-lg font-bold shadow-xl rounded-lg transition-all duration-200">
                     Start Free Trial
                  </button>
               </Link>
               <Link to="/contact">
                  <button className="inline-flex items-center justify-center bg-transparent border-2 border-emerald-400 text-white hover:bg-emerald-700 hover:border-emerald-700 w-full sm:w-auto px-10 py-4 text-lg rounded-lg transition-all duration-200">
                     Contact Sales
                  </button>
               </Link>
            </div>
         </div>
      </section>

      {/* --- Footer --- */}
      <footer className="bg-white border-t border-slate-200 py-12">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-4 gap-8">
            <div className="col-span-1">
               <div className="flex items-center gap-2 mb-4">
                  <div className="bg-slate-900 p-1 rounded text-white"><Shield size={16} fill="currentColor"/></div>
                  <span className="font-bold text-slate-900">GreenCop</span>
               </div>
               <p className="text-slate-500 text-sm">
                  Enterprise IoT monitoring. <br/> San Francisco, CA.
               </p>
            </div>
            <div>
               <h4 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wide">Product</h4>
               <ul className="space-y-2 text-sm text-slate-500">
                  <li><a href="#" className="hover:text-emerald-600">Features</a></li>
                  <li><a href="#" className="hover:text-emerald-600">Integrations</a></li>
                  <li><a href="#" className="hover:text-emerald-600">Pricing</a></li>
               </ul>
            </div>
            <div>
               <h4 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wide">Resources</h4>
               <ul className="space-y-2 text-sm text-slate-500">
                  <li><a href="#" className="hover:text-emerald-600">Documentation</a></li>
                  <li><a href="#" className="hover:text-emerald-600">API Reference</a></li>
                  <li><a href="#" className="hover:text-emerald-600">Status</a></li>
               </ul>
            </div>
            <div>
               <h4 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wide">Legal</h4>
               <ul className="space-y-2 text-sm text-slate-500">
                  <li><a href="#" className="hover:text-emerald-600">Privacy</a></li>
                  <li><a href="#" className="hover:text-emerald-600">Terms</a></li>
               </ul>
            </div>
         </div>
      </footer>
    </div>
  );
};

export default LandingPage;
