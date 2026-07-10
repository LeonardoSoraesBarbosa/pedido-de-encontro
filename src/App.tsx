import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Sparkles, AlertCircle, Calendar as CalendarIcon, Copy, Check, ArrowRight, RefreshCw, Star, MessageSquare, Info } from 'lucide-react';
import { AppStep, DateDetails } from './types';
import { sounds } from './utils/sound';
import DatingCalendar from './components/DatingCalendar';
import HeartConfetti from './components/HeartConfetti';

// Funny hints to display as they try to click "Não"
const DODGE_MESSAGES = [
  "Opa! Quase... 😉",
  "Ih, o botão se moveu! 😮",
  "Dedo escorregou? 😂",
  "O 'Não' está meio arisco hoje! 🏃‍♂️",
  "Quase lá! 🎯",
  "Certeza que não prefere o SIM? 🤔",
  "O 'Sim' é um caminho bem melhor! ❤️",
  "Parece que o 'Sim' quer vencer! 🥰",
  "Ok, acho que é o destino! ✨",
  "Tá bom, você venceu! Pode me clicar. 🥺"
];

export default function App() {
  const [step, setStep] = useState<AppStep>(AppStep.PROPOSAL);
  const [noAttempts, setNoAttempts] = useState(0);
  const [noOffset, setNoOffset] = useState({ x: 0, y: 0 });
  const [copied, setCopied] = useState(false);
  const [guestName, setGuestName] = useState<string>('');
  const [dateDetails, setDateDetails] = useState<DateDetails>({
    date: '',
    timeSlot: '',
    notes: '',
    clickedNoFirst: false,
    noAttempts: 0
  });

  const [redirectCountdown, setRedirectCountdown] = useState(3);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);

  const [rawSelectedDate, setRawSelectedDate] = useState<Date | null>(null);

  // Parse custom URL parameters to identify guest
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const name = params.get('n') || params.get('nome') || params.get('name') || params.get('p') || params.get('convidado');
      if (name) {
        setGuestName(name.trim());
      }
    }
  }, []);

  // Dodge function for the "Não" button
  const handleDodgeNoButton = (e: React.MouseEvent | React.TouchEvent | React.PointerEvent) => {
    if (noAttempts >= 9) {
      // On the 10th attempt, let them click it!
      sounds.playBloop();
      return;
    }

    // Prevent default on touch / pointer down to prevent any click trigger on the original position
    if (e.cancelable) {
      e.preventDefault();
    }

    // Play bloop sound
    if (soundEnabled) {
      sounds.playBloop();
    }

    setNoAttempts((prev) => prev + 1);

    // Calculate dynamic random position offsets
    // Keep it smaller on mobile so it stays within phone screens beautifully
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const rangeX = isMobile ? 80 : 150;
    const rangeY = isMobile ? 60 : 110;
    
    let newX = (Math.random() * 2 - 1) * rangeX;
    let newY = (Math.random() * 2 - 1) * rangeY;

    // Check if new positions are too close to zero, force distance
    if (Math.abs(newX) < 40) newX = newX < 0 ? -60 : 60;
    if (Math.abs(newY) < 30) newY = newY < 0 ? -50 : 50;

    setNoOffset({ x: newX, y: newY });
  };

  // Direct WhatsApp sending with user pre-filled text
  const handleWhatsAppRedirect = () => {
    const activityText = dateDetails.notes ? `\n🍕 Plano: ${dateDetails.notes}` : '';
    const message = `Date confirmado! 🥰\n\n📅 Data: ${dateDetails.date}\n⏰ Horário: ${dateDetails.timeSlot}${activityText}\n\nMal posso esperar! ✨`;
    const url = `https://api.whatsapp.com/send?phone=5531996822803&text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // If clicked "Não"
  const handleNoClick = () => {
    sounds.playSparkle();
    setDateDetails(prev => ({
      ...prev,
      clickedNoFirst: true,
      noAttempts: noAttempts
    }));
    setStep(AppStep.CLICKED_WRONG);
  };

  // If clicked "Sim"
  const handleYesClick = () => {
    sounds.playSparkle();
    setStep(AppStep.CALENDAR);
  };

  // Automatic redirect timer for the CLICKED_WRONG screen
  useEffect(() => {
    if (step === AppStep.CLICKED_WRONG) {
      setRedirectCountdown(4);
      const timer = setInterval(() => {
        setRedirectCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setStep(AppStep.CALENDAR);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [step]);

  // Handle meeting confirmation
  const handleCalendarConfirm = (selectedDate: Date, timeSlot: string, notes: string) => {
    setRawSelectedDate(selectedDate);
    const formattedDate = selectedDate.toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    setDateDetails((prev) => ({
      ...prev,
      date: formattedDate,
      timeSlot: timeSlot,
      notes: notes,
      noAttempts: noAttempts
    }));

    setStep(AppStep.CONFIRMED);
  };

  const getGoogleCalendarUrl = () => {
    if (!rawSelectedDate) return '';
    
    // Parse hour and minute from timeSlot label
    let hour = 19;
    let minute = 30;
    
    const tsLower = dateDetails.timeSlot.toLowerCase();
    if (tsLower.includes('09:30') || tsLower.includes('café') || tsLower.includes('cafe')) {
      hour = 9; minute = 30;
    } else if (tsLower.includes('12:30') || tsLower.includes('almoço') || tsLower.includes('almoco')) {
      hour = 12; minute = 30;
    } else if (tsLower.includes('16:00') || tsLower.includes('sorvete')) {
      hour = 16; minute = 0;
    } else if (tsLower.includes('19:30') || tsLower.includes('jantar')) {
      hour = 19; minute = 30;
    } else if (tsLower.includes('21:30') || tsLower.includes('estrelas') || tsLower.includes('besteira')) {
      hour = 21; minute = 30;
    }
    
    const startDate = new Date(rawSelectedDate);
    startDate.setHours(hour, minute, 0);
    
    const endDate = new Date(startDate);
    endDate.setHours(startDate.getHours() + 2);
    
    const formatCalendarDate = (date: Date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      const h = String(date.getHours()).padStart(2, '0');
      const min = String(date.getMinutes()).padStart(2, '0');
      const s = String(date.getSeconds()).padStart(2, '0');
      return `${y}${m}${d}T${h}${min}${s}`;
    };
    
    const datesParam = `${formatCalendarDate(startDate)}/${formatCalendarDate(endDate)}`;
    const title = `Date Especial com ${guestName || "você"}`;
    
    const notesText = dateDetails.notes ? `\n🍕 Plano sugerido: ${dateDetails.notes}` : '';
    const details = `Nosso encontro fofo está confirmado! 🥰\n\n📅 Data: ${dateDetails.date}\n⏰ Horário: ${dateDetails.timeSlot}${notesText}\n\nAnsioso por esse dia! ✨`;
    
    // add Leonardo's email as an invitee so Google Calendar prompts the user to send him an invite email
    const guestEmail = "soaresbarbosaleonardo@gmail.com";
    
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${datesParam}&details=${encodeURIComponent(details)}&add=${encodeURIComponent(guestEmail)}`;
  };

  // Generate WhatsApp text & copy to clipboard
  const handleCopyInvite = () => {
    const activityText = dateDetails.notes ? `\n🍕 Plano: ${dateDetails.notes}` : '';
    const inviteText = `Date confirmado! 🥰\n\n📅 Data: ${dateDetails.date}\n⏰ Horário: ${dateDetails.timeSlot}${activityText}\n\nMal posso esperar! ✨`;
    
    navigator.clipboard.writeText(inviteText)
      .then(() => {
        setCopied(true);
        sounds.playSparkle();
        setTimeout(() => setCopied(false), 3000);
      })
      .catch((err) => console.error('Erro ao copiar:', err));
  };

  const handleReset = () => {
    setStep(AppStep.PROPOSAL);
    setNoAttempts(0);
    setNoOffset({ x: 0, y: 0 });
    setDateDetails({
      date: '',
      timeSlot: '',
      notes: '',
      clickedNoFirst: false,
      noAttempts: 0
    });
    sounds.playSparkle();
  };

  return (
    <main className="min-h-screen bg-romantic-grid flex flex-col items-center justify-center p-4 md:p-6 relative select-none overflow-hidden">
      
      {/* Ambient Background Glows from Immersive UI */}
      <div className="absolute top-[-10%] left-[-10%] w-[450px] md:w-[600px] h-[450px] md:h-[600px] bg-pink-600/15 rounded-full blur-[100px] md:blur-[130px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] md:w-[700px] h-[500px] md:h-[700px] bg-purple-900/25 rounded-full blur-[120px] md:blur-[150px] pointer-events-none"></div>

      {/* Floating Decorations */}
      <div className="absolute top-16 right-12 md:right-32 text-pink-500/20 text-6xl rotate-12 select-none pointer-events-none animate-float" style={{ animationDelay: '0.8s' }}>💖</div>
      <div className="absolute bottom-16 left-12 md:left-32 text-purple-400/20 text-5xl -rotate-12 select-none pointer-events-none animate-float" style={{ animationDelay: '1.5s' }}>✨</div>
      <div className="absolute top-1/2 left-10 md:left-20 text-pink-500/10 text-4xl select-none pointer-events-none animate-float" style={{ animationDelay: '0s' }}>🌸</div>

      {/* Floating sound toggle top-right */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-pink-300 hover:bg-white/20 transition-colors shadow-sm cursor-pointer flex items-center justify-center"
          title={soundEnabled ? "Desativar sons" : "Ativar sons"}
        >
          {soundEnabled ? "🔊" : "🔇"}
        </button>
      </div>

      {/* Confetti overlay in confirmed screen */}
      {step === AppStep.CONFIRMED && <HeartConfetti />}

      {/* Card Wrapper with motion wrapper for screen transitions */}
      <AnimatePresence mode="wait">
        
        {/* STEP 1: PROPOSAL */}
        {step === AppStep.PROPOSAL && (
          <motion.div
            key="proposal-step"
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -15 }}
            transition={{ duration: 0.35 }}
            className="w-full max-w-lg bg-white/10 backdrop-blur-xl border border-white/15 rounded-[32px] md:rounded-[40px] shadow-[0_32px_64px_rgba(0,0,0,0.5)] p-5 sm:p-8 md:p-10 flex flex-col items-center text-center relative"
          >
            {/* Glowing avatar icon */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-pink-500 to-rose-600 rounded-full mb-4 sm:mb-6 flex items-center justify-center shadow-[0_0_30px_rgba(236,72,153,0.4)] relative">
              <span className="text-3xl sm:text-4xl">💌</span>
            </div>

            {/* Question Heading with Immersive gradient title */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-200 via-rose-200 to-purple-200 tracking-tight font-display mb-2 leading-tight">
              {guestName ? `${guestName}, quer sair para um date comigo? 🌹` : "Quer sair para um date comigo? 🌹"}
            </h1>
            
            <p className="text-pink-100/70 text-xs sm:text-sm md:text-base font-medium max-w-xs mb-4 sm:mb-6">
              Escolha com carinho... 👇
            </p>

            {/* Dodge Caption Notification (Only if they try to click No) */}
            <div className="h-8 mb-2 flex items-center justify-center w-full">
              <AnimatePresence mode="wait">
                {noAttempts > 0 && (
                  <motion.div
                    key={`dodge-msg-${noAttempts}`}
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.9 }}
                    className="text-[11px] sm:text-xs font-bold text-pink-300 bg-pink-950/40 px-3 py-1.5 rounded-full border border-pink-500/20 shadow-xs backdrop-blur-md"
                  >
                    {DODGE_MESSAGES[Math.min(noAttempts - 1, DODGE_MESSAGES.length - 1)]}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Buttons Layout Container */}
            <div 
              ref={containerRef}
              className="w-full flex flex-row items-center justify-center gap-4 py-2 min-h-[100px] md:min-h-[120px] relative"
            >
              {/* YES BUTTON - Stationary, huge, inviting, neon glow */}
              <motion.button
                whileHover={{ scale: 1.1, rotate: 1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleYesClick}
                onMouseEnter={() => soundEnabled && sounds.playSparkle()}
                className="px-6 py-3.5 sm:px-8 sm:py-4 md:px-10 md:py-5 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl font-bold text-base sm:text-lg md:text-xl text-white shadow-[0_0_35px_rgba(244,63,94,0.4)] border border-pink-400/40 hover:border-pink-300/60 hover:shadow-[0_0_45px_rgba(244,63,94,0.6)] transition-all cursor-pointer flex items-center gap-2 z-10"
              >
                Sim! ✨
              </motion.button>

              {/* NO BUTTON - Playful, dodges mouse/pointer hover or touch */}
              <motion.button
                id="no-button"
                animate={{ x: noOffset.x, y: noOffset.y }}
                transition={{ type: "spring", stiffness: 350, damping: 20 }}
                onMouseEnter={handleDodgeNoButton}
                onPointerDown={handleDodgeNoButton}
                onClick={noAttempts >= 9 ? handleNoClick : handleDodgeNoButton}
                className={`
                  px-5 py-3 sm:px-6 sm:py-3.5 md:px-8 md:py-4.5 rounded-2xl border text-xs sm:text-sm font-bold shadow-xs cursor-pointer select-none transition-all duration-150
                  ${noAttempts >= 9 
                    ? 'bg-red-500/20 border-red-500/40 text-red-200' 
                    : 'bg-white/5 border-white/10 text-white/40 italic'}
                `}
                style={{ touchAction: 'none' }}
              >
                {noAttempts >= 9 ? "Tá bom, você venceu 🥺" : "Não..."}
              </motion.button>
            </div>

            {/* Fun footer warning */}
            <div className="mt-4 sm:mt-6 flex items-center justify-center gap-2 text-white/30 text-xs tracking-widest uppercase">
              <div className="w-8 h-[1px] bg-white/20"></div>
              <span>Responda com o coração ❤️</span>
              <div className="w-8 h-[1px] bg-white/20"></div>
            </div>
          </motion.div>
        )}

        {/* STEP 2: CLICKED WRONG INTERMEDIATE SCREEN */}
        {step === AppStep.CLICKED_WRONG && (
          <motion.div
            key="clicked-wrong-step"
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -15 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/15 rounded-[32px] md:rounded-[40px] shadow-[0_32px_64px_rgba(0,0,0,0.5)] p-6 md:p-8 flex flex-col items-center text-center relative"
          >
            <div className="w-14 h-14 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mb-4 text-amber-300">
              <AlertCircle className="w-8 h-8" />
            </div>

            <h1 className="text-xl md:text-2xl font-extrabold text-amber-300 font-display mb-2">
              Redirecionando... 😉
            </h1>

            <p className="text-pink-100/70 text-xs md:text-sm leading-relaxed mb-4">
              O sistema detectou que você quer escolher a data perfeita para o nosso date. Vamos abrir o calendário...
            </p>

            {/* Progress bar countdown */}
            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mb-4">
              <motion.div 
                className="bg-amber-400 h-full"
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 4, ease: "linear" }}
              />
            </div>

            <p className="text-[10px] md:text-xs text-amber-300 font-bold uppercase tracking-wider mb-4">
              Redirecionando para o calendário em {redirectCountdown}...
            </p>

            <button
              onClick={() => {
                setStep(AppStep.CALENDAR);
                sounds.playSparkle();
              }}
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-bold text-sm transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>Ir para o calendário agora</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* STEP 3: CALENDAR & DETAILED SELECTION */}
        {step === AppStep.CALENDAR && (
          <motion.div
            key="calendar-step"
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -15 }}
            transition={{ duration: 0.35 }}
            className="w-full max-w-xl bg-white/10 backdrop-blur-xl border border-white/15 rounded-[32px] md:rounded-[40px] shadow-[0_32px_64px_rgba(0,0,0,0.5)] p-4 sm:p-6 md:p-8"
          >
            <DatingCalendar 
              clickedNoFirst={dateDetails.clickedNoFirst}
              onConfirm={handleCalendarConfirm}
            />
          </motion.div>
        )}

        {/* STEP 4: FINAL CONFIRMATION */}
        {step === AppStep.CONFIRMED && (
          <motion.div
            key="confirmed-step"
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -15 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/15 rounded-[40px] shadow-[0_32px_64px_rgba(0,0,0,0.5)] p-8 md:p-10 flex flex-col items-center text-center relative"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mb-6 text-emerald-400 animate-bounce">
              <Heart className="w-8 h-8 fill-emerald-400 text-emerald-400" />
            </div>

            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-emerald-300 font-display mb-1 leading-tight">
              Eba! Date Agendado! 🎉
            </h1>
            <p className="text-sm text-pink-100/50 mb-6">
              Nosso encontro está confirmado! 🥰
            </p>

            {/* Ticket Card View */}
            <div className="w-full bg-white/5 backdrop-blur-xs rounded-2xl border border-dashed border-white/25 p-5 relative text-left mb-6 overflow-hidden">
              {/* Side ticket circles */}
              <div className="absolute top-1/2 -left-3 w-6 h-6 bg-[#0f0a15] border-r border-white/15 rounded-full transform -translate-y-1/2"></div>
              <div className="absolute top-1/2 -right-3 w-6 h-6 bg-[#0f0a15] border-l border-white/15 rounded-full transform -translate-y-1/2"></div>

              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
                <span className="text-[10px] font-mono font-bold text-pink-300 tracking-widest uppercase">Cupid-Ticket #2026</span>
                <span className="text-xs font-bold text-emerald-300 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30">Confirmado</span>
              </div>

              <div className="space-y-3 font-sans text-pink-100/90">
                <div>
                  <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-pink-300 block">Dia do Evento</span>
                  <span className="font-bold text-white flex items-center gap-1.5 text-sm md:text-base mt-0.5">
                    <CalendarIcon className="w-4 h-4 text-pink-400" />
                    {dateDetails.date}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-pink-300 block">Horário Marcado</span>
                  <span className="font-bold text-white flex items-center gap-1.5 text-sm mt-0.5">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    {dateDetails.timeSlot}
                  </span>
                </div>

                {dateDetails.notes && (
                  <div>
                    <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-pink-300 block">Plano de Ação</span>
                    <span className="italic text-pink-200 font-medium text-xs block mt-1 bg-white/5 p-2 rounded-lg border border-white/10">
                      "{dateDetails.notes}"
                    </span>
                  </div>
                )}
              </div>
            </div>

             {/* Heart-melting dynamic customized message */}
            <p className="text-pink-100/70 text-sm leading-relaxed mb-6 px-1">
              {dateDetails.clickedNoFirst ? (
                <span>
                  Fico muito feliz que deu tudo certo! Mal posso esperar por esse momento! 🥰 Te vejo em breve!
                </span>
              ) : (
                <span>
                  Que fofura! Fico super feliz e mal posso esperar para nos vermos! 🥰✨
                </span>
              )}
            </p>

            {/* Sharing tips and direct messaging options */}
            <div className="w-full mb-6 p-4 rounded-xl text-left text-xs leading-relaxed border border-pink-500/10 bg-pink-500/5 backdrop-blur-md">
              <div className="flex flex-col gap-3">
                <div className="flex items-start gap-2 text-pink-200">
                  <Info className="w-4 h-4 text-pink-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-bold block text-[13px] text-pink-300">💡 Como avisar o Léo?</span>
                    <p className="text-pink-100/70 text-[11px] leading-relaxed">
                      Ao clicar no botão azul abaixo para adicionar ao seu <strong className="text-white font-medium">Google Calendar</strong>, o e-mail do Léo (<strong className="text-pink-300 font-mono">soaresbarbosaleonardo@gmail.com</strong>) já estará incluído automaticamente como convidado!
                    </p>
                    <p className="text-pink-100/70 text-[11px] leading-relaxed">
                      Ao salvar o evento, o Google Calendar te perguntará: <em className="text-white font-medium">"Deseja enviar e-mails de convite para os convidados?"</em>. Clique em <strong className="text-emerald-400">Enviar</strong> para que o Léo receba um convite oficial direto na caixa de entrada e agenda dele! 📅✨
                    </p>
                    <p className="text-pink-100/70 text-[11px] leading-relaxed pt-1.5 border-t border-pink-500/10">
                      Você também pode clicar no botão verde do <strong className="text-emerald-400 font-medium">WhatsApp</strong> para mandar uma mensagem super fofa confirmando os detalhes do encontro na hora! 📲💬
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="w-full space-y-2">
              {/* Direct WhatsApp Send Button */}
              <button
                onClick={handleWhatsAppRedirect}
                className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-extrabold text-base hover:from-emerald-600 hover:to-green-700 shadow-[0_0_25px_rgba(16,185,129,0.3)] hover:shadow-[0_0_35px_rgba(16,185,129,0.5)] transition-all cursor-pointer flex items-center justify-center gap-2 border border-emerald-400/30"
              >
                <MessageSquare className="w-5 h-5 fill-white text-white" />
                <span>Confirmar no WhatsApp! 💬</span>
              </button>

              {/* Add to Google Calendar Button */}
              {rawSelectedDate && (
                <a
                  href={getGoogleCalendarUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-extrabold text-sm shadow-[0_0_20px_rgba(59,130,246,0.2)] hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] transition-all flex items-center justify-center gap-2 border border-blue-400/30 cursor-pointer text-center"
                >
                  <CalendarIcon className="w-4 h-4 text-white" />
                  <span>Adicionar ao Google Calendar! 📅</span>
                </a>
              )}

              {/* Copiar convite button */}
              <button
                onClick={handleCopyInvite}
                className="w-full py-3 px-5 rounded-2xl bg-white/5 hover:bg-white/10 text-pink-200 font-semibold text-sm transition-all cursor-pointer flex items-center justify-center gap-2 border border-white/10"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Copiado com Sucesso! 💖</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-pink-300" />
                    <span>Copiar Convite (Manual)</span>
                  </>
                )}
              </button>

              <button
                onClick={handleReset}
                className="w-full py-2.5 px-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-pink-200/50 hover:text-pink-200 font-semibold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Mudar Detalhes do Date</span>
              </button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

      {/* Decorative credit lines at the bottom */}
      <footer className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-[11px] text-pink-400/30 font-mono font-medium tracking-widest uppercase whitespace-nowrap">
        Feito com carinho ❤️
      </footer>
    </main>
  );
}
