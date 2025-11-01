import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowLeft, Clock, Scissors, User, Calendar as CalendarIcon } from 'lucide-react';

import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { DbAppointment } from '@/types';

const TimeSlotsPage = () => {
    const navigate = useNavigate();
    const { booking, setBookingTime, getAppointmentsByBarberAndDay } = useAppContext();
    const [busySlots, setBusySlots] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!booking.barber || !booking.date || booking.services.length === 0) {
            navigate('/');
            return;
        }

        const fetchAppointments = async () => {
            setIsLoading(true);
            const appointments: DbAppointment[] = await getAppointmentsByBarberAndDay(booking.barber!.id, booking.date!);
            const slots = appointments.map(appt => format(parseISO(appt.date), 'HH:mm'));
            setBusySlots(slots);
            setIsLoading(false);
        };

        fetchAppointments();
    }, [booking.barber, booking.date, getAppointmentsByBarberAndDay, navigate]);

    const timeSlots = useMemo(() => {
        // In a real app, this would be more dynamic based on barber's schedule for the day
        const slots = [];
        for (let hour = 8; hour < 18; hour++) {
            slots.push(`${String(hour).padStart(2, '0')}:00`);
            slots.push(`${String(hour).padStart(2, '0')}:30`);
        }
        return slots;
    }, []);

    const handleTimeSelect = (time: string) => {
        setBookingTime(time);
        navigate('/confirmar');
    };

    if (!booking.barber || !booking.date) return null;

    const totalDuration = booking.services.reduce((acc, s) => acc + s.duration, 0);
    const totalPrice = booking.services.reduce((acc, s) => acc + s.price, 0);

    return (
        <div className="space-y-6 pb-20">
            <header className="relative flex items-center justify-center">
                <Button variant="ghost" size="icon" className="absolute left-0" onClick={() => navigate('/servicos')}>
                    <ArrowLeft />
                </Button>
                <h1 className="text-xl font-bold">Escolha um Horário</h1>
            </header>
            
            <Card>
                <CardContent className="p-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm"><User className="w-4 h-4 text-primary" /> <span>{booking.barber.name}</span></div>
                    <div className="flex items-center gap-2 text-sm"><Scissors className="w-4 h-4 text-primary" /> <span>{booking.services.map(s => s.name).join(', ')}</span></div>
                    <Separator />
                    <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-primary" /> <span>{totalDuration} min / R$ {totalPrice.toFixed(2)}</span></div>
                        <div className="flex items-center gap-2"><CalendarIcon className="w-4 h-4 text-primary" /> <span>{format(booking.date, 'dd/MM/yyyy')}</span></div>
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-4">
                <div className="flex items-center justify-center gap-4 text-sm">
                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-primary"></span> Disponível</div>
                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-destructive"></span> Ocupado</div>
                </div>
                {isLoading ? (
                    <p className="text-center">Carregando horários...</p>
                ) : (
                    <div className="grid grid-cols-4 gap-2">
                        {timeSlots.map(slot => {
                            const isBusy = busySlots.includes(slot);
                            return (
                                <Button
                                    key={slot}
                                    variant={isBusy ? 'destructive' : 'outline'}
                                    disabled={isBusy}
                                    onClick={() => !isBusy && handleTimeSelect(slot)}
                                >
                                    {slot}
                                </Button>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TimeSlotsPage;
