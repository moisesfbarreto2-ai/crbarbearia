// This file simulates a database.
// In a real application, you would fetch this data from Supabase.

import { Barber, Service, Appointment, ShopSettings } from '@/types';
import { addDays, setHours, setMinutes } from 'date-fns';

export const mockBarbers: Barber[] = [
    {
        id: 'barber-1',
        name: 'Cristiano',
        specialty: 'Fades & Cortes Modernos',
        avatarUrl: 'https://i.pravatar.cc/150?u=cristiano',
        workingHours: [
            { day: 'Monday', start: '08:00', end: '18:00' },
            { day: 'Tuesday', start: '08:00', end: '18:00' },
            { day: 'Wednesday', start: '08:00', end: '18:00' },
            { day: 'Thursday', start: '08:00', end: '18:00' },
            { day: 'Friday', start: '08:00', end: '18:00' },
            { day: 'Saturday', start: '09:00', end: '16:00' },
        ],
    },
    {
        id: 'barber-2',
        name: 'Josué',
        specialty: 'Estilos Clássicos & Barba',
        avatarUrl: 'https://i.pravatar.cc/150?u=josue',
        workingHours: [
            { day: 'Tuesday', start: '08:00', end: '18:00' },
            { day: 'Wednesday', start: '08:00', end: '18:00' },
            { day: 'Thursday', start: '08:00', end: '18:00' },
            { day: 'Friday', start: '08:00', end: '18:00' },
            { day: 'Saturday', start: '09:00', end: '16:00' },
        ],
    },
];

export const mockServices: Service[] = [
    {
        id: 'service-1',
        name: 'Corte de Cabelo',
        description: 'Corte moderno com tesoura e máquina.',
        price: 35.00,
        duration: 40,
        imageUrl: 'https://img-wrapper.vercel.app/image?url=https://placehold.co/100x100/1C1C1E/F7C04A?text=Corte',
    },
    {
        id: 'service-2',
        name: 'Barba',
        description: 'Modelagem de barba com toalha quente.',
        price: 25.00,
        duration: 30,
        imageUrl: 'https://img-wrapper.vercel.app/image?url=https://placehold.co/100x100/1C1C1E/F7C04A?text=Barba',
    },
    {
        id: 'service-3',
        name: 'Corte & Barba',
        description: 'Pacote completo para um visual impecável.',
        price: 55.00,
        duration: 70,
        imageUrl: 'https://img-wrapper.vercel.app/image?url=https://placehold.co/100x100/1C1C1E/F7C04A?text=Combo',
    },
    {
        id: 'service-4',
        name: 'Pezinho',
        description: 'Acabamento e alinhamento do corte.',
        price: 15.00,
        duration: 15,
        imageUrl: 'https://img-wrapper.vercel.app/image?url=https://placehold.co/100x100/1C1C1E/F7C04A?text=Pezinho',
    },
];

const today = new Date();
export const mockAppointments: Appointment[] = [
    {
        id: 'appt-1',
        barberId: 'barber-1',
        serviceIds: ['service-1', 'service-2'],
        clientName: 'João Silva',
        clientPhone: '11987654321',
        date: setMinutes(setHours(today, 10), 0),
        status: 'scheduled',
    },
    {
        id: 'appt-2',
        barberId: 'barber-2',
        serviceIds: ['service-3'],
        clientName: 'Carlos Pereira',
        clientPhone: '21912345678',
        date: setMinutes(setHours(today, 14), 30),
        status: 'scheduled',
    },
    {
        id: 'appt-3',
        barberId: 'barber-1',
        serviceIds: ['service-1'],
        clientName: 'Pedro Martins',
        clientPhone: '31955554444',
        date: setMinutes(setHours(addDays(today, 1), 11), 0),
        status: 'scheduled',
    },
    // This appointment is to test the conflict logic
    {
        id: 'appt-conflict',
        barberId: 'barber-1',
        serviceIds: ['service-1'],
        clientName: 'Cliente Ocupado',
        clientPhone: '99999999999',
        date: setMinutes(setHours(addDays(today, 2), 9), 0),
        status: 'scheduled',
    }
];

export const mockShopSettings: ShopSettings = {
    name: 'CR Barbershop',
    logoUrl: '', // Will be set in admin panel
    openDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    openingTime: '08:00',
    closingTime: '18:00',
};
