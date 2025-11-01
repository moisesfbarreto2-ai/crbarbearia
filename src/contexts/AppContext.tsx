import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Barber, Service, Appointment, ShopSettings, DbAppointment } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { parseISO } from 'date-fns';

interface BookingState {
    barber: Barber | null;
    services: Service[];
    date: Date | null;
    time: string | null;
}

interface AppContextType {
    isLoading: boolean;
    barbers: Barber[];
    services: Service[];
    appointments: Appointment[];
    settings: ShopSettings | null;
    
    booking: BookingState;
    setBookingBarber: (barber: Barber) => void;
    setBookingServices: (services: Service[]) => void;
    setBookingDate: (date: Date) => void;
    setBookingTime: (time: string) => void;
    resetBooking: () => void;

    addAppointment: (appointmentData: { clientName: string, clientPhone: string }) => Promise<void>;
    cancelAppointment: (appointmentId: string) => Promise<void>;
    getAppointmentsByBarberAndDay: (barberId: string, date: Date) => Promise<DbAppointment[]>;

    addService: (service: Omit<Service, 'id'>) => Promise<void>;
    updateService: (service: Service) => Promise<void>;
    deleteService: (serviceId: string) => Promise<void>;
    addBarber: (barber: Omit<Barber, 'id'>) => Promise<void>;
    updateBarber: (barber: Barber) => Promise<void>;
    deleteBarber: (barberId: string) => Promise<void>;
    updateSettings: (newSettings: Partial<ShopSettings>) => Promise<void>;
    
