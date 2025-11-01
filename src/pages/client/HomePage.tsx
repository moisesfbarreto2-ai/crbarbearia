import { Calendar as CalendarIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format, addDays, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

const HomePage = () => {
    const navigate = useNavigate();
    const { settings, barbers, setBookingBarber, setBookingDate, booking, isLoading } = useAppContext();

    const handleBarberSelect = (barber) => {
        if (!booking.date) {
            // Optionally, set today's date if none is selected
            setBookingDate(new Date());
        }
        setBookingBarber(barber);
        navigate('/servicos');
    };

    const handleDateSelect = (date) => {
        if (date) {
            setBookingDate(date);
        }
    };

    const nextDays = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i));

    if (isLoading) {
        return <div className="text-center p-10">Carregando barbearia...</div>
    }

    return (
        <div className="space-y-8">
            <header className="text-center space-y-2">
                <h1 className="text-2xl font-bold tracking-tight">{settings?.name}</h1>
                <p className="text-muted-foreground">ESTILO & ELEGÂNCIA</p>
                <p className="text-lg">✨ Bem-vindo ✨</p>
                <p className="text-muted-foreground">Escolha sua data e barbeiro.</p>
            </header>

            <Card>
                <CardContent className="p-4 text-center">
                    <p className="font-bold text-primary">4.9 ⭐ • 500+ clientes satisfeitos</p>
                </CardContent>
            </Card>

            <Separator />

            <div className="space-y-4">
                <h2 className="text-xl font-semibold">1. Escolha a Data</h2>
                <div className="grid grid-cols-4 gap-2">
                    {nextDays.map(day => (
                        <Button
                            key={day.toString()}
                            variant={booking.date?.toDateString() === day.toDateString() ? 'default' : 'outline'}
                            className="flex flex-col h-auto p-2"
                            onClick={() => handleDateSelect(day)}
                        >
                            <span className="text-xs capitalize">{format(day, 'EEE', { locale: ptBR })}</span>
                            <span className="font-bold text-lg">{format(day, 'dd')}</span>
                        </Button>
                    ))}
                     <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="flex flex-col h-auto p-2">
                                <CalendarIcon className="h-5 w-5" />
                                <span className="text-xs mt-1">Outra</span>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={booking.date || undefined}
                                onSelect={handleDateSelect}
                                initialFocus
                                locale={ptBR}
                                disabled={(date) => date < new Date() || date > addDays(new Date(), 60)}
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-xl font-semibold">2. Escolha o Barbeiro</h2>
                <div className="space-y-4">
                    {barbers.map(barber => (
                        <Card 
                            key={barber.id} 
                            className="overflow-hidden hover:bg-card/80 cursor-pointer"
                            onClick={() => handleBarberSelect(barber)}
                        >
                            <div className="flex items-center p-4 gap-4">
                                <Avatar className="h-16 w-16">
                                    <AvatarImage src={barber.avatar_url} alt={barber.name} />
                                    <AvatarFallback>{barber.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="space-y-1">
                                    <p className="font-bold text-lg">{barber.name}</p>
                                    <p className="text-sm text-muted-foreground">{barber.specialty}</p>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>

            <footer className="text-center text-muted-foreground text-sm space-y-1 pt-4">
                <p className="font-semibold">Horário de Funcionamento</p>
                <p>Segunda a Sábado, {settings?.opening_time} - {settings?.closing_time}</p>
            </footer>
        </div>
    );
};

export default HomePage;
