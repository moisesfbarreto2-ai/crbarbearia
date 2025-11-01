import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { ptBR } from 'date-fns/locale';

const CalendarPage = () => {
    const [date, setDate] = useState<Date | undefined>(new Date());

    // This page is a placeholder for the full calendar management view.
    // Clicking on empty/busy slots would open a Dialog for management actions.

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Gerenciar Agendamentos</h1>
            <Card>
                <CardContent className="p-2">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        className="rounded-md"
                        locale={ptBR}
                    />
                </CardContent>
            </Card>
            <div className="text-center text-muted-foreground">
                <p>Visualização de agendamentos do dia {date ? date.toLocaleDateString('pt-BR') : ''}.</p>
                <p className="text-xs mt-2">(Funcionalidades de adicionar/editar em desenvolvimento)</p>
            </div>
        </div>
    );
};

export default CalendarPage;
