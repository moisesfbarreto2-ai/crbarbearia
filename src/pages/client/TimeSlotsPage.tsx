import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { ArrowLeft, Clock, Scissors, User, Calendar as CalendarIcon } from 'lucide-react';

import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { DbAppointment } from '@/types';

const TimeSlotsPage = () => {
    const navigate = useNavigate();
    // Get the global loading state from the context and alias it
    const { 
        booking, 
        setBookingTime, 
        getAppointmentsByBarberAndDay, 
        settings, 
        isLoading: isContextLoading 
    } = useAppContext();
    
    const [busySlots, setBusySlots] = useState<Set<string>>(new Set());
    // This state is for the local appointment fetching on this page
    const [isAppointmentsLoading, setIsAppointmentsLoading] = useState(true);

    // Effect to redirect if booking info is incomplete, but only after context is loaded
    useEffect(() => {
        if (!isContextLoading && (!booking.barber || !booking.date || booking.services.length === 0)) {
            navigate('/');
        }
    }, [isContextLoading, booking, navigate]);

    // Effect to fetch daily appointments
    useEffect(() => {
        // Don't run if the main context is still loading or if booking data is missing
        if (isContextLoading || !booking.barber || !booking.date) {
            return;
        }

        const fetchAppointments = async () => {
            setIsAppointmentsLoading(true);
            try {
                const appointments: DbAppointment[] = await getAppointmentsByBarberAndDay(booking.barber!.id, booking.date!);
                
                const allBusyTimes = new Set<string>();
                const interval = 30; // minutes

                appointments.forEach(appt => {
                    const startTime = parseISO(appt.date);
                    const duration = appt.total_duration;
                    const slotsToBlock = Math.ceil(duration / interval);

                    for (let i = 0; i < slotsToBlock; i++) {
                        const slotTime = new Date(startTime.getTime() + i * interval * 60 * 1000);
                        allBusyTimes.add(format(slotTime, 'HH:mm'));
                    }
                });
                setBusySlots(allBusyTimes);
            } catch (error) {
                console.error("Failed to fetch appointments for time slots:", error);
            } finally {
                setIsAppointmentsLoading(false);
            }
        };

        fetchAppointments();
    }, [isContextLoading, booking.barber, booking.date, getAppointmentsByBarberAndDay]);

    const timeSlots = useMemo(() => {
        // This check is now safe because the component waits for `isContextLoading` to be false
        if (!settings || !settings.opening_time || !settings.closing_time || !booking.date) {
            return [];
        }

        try {
            const slots = [];
            const interval = 30; 

            const [startHour, startMinute] = settings.opening_time.split(':').map(Number);
            const [endHour, endMinute] = settings.closing_time.split(':').map(Number);

            let currentTime = new Date(booking.date!);
            currentTime.setHours(startHour, startMinute, 0, 0);
            
            const endTime = new Date(booking.date!);
            endTime.setHours(endHour, endMinute, 0, 0);

            while (currentTime < endTime) {
                slots.push(format(currentTime, 'HH:mm'));
                currentTime.setMinutes(currentTime.getMinutes() + interval);
            }

            return slots;
        } catch (error) {
            console.error("Error generating time slots:", error);
            return [];
        }
    }, [settings, booking.date]);

    const handleTimeSelect = (time: string) => {
        setBookingTime(time);
        navigate('/confirmar');
    };

    // === MAIN FIX: Top-level guard using the context's loading state ===
    if (isContextLoading) {
        return (
            <div className="space-y-6 pb-20">
                <header className="relative flex items-center justify-center">
                    <Button variant="ghost" size="icon" className="absolute left-0" onClick={() => navigate('/servicos')}>
                        <ArrowLeft />
                    </Button>
                    <h1 className="text-xl font-bold">Escolha um Horário</h1>
                </header>
                <p className="text-center p-10">Carregando configurações...</p>
            </div>
        )
    }

    // This guard prevents rendering if the user somehow lands here without booking info
    if (!booking.barber || !booking.date) return null;

    const totalDuration = booking.services.reduce((acc, s) => acc + s.duration, 0);
    const totalPrice = booking.services.reduce((acc, s) => acc + s.price, 0);

    const isSlotAvailable = (slot: string) => {
        const interval = 30;
        const slotsNeeded = Math.ceil(totalDuration / interval);
        const [startHour, startMinute] = slot.split(':').map(Number);
        
        for (let i = 0; i < slotsNeeded; i++) {
            const checkTime = new Date(booking.date!);
            checkTime.setHours(startHour, startMinute + (i * interval), 0, 0);
            const checkSlot = format(checkTime, 'HH:mm');
            
            if (busySlots.has(checkSlot) || !timeSlots.includes(checkSlot)) {
                return false;
            }
        }
        return true;
    };

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
                {isAppointmentsLoading ? (
                    <p className="text-center">Carregando horários...</p>
                ) : timeSlots.length === 0 ? (
                    <p className="text-center text-muted-foreground pt-4">Não foi possível carregar os horários. Verifique as configurações da barbearia ou selecione uma data.</p>
                ) : (
                    <div className="grid grid-cols-4 gap-2">
                        {timeSlots.map(slot => {
                            const isAvailable = isSlotAvailable(slot);
                            return (
                                <Button
                                    key={slot}
                                    variant={isAvailable ? 'outline' : 'destructive'}
                                    disabled={!isAvailable}
                                    onClick={() => handleTimeSelect(slot)}
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
