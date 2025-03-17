import React, { useState } from 'react';
import { Phone, Mail, MapPin, Instagram, Facebook, Calendar } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '../lib/supabase';
import 'react-day-picker/dist/style.css';

export default function Contact() {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const availableTimes = [
    '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const { error: formError } = await supabase
        .from('contact_forms')
        .insert({
          name,
          email,
          phone,
          message,
          visit_date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null,
          visit_time: selectedTime || null,
          status: 'pending'
        });

      if (formError) throw formError;
      
      setSuccess(true);
      // Limpa o formulário
      setName('');
      setEmail('');
      setPhone('');
      setMessage('');
      setSelectedDate(undefined);
      setSelectedTime('');
      
    } catch (err: any) {
      console.error('Error:', err);
      setError('Erro ao enviar mensagem. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="contact" className="bg-gray-50 dark:bg-gray-900 py-12 sm:py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">Entre em Contato</h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Estou aqui para ajudar você a encontrar o imóvel ideal
          </p>
        </div>

        <div className="mt-12 sm:mt-16 lg:mt-20 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Info Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sm:p-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Informações de Contato</h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <Phone className="w-5 h-5 text-rose-600 mr-3 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">(11) 97858-4270</span>
              </div>
              <div className="flex items-center">
                <Mail className="w-5 h-5 text-rose-600 mr-3 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">contato@dlucchesi.com.br</span>
              </div>
              <div className="flex items-center">
                <MapPin className="w-5 h-5 text-rose-600 mr-3 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">São Paulo, SP</span>
              </div>
              <div className="flex space-x-4 mt-6">
                <a href="https://www.instagram.com/lucc.corretora/" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-500 transition-colors">
                  <Instagram className="w-6 h-6" />
                </a>
                <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-500 transition-colors">
                  <Facebook className="w-6 h-6" />
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-200 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="bg-green-50 dark:bg-green-900/50 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-200 px-4 py-3 rounded-lg">
                  Mensagem enviada com sucesso! Entraremos em contato em breve.
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 focus:ring-rose-500 focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 focus:ring-rose-500 focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Telefone</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 focus:ring-rose-500 focus:border-rose-500"
                />
              </div>
              
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Agendar Visita (Opcional)</label>
                <div className="mt-1 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowCalendar(!showCalendar)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    {selectedDate ? format(selectedDate, 'dd/MM/yyyy') : 'Selecionar Data'}
                  </button>
                  
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-white focus:ring-rose-500 focus:border-rose-500"
                  >
                    <option value="">Selecionar Horário</option>
                    {availableTimes.map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
                
                {showCalendar && (
                  <div className="absolute z-10 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
                    <DayPicker
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => {
                        setSelectedDate(date);
                        setShowCalendar(false);
                      }}
                      locale={ptBR}
                      disabled={[
                        { dayOfWeek: [0] }, // Disable Sundays
                        { before: new Date() } // Disable past dates
                      ]}
                      className="dark:bg-gray-800 dark:text-white"
                      styles={{
                        caption: { color: 'inherit' },
                        head_cell: { color: 'inherit' },
                        cell: { color: 'inherit' },
                        nav_button: { color: 'inherit' }
                      }}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Mensagem</label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 focus:ring-rose-500 focus:border-rose-500"
                ></textarea>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-rose-600 text-white py-2 px-4 rounded-md hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 disabled:opacity-50 transition-colors duration-200"
              >
                {loading ? 'Enviando...' : 'Enviar Mensagem'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}