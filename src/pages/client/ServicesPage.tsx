import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Service } from '@/types';
import { ArrowLeft } from 'lucide-react';

const ServicesPage = () => {
    const navigate = useNavigate();
    const { services, booking, setBookingServices, isLoading } = useAppContext();
    const [selectedServices, setSelectedServices] = useState<Service[]>(booking.services);

    useEffect(() => {
        if (!isLoading && (!booking.barber || !booking.date)) {
            navigate('/');
        }
    }, [booking, navigate, isLoading]);

    const handleServiceToggle = (service: Service) => {
        setSelectedServices(prev => {
            const isSelected = prev.some(s => s.id === service.id);
            if (isSelected) {
                return prev.filter(s => s.id !== service.id);
            } else {
                return [...prev, service];
            }
        });
    };

    const handleContinue = () => {
        setBookingServices(selectedServices);
        navigate('/horarios');
    };

    const totalDuration = selectedServices.reduce((acc, s) => acc + s.duration, 0);
    const totalPrice = selectedServices.reduce((acc, s) => acc + s.price, 0);

    return (
        <div className="space-y-6">
            <header className="relative flex items-center justify-center">
                <Button variant="ghost" size="icon" className="absolute left-0" onClick={() => navigate('/')}>
                    <ArrowLeft />
                </Button>
                <h1 className="text-xl font-bold">Escolha os Serviços</h1>
            </header>

            <div className="space-y-4">
                {isLoading ? <p>Carregando serviços...</p> : services.map(service => (
                    <Card
                        key={service.id}
                        onClick={() => handleServiceToggle(service)}
                        className={`p-4 flex items-center gap-4 cursor-pointer transition-all ${selectedServices.some(s => s.id === service.id) ? 'border-primary ring-2 ring-primary' : 'border-border'}`}
                    >
                        <img src={service.image_url} alt={service.name} className="w-16 h-16 rounded-md object-cover" />
                        <div className="flex-1">
                            <p className="font-bold">{service.name}</p>
                            <p className="text-sm text-muted-foreground">{service.description}</p>
                            <div className="flex justify-between items-center mt-1 text-sm">
                                <span>{service.duration} min</span>
                                <span className="font-semibold">R$ {service.price.toFixed(2)}</span>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border">
                <div className="max-w-2xl mx-auto">
                    <div className="flex justify-between mb-2 text-sm">
                        <span>Total:</span>
                        <span className="font-bold">{totalDuration} min / R$ {totalPrice.toFixed(2)}</span>
                    </div>
                    <Button 
                        className="w-full" 
                        onClick={handleContinue}
                        disabled={selectedServices.length === 0}
                    >
                        Selecionar Horário
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ServicesPage;
