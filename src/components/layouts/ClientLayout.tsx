import { Outlet } from 'react-router-dom';

const ClientLayout = () => {
    return (
        <div className="max-w-2xl mx-auto p-4">
            {/* Can add a global header for clients here if needed */}
            <Outlet />
        </div>
    );
};

export default ClientLayout;
