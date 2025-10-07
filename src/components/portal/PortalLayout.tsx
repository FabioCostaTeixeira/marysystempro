import React from 'react';
import { Outlet } from 'react-router-dom';

const PortalLayout: React.FC = () => {
  return (
    <div>
      {/* Aqui você pode adicionar um layout comum, como cabeçalho e menu lateral */}
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default PortalLayout;
