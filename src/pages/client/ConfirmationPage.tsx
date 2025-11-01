import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ArrowLeft, User, Scissors, Clock, Calendar as CalendarIcon, Phone, UserCircle } from 'lucide-react';

import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

const ConfirmationPage = () => {
    const navigate = useNavigate();
    const { booking, addAppointment, resetBooking } = useAppContext();
    const { toast } = useToast();
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!booking.barber || !booking.date || !booking.time || booking.services.length === 0) {
            navigate('/');
        }
    }, [booking, navigate]);

    const handleConfirm = async () => {
        if (!name || !phone) {
            toast({
                variant: "destructive",
                title: "Erro",
                description: "Por favor, preencha seu nome e telefone.",
            });
            return;
        }
        
        setIsSubmitting(true);

        try {
            await addAppointment({
                clientName: name,
                clientPhone: phone,
            });

            toast({
                variant: "success",
                title: "Agendamento Confirmado!",
                description: `Seu horário com ${booking.barber?.name} foi marcado com sucesso.`,
            });
            
            resetBooking();
            navigate('/');

        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Erro ao confirmar",
                description: error.message || "Não foi possível confirmar seu agendamento. Tente novamente.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!booking.barber || !booking.date || !booking.time) return null;

    const totalDuration = booking.services.reduce((acc, s) => acc + s.duration, 0);
    const totalPrice = booking.services.reduce((acc, s) => acc + s.price, 0);

    return (
        <div className="space-y-6 pb-20">
            <header className="relative flex items-center justify-center">
                <Button variant="ghost" size="icon" className="absolute left-0" onClick={() => navigate('/horarios')}>
                    <ArrowLeft />
                </Button>
                <h1 className="text-xl font-bold">Confirme seu Agendamento</h1>
            </header>

            <Card>
                <CardHeader>
                    <CardTitle>Resumo do Agendamento</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <div className="flex items-center gap-3"><User className="w-4 h-4 text-primary" /> <strong>Barbeiro:</strong> {booking.barber.name}</div>
                    <div className="flex items-center gap-3"><CalendarIcon className="w-4 h-4 text-primary" /> <strong>Data:</strong> {format(booking.date, 'dd/MM/yyyy')} às {booking.time}</div>
                    <div className="flex items-start gap-3"><Scissors className="w-4 h-4 text-primary mt-1" /> <div><strong>Serviços:</strong><br /> {booking.services.map(s => s.name).join(', ')}</div></div>
                    <div className="flex items-center gap-3"><Clock className="w-4 h-4 text-primary" /> <strong>Total:</strong> {totalDuration} min / R$ {totalPrice.toFixed(2)}</div>
                </CardContent>
            </Card>

            <div className="space-y-4">
                <h2 className="text-lg font-semibold">Seus Dados</h2>
                <div className="space-y-2">
                    <Label htmlFor="name">Nome</Label>
                    <div className="relative">
                        <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input id="name" placeholder="Seu nome completo" value={name} onChange={(e) => setName(e.target.value)} className="pl-9" />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="phone">Telefone (WhatsApp)</Label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input id="phone" type="tel" placeholder="(XX) XXXXX-XXXX" value={phone} onChange={(e) => setPhone(e.target.value)} className="pl-9" />
                    </div>
                </div>
            </div>

            <Button className="w-full" onClick={handleConfirm} disabled={isSubmitting}>
                {isSubmitting ? 'Confirmando...' : 'Confirmar Agendamento'}
            </Button>
        </div>
    );
};

export default ConfirmationPage;
