import React, { useState } from 'react';
import { Cardio } from 'ldrs/react';
import 'ldrs/react/Cardio.css';
import { UploadCloud, Lock, CheckCircle, Zap, Cpu, Terminal } from 'lucide-react';
import { User as UserType } from '../types';
import { apiService } from '../services/api';
import CyberBackground from './CyberBackground';

interface PowerByProps {
  user: UserType | null;
  onLogin: () => void;
}

const PowerBy: React.FC<PowerByProps> = ({ user, onLogin }) => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setErrorMsg(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !user) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    const result = await apiService.submitProposal({
      title,
      description,
      phone,
      userId: user.id
    }, file);

    setIsSubmitting(false);

    if (result.success) {
      setSubmitted(true);
      setFile(null);
      setTitle('');
      setDescription('');
      setPhone('');
    } else {
      setErrorMsg(result.error || "Errore durante l'invio. Riprova.");
    }
  };

  return (
    <div className="min-h-screen bg-power-dark text-gray-300 font-mono relative overflow-hidden flex flex-col pt-20">
      
      <CyberBackground />

      {/* Background Grid & Effects */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,18,18,0)_1px,transparent_1px),linear-gradient(90deg,rgba(18,18,18,0)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] z-0 pointer-events-none opacity-20"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/10 via-black to-black z-0"></div>

      <div className="container mx-auto px-4 relative z-10 flex-1 flex flex-col">
        
        {/* Header Section */}
        <div className="text-center py-16 border-b border-gray-800 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-32 bg-neon/5 blur-[100px] pointer-events-none" />
            
            <h1 className="font-display italic font-black text-6xl md:text-9xl tracking-tighter leading-none mb-4 absolute top-10 left-0 w-full select-none pointer-events-none text-transparent [text-stroke:1px_rgba(255,255,255,0.25)] opacity-90 drop-shadow-[0_0_24px_rgba(163,230,53,0.15)]">
                VENTURE CAP
            </h1>

            <h2 className="relative font-display font-black text-5xl md:text-7xl text-white tracking-tight leading-none">
                <span className="text-white">POWER</span>
                <span className="text-white">ED</span>{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-neon to-purple-400 animate-gradient">BY KILOWATT</span>
            </h2>
            <p className="mt-6 max-w-2xl mx-auto text-gray-400 text-lg">
                Acceleratore di progetti creativi. Risorse in cambio di Equity.
            </p>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 py-12">
            
            {/* Left Column: Manifesto */}
            <div className="lg:col-span-5 flex flex-col justify-center space-y-8">
                <div className="bg-gray-900/50 border-l-4 border-purple-500 p-6 backdrop-blur-sm">
                    <h3 className="text-white font-bold uppercase mb-2 flex items-center gap-2"><Terminal size={18} className="text-purple-500"/> Protocollo Partnership</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">
                        Non siamo una banca. Siamo un partner operativo. Forniamo l'infrastruttura tecnologica (Audio, Video, Web) necessaria per scalare la tua idea, azzerando i costi di avvio.
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 border border-gray-800 rounded bg-black hover:border-neon transition-colors">
                        <Cpu className="text-gray-500 mb-2" />
                        <h4 className="text-white text-sm font-bold">Tech Stack</h4>
                        <p className="text-xs text-gray-500">Accesso illimitato al nostro hardware.</p>
                    </div>
                    <div className="p-4 border border-gray-800 rounded bg-black hover:border-neon transition-colors">
                        <Zap className="text-gray-500 mb-2" />
                        <h4 className="text-white text-sm font-bold">Execution</h4>
                        <p className="text-xs text-gray-500">Supporto operativo sul campo.</p>
                    </div>
                </div>
            </div>

            {/* Right Column: Interactive Terminal */}
            <div className="lg:col-span-7">
                <div className="bg-[#0c0c0c] border border-gray-800 rounded-xl overflow-hidden shadow-2xl relative min-h-[500px] flex flex-col">
                    {/* Terminal Header */}
                    <div className="bg-[#1a1a1a] px-4 py-2 flex items-center gap-2 border-b border-gray-800">
                        <div className="w-3 h-3 rounded-full bg-red-500/50" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                        <div className="w-3 h-3 rounded-full bg-green-500/50" />
                        <span className="ml-2 text-xs text-gray-500 font-mono">user@kilowatt-ventures:~</span>
                    </div>

                    <div className="p-8 flex-1 flex flex-col justify-center">
                         {!user ? (
                            <div className="text-center space-y-6">
                                <Lock
                                  size={64}
                                  className="text-red-500 mx-auto mb-4 drop-shadow-[0_0_18px_rgba(239,68,68,0.35)] animate-[pulse_3s_ease-in-out_infinite]"
                                />
                                <h3 className="text-2xl text-white font-bold font-display">ACCESSO NEGATO</h3>
                                <p className="text-gray-500 font-mono text-sm max-w-md mx-auto">
                                    {'>'} Errore 403: Identita non verificata.<br/>
                                    {'>'} Effettua il login per sottomettere il protocollo.
                                </p>
                                <button 
                                    onClick={onLogin}
                                    className="inline-flex items-center gap-2 px-8 py-3 bg-neon text-black font-bold font-display uppercase tracking-widest hover:bg-white transition-all shadow-[0_0_20px_rgba(163,230,53,0.2)]"
                                >
                                    Inizializza Login
                                    <Cardio size="50" stroke="4" speed="2" color="black" />
                                </button>
                            </div>
                         ) : submitted ? (
                            <div className="text-center animate-in fade-in zoom-in duration-300">
                                <div className="inline-block p-4 rounded-full bg-green-500/10 text-green-500 mb-6 border border-green-500/50 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
                                    <CheckCircle size={48} />
                                </div>
                                <h3 className="text-3xl text-white font-bold font-display italic">UPLOAD COMPLETATO</h3>
                                <p className="text-gray-400 mt-4 font-mono text-sm">
                                    {'>'} Packet ricevuto.<br/>
                                    {'>'} Analisi preliminare in corso...<br/>
                                    {'>'} Ti contatteremo entro 48h.
                                </p>
                                <button onClick={() => setSubmitted(false)} className="mt-8 text-xs text-gray-600 hover:text-white underline uppercase tracking-widest">
                                    Nuova trasmissione
                                </button>
                            </div>
                         ) : (
                             <form onSubmit={handleSubmit} className="space-y-6 max-w-lg mx-auto w-full">
                                <div className="flex items-center justify-between border-b border-gray-800 pb-2 mb-6">
                                    <span className="text-neon text-xs font-bold uppercase tracking-widest blink">INPUT MODE</span>
                                    <span className="text-gray-600 text-xs">{user.email}</span>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs text-gray-500 uppercase font-bold">Codename_Progetto</label>
                                    <input 
                                        type="text" 
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full bg-black border border-gray-700 text-white p-3 focus:border-neon focus:ring-1 focus:ring-neon outline-none font-mono"
                                        placeholder="Inserisci titolo..."
                                        required
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs text-gray-500 uppercase font-bold">Executive_Summary</label>
                                    <textarea 
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="w-full bg-black border border-gray-700 text-white p-3 focus:border-neon focus:ring-1 focus:ring-neon outline-none font-mono h-32 resize-none"
                                        placeholder="Descrizione sintetica del business..."
                                        required
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs text-gray-500 uppercase font-bold">Telefono_Contatto</label>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="w-full bg-black border border-gray-700 text-white p-3 focus:border-neon focus:ring-1 focus:ring-neon outline-none font-mono"
                                        placeholder="+39 ..."
                                        required
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs text-gray-500 uppercase font-bold">Documento (PDF)</label>
                                    <div className="relative border border-dashed border-gray-700 bg-black/50 hover:border-gray-500 transition-colors p-6 text-center cursor-pointer group">
                                        <input 
                                            type="file" 
                                            onChange={handleFileChange} 
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            accept=".pdf,.ppt,.pptx"
                                            required
                                        />
                                        <UploadCloud className="mx-auto text-gray-600 mb-2 group-hover:text-white" size={24} />
                                        <span className="text-xs text-gray-500 group-hover:text-gray-300">
                                            {file ? file.name : 'Clicca per caricare il pitch deck'}
                                        </span>
                                    </div>
                                </div>
                                
                                {errorMsg && <p className="text-red-500 text-xs font-mono">{errorMsg}</p>}

                                <button 
                                    type="submit" 
                                    disabled={isSubmitting}
                                    className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-4 uppercase tracking-widest transition-all mt-4 relative overflow-hidden"
                                >
                                    {isSubmitting ? 'INVIO IN CORSO...' : 'INVIA PROPOSTA'}
                                </button>
                             </form>
                         )}
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default PowerBy;
