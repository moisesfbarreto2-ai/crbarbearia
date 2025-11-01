import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAppContext } from "@/contexts/AppContext";

const AnalyticsPage = () => {
    const { appointments, barbers } = useAppContext();

    // Dummy data for charts - in a real app, this would be calculated from all appointments
    const revenueData = [
        { name: 'Jan', Receita: 4000 },
        { name: 'Fev', Receita: 3000 },
        { name: 'Mar', Receita: 5000 },
        { name: 'Abr', Receita: 4500 },
        { name: 'Mai', Receita: 6000 },
    ];

    const completed = appointments.filter(a => a.status === 'completed').length;
    const canceled = appointments.filter(a => a.status === 'canceled').length;
    const totalRevenue = 1250.50; // Dummy value

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Analytics & Relatórios</h1>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader><CardTitle className="text-sm font-medium">Total Agendado</CardTitle></CardHeader>
                    <CardContent><p className="text-2xl font-bold">{appointments.length}</p></CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle className="text-sm font-medium">Concluídos</CardTitle></CardHeader>
                    <CardContent><p className="text-2xl font-bold text-success">{completed}</p></CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle className="text-sm font-medium">Cancelados</CardTitle></CardHeader>
                    <CardContent><p className="text-2xl font-bold text-destructive">{canceled}</p></CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle className="text-sm font-medium">Receita Total</CardTitle></CardHeader>
                    <CardContent><p className="text-2xl font-bold">R$ {totalRevenue.toFixed(2)}</p></CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader><CardTitle>Performance por Barbeiro</CardTitle></CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-4">
                    {barbers.map(barber => (
                        <div key={barber.id} className="p-4 border rounded-lg">
                            <h3 className="font-semibold">{barber.name}</h3>
                            <p className="text-muted-foreground text-sm">Cortes: 42 | Receita: R$ 550,00</p>
                        </div>
                    ))}
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle>Receita Mensal</CardTitle></CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={revenueData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                            <YAxis stroke="hsl(var(--muted-foreground))" />
                            <Tooltip cursor={{fill: 'hsl(var(--muted))'}} contentStyle={{backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))'}} />
                            <Legend />
                            <Bar dataKey="Receita" fill="hsl(var(--primary))" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
};

export default AnalyticsPage;
