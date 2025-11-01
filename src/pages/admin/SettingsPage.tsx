import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useAppContext } from "@/contexts/AppContext";
import { Barber, Service, ShopSettings } from "@/types";
import { useNavigate } from "react-router-dom";
import { Pencil, PlusCircle, Trash2 } from "lucide-react";

const ServiceForm = ({ service, onSave, closeDialog }: { service?: Service | null, onSave: (data: any) => void, closeDialog: () => void }) => {
    const [formData, setFormData] = useState({
        name: service?.name || '',
        description: service?.description || '',
        price: service?.price || 0,
        duration: service?.duration || 0,
        image_url: service?.image_url || '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value) || 0 : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">Nome do Serviço</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Input id="description" name="description" value={formData.description} onChange={handleChange} />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="price">Preço (R$)</Label>
                    <Input id="price" name="price" type="number" value={formData.price} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="duration">Duração (min)</Label>
                    <Input id="duration" name="duration" type="number" value={formData.duration} onChange={handleChange} required />
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="image_url">URL da Imagem</Label>
                <Input id="image_url" name="image_url" value={formData.image_url} onChange={handleChange} placeholder="https://..." />
            </div>
            <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={closeDialog}>Cancelar</Button>
                <Button type="submit">Salvar</Button>
            </div>
        </form>
    );
};

const BarberForm = ({ barber, onSave, closeDialog }: { barber?: Barber | null, onSave: (data: any) => void, closeDialog: () => void }) => {
    const [formData, setFormData] = useState({
        name: barber?.name || '',
        specialty: barber?.specialty || '',
        avatar_url: barber?.avatar_url || '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({...formData, working_hours: barber?.working_hours || []});
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">Nome do Barbeiro</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="specialty">Especialidade</Label>
                <Input id="specialty" name="specialty" value={formData.specialty} onChange={handleChange} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="avatar_url">URL da Foto</Label>
                <Input id="avatar_url" name="avatar_url" value={formData.avatar_url} onChange={handleChange} placeholder="https://..." />
            </div>
            <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={closeDialog}>Cancelar</Button>
                <Button type="submit">Salvar</Button>
            </div>
        </form>
    );
};


const SettingsPage = () => {
    const { logout } = useAuth();
    const { services, barbers, settings, addService, updateService, deleteService, addBarber, updateBarber, deleteBarber, updateSettings, isLoading } = useAppContext();
    const navigate = useNavigate();

    const [dialogOpen, setDialogOpen] = useState(false);
    const [currentService, setCurrentService] = useState<Service | null>(null);
    const [currentBarber, setCurrentBarber] = useState<Barber | null>(null);
    const [dialogType, setDialogType] = useState<'service' | 'barber' | null>(null);
    const [generalSettings, setGeneralSettings] = useState<Partial<ShopSettings>>({});

    useEffect(() => {
        if (settings) {
            setGeneralSettings(settings);
        }
    }, [settings]);

    const handleLogout = async () => {
        await logout();
        navigate('/admin/login');
    };

    const openServiceDialog = (service: Service | null = null) => {
        setCurrentService(service);
        setDialogType('service');
        setDialogOpen(true);
    };

    const openBarberDialog = (barber: Barber | null = null) => {
        setCurrentBarber(barber);
        setDialogType('barber');
        setDialogOpen(true);
    };

    const closeDialog = () => {
        setDialogOpen(false);
        setCurrentService(null);
        setCurrentBarber(null);
        setDialogType(null);
    };

    const handleSaveService = (data: Omit<Service, 'id'> | Service) => {
        if (currentService && 'id' in currentService) {
            updateService({ ...data, id: currentService.id } as Service);
        } else {
            addService(data as Omit<Service, 'id'>);
        }
        closeDialog();
    };
    
    const handleSaveBarber = (data: Omit<Barber, 'id'> | Barber) => {
        if (currentBarber && 'id' in currentBarber) {
            updateBarber({ ...data, id: currentBarber.id } as Barber);
        } else {
            addBarber(data as Omit<Barber, 'id'>);
        }
        closeDialog();
    };

    const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setGeneralSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveSettings = () => {
        updateSettings(generalSettings);
    };

    if (isLoading || !settings) {
        return <p>Carregando configurações...</p>
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Painel Admin</h1>
                <Button variant="destructive" onClick={handleLogout}>Sair</Button>
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {dialogType === 'service' ? (currentService ? 'Editar Serviço' : 'Novo Serviço') : ''}
                            {dialogType === 'barber' ? (currentBarber ? 'Editar Barbeiro' : 'Novo Barbeiro') : ''}
                        </DialogTitle>
                    </DialogHeader>
                    {dialogType === 'service' && <ServiceForm service={currentService} onSave={handleSaveService} closeDialog={closeDialog} />}
                    {dialogType === 'barber' && <BarberForm barber={currentBarber} onSave={handleSaveBarber} closeDialog={closeDialog} />}
                </DialogContent>
            </Dialog>

            <Tabs defaultValue="services" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="services">Serviços</TabsTrigger>
                    <TabsTrigger value="barbers">Barbeiros</TabsTrigger>
                    <TabsTrigger value="general">Geral</TabsTrigger>
                </TabsList>

                <TabsContent value="services" className="mt-4 space-y-4">
                    <Button onClick={() => openServiceDialog()}><PlusCircle className="mr-2 h-4 w-4" /> Novo Serviço</Button>
                    <Card>
                        <CardContent className="p-4 space-y-3">
                            {services.map(service => (
                                <div key={service.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                                    <div>
                                        <p className="font-semibold">{service.name}</p>
                                        <p className="text-sm text-muted-foreground">R$ {service.price.toFixed(2)} - {service.duration} min</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="icon" onClick={() => openServiceDialog(service)}><Pencil className="h-4 w-4" /></Button>
                                        <Button variant="ghost" size="icon" onClick={() => deleteService(service.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="barbers" className="mt-4 space-y-4">
                    <Button onClick={() => openBarberDialog()}><PlusCircle className="mr-2 h-4 w-4" /> Novo Barbeiro</Button>
                    <Card>
                        <CardContent className="p-4 space-y-3">
                            {barbers.map(barber => (
                                <div key={barber.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                                    <div>
                                        <p className="font-semibold">{barber.name}</p>
                                        <p className="text-sm text-muted-foreground">{barber.specialty}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="icon" onClick={() => openBarberDialog(barber)}><Pencil className="h-4 w-4" /></Button>
                                        <Button variant="ghost" size="icon" onClick={() => deleteBarber(barber.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="general" className="mt-4">
                    <Card>
                        <CardHeader><CardTitle>Configurações Gerais</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                             <div className="space-y-2">
                                <Label htmlFor="name">Nome da Barbearia</Label>
                                <Input id="name" name="name" value={generalSettings.name} onChange={handleSettingsChange} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="opening_time">Horário de Abertura</Label>
                                    <Input id="opening_time" name="opening_time" type="time" value={generalSettings.opening_time} onChange={handleSettingsChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="closing_time">Horário de Fechamento</Label>
                                    <Input id="closing_time" name="closing_time" type="time" value={generalSettings.closing_time} onChange={handleSettingsChange} />
                                </div>
                            </div>
                             <div className="space-y-2">
                                <Label>Dias de Funcionamento</Label>
                                <p className="text-sm text-muted-foreground">{generalSettings.open_days?.join(', ')}</p>
                            </div>
                            <Button onClick={handleSaveSettings}>Salvar Configurações</Button>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default SettingsPage;
