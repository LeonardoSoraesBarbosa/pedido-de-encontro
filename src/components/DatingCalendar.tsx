import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Heart, Sparkles, Coffee, Utensils, Stars, Smile } from 'lucide-react';
import { sounds } from '../utils/sound';

interface DatingCalendarProps {
  onConfirm: (selectedDate: Date, timeSlot: string, notes: string) => void;
  clickedNoFirst: boolean;
}

const MONTHS_PT = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const DAYS_SHORT_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const TIME_SLOTS = [
  { id: 'morning_cafe', time: '09:30', label: 'Café da manhã especial para começar o dia ☕', emoji: '🥐' },
  { id: 'lunch_date', time: '12:30', label: 'Almoço super fofo e gostoso para conversar 🍝', emoji: '🍕' },
  { id: 'icecream_afternoon', time: '16:00', label: 'Sorvete no fim de tarde com pôr do sol 🍦', emoji: '🌅' },
  { id: 'dinner_candle', time: '19:30', label: 'Jantar romântico à luz de velas 🕯️', emoji: '🍷' },
  { id: 'stars_night', time: '21:30', label: 'Ver as estrelas ou comer uma besteira ✨', emoji: '🌌' },
];

export default function DatingCalendar({ onConfirm, clickedNoFirst }: DatingCalendarProps) {
  // Current time is 2026-07-08
  const today = new Date(2026, 6, 8); // July 8th, 2026
  
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date(2026, 6, 1)); // start on July 2026
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [customNotes, setCustomNotes] = useState<string>('');
  const [showError, setShowError] = useState<string>('');

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  // Calendar Math
  const firstDayOfMonth = new Date(year, month, 1);
  const startDayOfWeek = firstDayOfMonth.getDay(); // 0 is Sunday, 6 is Saturday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => {
    // Don't let them go before current month
    if (year === today.getFullYear() && month === today.getMonth()) return;
    setCurrentMonth(new Date(year, month - 1, 1));
    sounds.playSparkle();
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
    sounds.playSparkle();
  };

  const handleDateSelect = (day: number) => {
    const clickedDate = new Date(year, month, day);
    // If before today, do nothing
    if (clickedDate.getTime() < new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()) {
      return;
    }
    setSelectedDate(clickedDate);
    setShowError('');
    sounds.playSparkle();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate) {
      setShowError('Por favor, escolha uma data linda no calendário! 🗓️');
      return;
    }
    if (!selectedTimeSlot) {
      setShowError('Por favor, escolha o melhor horário para nós! ⏰');
      return;
    }
    
    sounds.playFanfare();
    onConfirm(selectedDate, selectedTimeSlot, customNotes);
  };

  // Generate blank spots before start of month
  const calendarDays = [];
  for (let i = 0; i < startDayOfWeek; i++) {
    calendarDays.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push(d);
  }

  const formatSelectedDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const monthStr = MONTHS_PT[date.getMonth()];
    const weekDay = DAYS_SHORT_PT[date.getDay()];
    return `${weekDay}, ${day} de ${monthStr}`;
  };

  return (
    <div id="dating-calendar-container" class="w-full">
      <div class="text-center mb-6">
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-300 text-xs font-semibold uppercase tracking-wider mb-2">
          <Sparkles class="w-3 h-3 text-pink-400" />
          Fase 2: Escolha o nosso dia especial
        </span>
        <h2 class="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-rose-200 font-display">Quando vamos comemorar?</h2>
        <p class="text-sm text-pink-100/60 mt-1">
          {clickedNoFirst 
            ? "Já que você tentou clicar em 'Não' (sei que foi sem querer! 😉), escolha a data perfeita abaixo:"
            : "Que felicidade! Agora escolha o melhor dia e horário para o nosso date:"}
        </p>
      </div>

      <form onSubmit={handleSubmit} class="space-y-6">
        {/* Calendar Card */}
        <div class="bg-white/5 backdrop-blur-md rounded-3xl p-4 md:p-5 border border-white/10 shadow-lg">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-bold text-white flex items-center gap-2">
              <CalendarIcon class="w-4 h-4 text-pink-400" />
              {MONTHS_PT[month]} de {year}
            </h3>
            <div class="flex gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                disabled={year === today.getFullYear() && month === today.getMonth()}
                class="p-1.5 rounded-lg border border-white/10 hover:bg-white/10 disabled:opacity-20 text-pink-300 transition-colors cursor-pointer"
              >
                <ChevronLeft class="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                class="p-1.5 rounded-lg border border-white/10 hover:bg-white/10 text-pink-300 transition-colors cursor-pointer"
              >
                <ChevronRight class="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday Headers */}
          <div class="grid grid-cols-7 text-center text-xs font-bold text-pink-400 mb-2">
            {DAYS_SHORT_PT.map((day) => (
              <div key={day} class="py-1">{day}</div>
            ))}
          </div>

          {/* Days Grid */}
          <div class="grid grid-cols-7 gap-1 text-center">
            {calendarDays.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} class="aspect-square"></div>;
              }

              const thisDate = new Date(year, month, day);
              const isPast = thisDate.getTime() < new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
              const isToday = thisDate.getDate() === today.getDate() && thisDate.getMonth() === today.getMonth() && thisDate.getFullYear() === today.getFullYear();
              const isSelected = selectedDate && 
                                selectedDate.getDate() === day && 
                                selectedDate.getMonth() === month && 
                                selectedDate.getFullYear() === year;

              return (
                <button
                  key={`day-${day}`}
                  type="button"
                  disabled={isPast}
                  onClick={() => handleDateSelect(day)}
                  className={`
                    aspect-square rounded-xl text-sm font-medium flex flex-col items-center justify-center relative transition-all duration-200 cursor-pointer
                    ${isPast ? 'text-white/20 cursor-not-allowed bg-white/2' : ''}
                    ${!isPast && !isSelected ? 'hover:bg-pink-500/20 text-pink-100/80 hover:text-pink-200' : ''}
                    ${isToday && !isSelected ? 'border-2 border-pink-500/40 text-pink-300 font-bold' : ''}
                    ${isSelected ? 'bg-gradient-to-br from-pink-500 to-rose-500 text-white font-bold shadow-[0_0_20px_rgba(236,72,153,0.4)] scale-105' : ''}
                  `}
                >
                  <span>{day}</span>
                  {isToday && !isSelected && (
                    <span class="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-pink-500"></span>
                  )}
                  {isSelected && (
                    <motion.span 
                      layoutId="selectedDayHeart" 
                      className="absolute -top-1 -right-1 text-pink-200"
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      <Heart class="w-3.5 h-3.5 fill-pink-100 text-pink-200" />
                    </motion.span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Time Slot Picker */}
        <AnimatePresence mode="wait">
          {selectedDate && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="space-y-3"
            >
              <div class="flex items-center gap-1.5 text-pink-200 font-bold text-sm px-1">
                <Clock class="w-4 h-4 text-pink-400" />
                <span>Escolha o momento ideal para o dia {formatSelectedDate(selectedDate)}:</span>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {TIME_SLOTS.map((slot) => {
                  const isSelected = selectedTimeSlot === slot.label;
                  return (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => {
                        setSelectedTimeSlot(slot.label);
                        setShowError('');
                        sounds.playSparkle();
                      }}
                      className={`
                        w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer duration-150
                        ${isSelected 
                          ? 'bg-pink-500/15 border-pink-500/40 ring-2 ring-pink-500/20 text-white font-semibold' 
                          : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-pink-100/70'}
                      `}
                    >
                      <div class="flex items-center gap-2">
                        <span class="text-xl">{slot.emoji}</span>
                        <div>
                          <p class="text-xs text-pink-300 font-mono font-bold">{slot.time}</p>
                          <p class="text-sm leading-tight text-white">{slot.label.split(' ')[0] + ' ' + slot.label.split(' ').slice(1).join(' ')}</p>
                        </div>
                      </div>
                      {isSelected && (
                        <div class="bg-pink-500 text-white rounded-full p-1 shadow-sm">
                          <Heart class="w-3 h-3 fill-white text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Custom Activity Suggestion */}
        <div class="space-y-2">
          <label htmlFor="custom-notes" class="block font-bold text-pink-200 text-sm px-1 flex items-center gap-1.5">
            <Coffee class="w-4 h-4 text-pink-400" />
            Sugestão de lugar, comida ou atividade (opcional):
          </label>
          <input
            id="custom-notes"
            type="text"
            value={customNotes}
            onChange={(e) => setCustomNotes(e.target.value)}
            placeholder="Ex: Comer sushi 🍣, sorvete no parque, assistir filme..."
            className="w-full p-3.5 rounded-xl border border-white/10 bg-white/5 shadow-inner focus:outline-hidden focus:ring-2 focus:ring-pink-500/30 focus:border-pink-500/50 text-sm text-white transition-all placeholder:text-white/30"
          />
        </div>

        {/* Error notification */}
        <AnimatePresence>
          {showError && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="p-3 bg-red-500/10 text-red-300 rounded-xl text-sm border border-red-500/20 font-medium text-center"
            >
              {showError}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-rose-600 text-white font-bold text-lg shadow-[0_0_25px_rgba(244,63,94,0.3)] hover:shadow-[0_0_35px_rgba(244,63,94,0.5)] transition-all cursor-pointer flex items-center justify-center gap-2 border border-pink-400/30"
        >
          <span>Confirmar Presença (Sem Direito a Reembolso)</span>
          <Smile className="w-5 h-5 text-white" />
        </motion.button>
      </form>
    </div>
  );
}
