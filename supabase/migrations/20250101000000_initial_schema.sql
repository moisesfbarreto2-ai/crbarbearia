/*
# [Initial Schema Setup]
This script creates the complete initial database schema for the CR Barbershop application.

## Query Description: This operation is safe to run on a new project. It will create all necessary tables, define relationships, establish security policies (RLS), and seed the database with initial data for barbers and services. This will make the application functional immediately after the migration. There is no risk to existing data as this is the first migration.

## Metadata:
- Schema-Category: ["Structural", "Data"]
- Impact-Level: ["Low"]
- Requires-Backup: false
- Reversible: true

## Structure Details:
- Tables Created: shop_settings, barbers, services, appointments, appointment_services
- RLS Policies: Enabled on all tables to ensure data security. Public read access for general data, anonymous insert for bookings, and authenticated admin access for management.

## Security Implications:
- RLS Status: Enabled
- Policy Changes: Yes (initial policies are created)
- Auth Requirements: Defines policies for anonymous and authenticated users.

## Performance Impact:
- Indexes: Primary keys are indexed automatically. Foreign keys are also indexed.
- Triggers: None
- Estimated Impact: Low. Initial setup script.
*/

-- 1. Create Tables

CREATE TABLE public.shop_settings (
  id smallint PRIMARY KEY DEFAULT 1,
  name text NOT NULL,
  logo_url text,
  open_days text[] NOT NULL,
  opening_time time without time zone NOT NULL,
  closing_time time without time zone NOT NULL,
  CONSTRAINT singleton_check CHECK (id = 1)
);

CREATE TABLE public.barbers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  specialty text,
  avatar_url text,
  working_hours jsonb,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price numeric(10, 2) NOT NULL,
  duration integer NOT NULL, -- in minutes
  image_url text,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  barber_id uuid NOT NULL REFERENCES public.barbers(id),
  client_name text NOT NULL,
  client_phone text NOT NULL,
  date timestamp with time zone NOT NULL,
  status text NOT NULL DEFAULT 'scheduled'::text, -- 'scheduled', 'completed', 'canceled'
  total_price numeric(10, 2) NOT NULL,
  total_duration integer NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.appointment_services (
  appointment_id uuid NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  service_id uuid NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  PRIMARY KEY (appointment_id, service_id)
);

-- 2. Enable Row Level Security

ALTER TABLE public.shop_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_services ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies

-- shop_settings: Public can read, admins can update.
CREATE POLICY "Allow public read access to settings" ON public.shop_settings FOR SELECT USING (true);
CREATE POLICY "Allow admin update access to settings" ON public.shop_settings FOR UPDATE USING (auth.role() = 'authenticated');

-- barbers: Public can read, admins have full access.
CREATE POLICY "Allow public read access to barbers" ON public.barbers FOR SELECT USING (true);
CREATE POLICY "Allow admin full access to barbers" ON public.barbers FOR ALL USING (auth.role() = 'authenticated');

-- services: Public can read, admins have full access.
CREATE POLICY "Allow public read access to services" ON public.services FOR SELECT USING (true);
CREATE POLICY "Allow admin full access to services" ON public.services FOR ALL USING (auth.role() = 'authenticated');

-- appointments: Anyone can create, but only admins can see/manage all.
CREATE POLICY "Allow anonymous users to create appointments" ON public.appointments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow admin full access to appointments" ON public.appointments FOR ALL USING (auth.role() = 'authenticated');

-- appointment_services: Anyone can create, but only admins can see/manage all.
CREATE POLICY "Allow anonymous users to create appointment services" ON public.appointment_services FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow admin full access to appointment services" ON public.appointment_services FOR ALL USING (auth.role() = 'authenticated');


-- 4. Seed Initial Data

/*
# [Seed Initial Data]
This script populates the database with default data.

## Query Description: This operation inserts the initial data for the barbershop settings, barbers, and services. This allows the application to be fully functional with pre-existing content right after setup. This is safe and does not overwrite any data.

## Metadata:
- Schema-Category: ["Data"]
- Impact-Level: ["Low"]
- Requires-Backup: false
- Reversible: true
*/

-- Insert default shop settings
INSERT INTO public.shop_settings (id, name, open_days, opening_time, closing_time)
VALUES (1, 'CR Barbershop', ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], '08:00:00', '18:00:00');

-- Insert barbers
INSERT INTO public.barbers (name, specialty, avatar_url, working_hours)
VALUES
  ('Cristiano', 'Fades & Cortes Modernos', 'https://i.pravatar.cc/150?u=cristiano', '[{"day": "Monday", "end": "18:00", "start": "08:00"}, {"day": "Tuesday", "end": "18:00", "start": "08:00"}, {"day": "Wednesday", "end": "18:00", "start": "08:00"}, {"day": "Thursday", "end": "18:00", "start": "08:00"}, {"day": "Friday", "end": "18:00", "start": "08:00"}, {"day": "Saturday", "end": "16:00", "start": "09:00"}]'),
  ('Josué', 'Estilos Clássicos & Barba', 'https://i.pravatar.cc/150?u=josue', '[{"day": "Tuesday", "end": "18:00", "start": "08:00"}, {"day": "Wednesday", "end": "18:00", "start": "08:00"}, {"day": "Thursday", "end": "18:00", "start": "08:00"}, {"day": "Friday", "end": "18:00", "start": "08:00"}, {"day": "Saturday", "end": "16:00", "start": "09:00"}]');

-- Insert services
INSERT INTO public.services (name, description, price, duration, image_url)
VALUES
  ('Corte de Cabelo', 'Corte moderno com tesoura e máquina.', 35.00, 40, 'https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://placehold.co/100x100/1C1C1E/F7C04A?text=Corte'),
  ('Barba', 'Modelagem de barba com toalha quente.', 25.00, 30, 'https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://placehold.co/100x100/1C1C1E/F7C04A?text=Barba'),
  ('Corte & Barba', 'Pacote completo para um visual impecável.', 55.00, 70, 'https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://placehold.co/100x100/1C1C1E/F7C04A?text=Combo'),
  ('Pezinho', 'Acabamento e alinhamento do corte.', 15.00, 15, 'https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://placehold.co/100x100/1C1C1E/F7C04A?text=Pezinho');
