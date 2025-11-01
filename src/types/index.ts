// Corresponds to the database schema
export interface Barber {
    id: string;
    name: string;
    specialty: string;
    avatar_url: string;
    working_hours: {
        day: string;
        start: string;
        end: string;
    }[];
}

export interface Service {
    id: string;
    name:string;
    description: string;
    price: number;
    duration: number; // in minutes
    image_url: string;
}

// This represents a fully populated appointment for use in the UI
export interface Appointment {
    id: string;
    barber_id: string;
    client_name: string;
    client_phone: string;
    date: string; // ISO 8601 string format
    status: 'scheduled' | 'completed' | 'canceled';
    services: Service[];
    total_price: number;
    total_duration: number;
}

// This represents the structure in the 'appointments' table
export interface DbAppointment {
    id: string;
    barber_id: string;
    client_name: string;
    client_phone: string;
    date: string;
    status: 'scheduled' | 'completed' | 'canceled';
    total_price: number;
    total_duration: number;
}

export interface ShopSettings {
    id: number;
    name: string;
    logo_url: string;
    open_days: string[];
    opening_time: string;
    closing_time: string;
}
