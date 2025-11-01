// This is a placeholder for the "My Appointments" screen.
// In a real app, this would fetch appointments based on user identity (e.g., phone number stored in localStorage).

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppContext } from "@/contexts/AppContext";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const MyAppointmentsPage = () => {
    const { appointments, barbers, services, cancelAppointment } = useAppContext();
    const { toast } = useToast();

    // Filter for a specific client for demonstration.
    const clientAppointments = appointments.filter(a => a.clientName === 'João Silva' && a.status === 'scheduled');

    const handleCancel = async (id: string) => {
        await cancelAppointment(id);
        toast({
            title: "Agendamento Cancelado",
            description: "Seu horário foi cancelado com sucesso.",
        });
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-center">Meus Agendamentos</h1>
            {clientAppointments.length === 0 ? (
                <p className="text-center text-muted-foreground">Você não tem agendamentos futuros.</p>
            ) : (
                <div className="space-y-4">
                    {clientAppointments.map(appt => {
                        const barber = barbers.find(b => b.id === appt.barberId);
                        const apptServices = services.filter(s => appt.serviceIds.includes(s.id));
                        const totalPrice = apptServices.reduce((acc, s) => acc + s.price, 0);

                        return (
                            <Card key={appt.id}>
                                <CardHeader>
                                    <CardTitle>
                                        {format(appt.date, "eeee, dd 'de' MMMM", { locale: ptBR })}
                                    </CardTitle>
                                    <p className="text-lg font-bold text-primary">{format(appt.date, "HH:mm")}</p>
                                </CardHeader>
                                <CardContent className="text-sm space-y-2">
                                    <p><strong>Barbeiro:</strong> {barber?.name}</p>
                                    <p><strong>Serviços:</strong> {apptServices.map(s => s.name).join(', ')}</p>
                                    <p><strong>Total:</strong> R$ {totalPrice.toFixed(2)}</p>
                                </CardContent>
                                <CardFooter>
                                    <Button variant="destructive" className="w-full" onClick={() => handleCancel(appt.id)}>
                                        ❌ Cancelar Agendamento
                                    </Button>
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default MyAppointmentsPage;
