import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/client/HomePage';
import ServicesPage from './pages/client/ServicesPage';
import TimeSlotsPage from './pages/client/TimeSlotsPage';
import ConfirmationPage from './pages/client/ConfirmationPage';
import MyAppointmentsPage from './pages/client/MyAppointmentsPage';
import LoginPage from './pages/admin/LoginPage';
import AdminLayout from './components/layouts/AdminLayout';
import TodayPage from './pages/admin/TodayPage';
import CalendarPage from './pages/admin/CalendarPage';
import AnalyticsPage from './pages/admin/AnalyticsPage';
import SettingsPage from './pages/admin/SettingsPage';
import ProtectedRoute from './components/ProtectedRoute';
import ClientLayout from './components/layouts/ClientLayout';

export function AppRouterProvider() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Client Flow */}
                <Route path="/" element={<ClientLayout />}>
                    <Route index element={<HomePage />} />
                    <Route path="servicos" element={<ServicesPage />} />
                    <Route path="horarios" element={<TimeSlotsPage />} />
                    <Route path="confirmar" element={<ConfirmationPage />} />
                    <Route path="meus-agendamentos" element={<MyAppointmentsPage />} />
                </Route>

                {/* Admin Flow */}
                <Route path="/admin/login" element={<LoginPage />} />
                <Route path="/admin" element={
                    <ProtectedRoute>
                        <AdminLayout />
                    </ProtectedRoute>
                }>
                    <Route index element={<Navigate to="hoje" replace />} />
                    <Route path="hoje" element={<TodayPage />} />
                    <Route path="calendario" element={<CalendarPage />} />
                    <Route path="analytics" element={<AnalyticsPage />} />
                    <Route path="configuracoes" element={<SettingsPage />} />
                </Route>

                {/* Redirect root to home */}
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </BrowserRouter>
    );
}
