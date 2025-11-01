import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppContext } from "@/contexts/AppContext";
import { useToast } from "@/components/ui/use-toast";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

const TodayPage = () => {
    const { appointments, barbers, isLoading, cancelAppointment } = useAppContext();
    const { toast } = useToast();
    
    const today = new Date();
    const todayAppointments = appointments
        .filter(a => new Date(a.date).toDateString() === today.toDateString() && a.status === 'scheduled')
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const handleCancel = async (id: string) => {
        await cancelAppointment(id);
        toast({ title: "Agendamento Cancelado" });
    };

    const handleComplete = (id: string) => {
        // In a real app, this would update the appointment status to 'completed'
        console.log("Completing appointment:", id);
        toast({ variant: "success", title: "Agendamento Concluído!" });
    };

    if (isLoading) {
        return <p>Carregando agendamentos...</p>
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Agendamentos de Hoje</h1>
            <p className="text-muted-foreground">{format(today, "eeee, dd 'de' MMMM", { locale: ptBR })}</p>
            {todayAppointments.length === 0 ? (
                <p className="text-center text-muted-foreground pt-10">Nenhum agendamento para hoje.</p>
            ) : (
                <div className="space-y-4">
                    {todayAppointments.map(appt => {
                        const barber = barbers.find(b => b.id === appt.barber_id);
                        
                        return (
                            <Card key={appt.id}>
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle>{appt.client_name}</CardTitle>
                                            <p className="text-sm text-muted-foreground">{appt.client_phone}</p>
                                        </div>
                                        <p className="text-lg font-bold text-primary">{format(parseISO(appt.date), "HH:mm")}</p>
                                    </div>
                                </CardHeader>
                                <CardContent className="text-sm space-y-2">
                                    <p><strong>Barbeiro:</strong> {barber?.name}</p>
                                    <p><strong>Serviços:</strong> {appt.services.map(s => s.name).join(', ')}</p>
                                    <p><strong>Total:</strong> R$ {appt.total_price.toFixed(2)}</p>
                                </CardContent>
                                <CardFooter className="grid grid-cols-2 gap-2">
                                    <Button variant="outline" size="sm" onClick={() => handleCancel(appt.id)}>❌ Cancelar</Button>
                                    <Button variant="success" size="sm" onClick={() => handleComplete(appt.id)}>✓ Concluir</Button>
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default TodayPage;