    refetchData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const initialBookingState: BookingState = {
    barber: null,
    services: [],
    date: null,
    time: null,
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [barbers, setBarbers] = useState<Barber[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [settings, setSettings] = useState<ShopSettings | null>(null);
    const [booking, setBooking] = useState<BookingState>(initialBookingState);
    const { toast } = useToast();

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [settingsRes, servicesRes, barbersRes, appointmentsRes, appointmentServicesRes] = await Promise.all([
                supabase.from('shop_settings').select('*').single(),
                supabase.from('services').select('*'),
                supabase.from('barbers').select('*'),
                supabase.from('appointments').select('*'),
                supabase.from('appointment_services').select('*')
            ]);

            if (settingsRes.error) throw settingsRes.error;
            if (servicesRes.error) throw servicesRes.error;
            if (barbersRes.error) throw barbersRes.error;
            if (appointmentsRes.error) throw appointmentsRes.error;
            if (appointmentServicesRes.error) throw appointmentServicesRes.error;

            setSettings(settingsRes.data);
            setServices(servicesRes.data || []);
            setBarbers(barbersRes.data || []);

            // Combine appointments with their services
            const populatedAppointments = (appointmentsRes.data || []).map(appt => {
                const relatedServiceIds = (appointmentServicesRes.data || [])
                    .filter(link => link.appointment_id === appt.id)
                    .map(link => link.service_id);
                
                const relatedServices = (servicesRes.data || []).filter(service => relatedServiceIds.includes(service.id));

                return { ...appt, services: relatedServices };
            });
            setAppointments(populatedAppointments);

        } catch (error: any) {
            console.error("Error fetching data:", error);
            toast({ variant: 'destructive', title: 'Erro ao carregar dados', description: error.message });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const setBookingBarber = (barber: Barber) => setBooking(prev => ({ ...prev, barber }));
    const setBookingServices = (services: Service[]) => setBooking(prev => ({ ...prev, services }));
    const setBookingDate = (date: Date) => setBooking(prev => ({ ...prev, date, time: null }));
    const setBookingTime = (time: string) => setBooking(prev => ({ ...prev, time }));
    const resetBooking = () => setBooking(initialBookingState);

    const addAppointment = async (appointmentData: { clientName: string, clientPhone: string }): Promise<void> => {
        if (!booking.barber || !booking.date || !booking.time || booking.services.length === 0) {
            throw new Error("Informações de agendamento incompletas.");
        }
        
        const [hour, minute] = booking.time.split(':').map(Number);
        const appointmentDate = new Date(booking.date);
        appointmentDate.setHours(hour, minute);

        const total_duration = booking.services.reduce((sum, s) => sum + s.duration, 0);
        const total_price = booking.services.reduce((sum, s) => sum + s.price, 0);

        const { data: newAppointment, error: apptError } = await supabase
            .from('appointments')
            .insert({
                barber_id: booking.barber.id,
                client_name: appointmentData.clientName,
                client_phone: appointmentData.clientPhone,
                date: appointmentDate.toISOString(),
                status: 'scheduled',
                total_duration,
                total_price,
            })
            .select()
            .single();

        if (apptError) throw apptError;
        if (!newAppointment) throw new Error("Falha ao criar agendamento.");

        const appointmentServices = booking.services.map(service => ({
            appointment_id: newAppointment.id,
            service_id: service.id,
        }));

        const { error: servicesError } = await supabase.from('appointment_services').insert(appointmentServices);
        if (servicesError) throw servicesError;

        await fetchData(); // Refetch all data to update UI
    };

    const cancelAppointment = async (appointmentId: string): Promise<void> => {
        const { error } = await supabase
            .from('appointments')
            .update({ status: 'canceled' })
            .eq('id', appointmentId);
        if (error) throw error;
        await fetchData();
    };
    
    const getAppointmentsByBarberAndDay = async (barberId: string, date: Date): Promise<DbAppointment[]> => {
        const startDate = new Date(date.setHours(0, 0, 0, 0)).toISOString();
        const endDate = new Date(date.setHours(23, 59, 59, 999)).toISOString();

        const { data, error } = await supabase
            .from('appointments')
            .select('*')
            .eq('barber_id', barberId)
            .eq('status', 'scheduled')
            .gte('date', startDate)
            .lte('date', endDate);
        
        if (error) throw error;
        return data || [];
    };

    const addService = async (serviceData: Omit<Service, 'id'>) => {
        const { error } = await supabase.from('services').insert(serviceData);
        if (error) throw error;
        await fetchData();
        toast({ variant: "success", title: "Serviço Adicionado!" });
    };

    const updateService = async (updatedService: Service) => {
        const { error } = await supabase.from('services').update(updatedService).eq('id', updatedService.id);
        if (error) throw error;
        await fetchData();
        toast({ variant: "success", title: "Serviço Atualizado!" });
    };

    const deleteService = async (serviceId: string) => {
        const { error } = await supabase.from('services').delete().eq('id', serviceId);
        if (error) throw error;
        await fetchData();
        toast({ variant: "destructive", title: "Serviço Excluído!" });
    };

    const addBarber = async (barberData: Omit<Barber, 'id'>) => {
        const { error } = await supabase.from('barbers').insert(barberData);
        if (error) throw error;
        await fetchData();
        toast({ variant: "success", title: "Barbeiro Adicionado!" });
    };

    const updateBarber = async (updatedBarber: Barber) => {
        const { error } = await supabase.from('barbers').update(updatedBarber).eq('id', updatedBarber.id);
        if (error) throw error;
        await fetchData();
        toast({ variant: "success", title: "Barbeiro Atualizado!" });
    };

    const deleteBarber = async (barberId: string) => {
        const { error } = await supabase.from('barbers').delete().eq('id', barberId);
        if (error) throw error;
        await fetchData();
        toast({ variant: "destructive", title: "Barbeiro Excluído!" });
    };
    
    const updateSettings = async (newSettings: Partial<ShopSettings>) => {
        if (!settings) return;
        const { error } = await supabase.from('shop_settings').update(newSettings).eq('id', settings.id);
        if (error) throw error;
        await fetchData();
        toast({ variant: "success", title: "Configurações Atualizadas!" });
    }

    const value = {
        isLoading,
        barbers,
        services,
        appointments,
        settings,
        booking,
        setBookingBarber,
        setBookingServices,
        setBookingDate,
        setBookingTime,
        resetBooking,
        addAppointment,
        cancelAppointment,
        getAppointmentsByBarberAndDay,
        addService,
        updateService,
        deleteService,
        addBarber,
        updateBarber,
        deleteBarber,
        updateSettings,
        refetchData: fetchData,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};
