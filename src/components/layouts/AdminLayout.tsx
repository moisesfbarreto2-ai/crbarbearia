import { NavLink, Outlet } from 'react-router-dom';
import { Home, Calendar, BarChart2, Settings, User } from 'lucide-react';

const AdminLayout = () => {
    const navItems = [
        { to: '/admin/hoje', icon: Home, label: 'Hoje' },
        { to: '/admin/calendario', icon: Calendar, label: 'Agenda' },
        { to: '/admin/analytics', icon: BarChart2, label: 'Analytics' },
        { to: '/admin/configuracoes', icon: Settings, label: 'Admin' },
    ];

    return (
        <div className="flex flex-col h-screen">
            <main className="flex-1 overflow-y-auto p-4 pb-20">
                <Outlet />
            </main>
            <footer className="fixed bottom-0 left-0 right-0 bg-card border-t border-border">
                <nav className="flex justify-around max-w-2xl mx-auto">
                    {navItems.map(item => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                `flex flex-col items-center justify-center w-full py-2 text-xs ${
                                    isActive ? 'text-primary' : 'text-muted-foreground'
                                }`
                            }
                        >
                            <item.icon className="h-5 w-5 mb-1" />
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>
            </footer>
        </div>
    );
};

export default AdminLayout;
