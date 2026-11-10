import React from 'react';
import { LogisticsProvider } from './context/LogisticsContext';
import { useLogistics } from './context/useLogistics';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { PipelineView } from './components/views/PipelineView';
import { PedidosView } from './components/views/PedidosView';
import { FlotaView } from './components/views/FlotaView';
import { RutasView } from './components/views/RutasView';
import { DespachosView } from './components/views/DespachosView';
import { AdminView } from './components/views/AdminView';

const MainLayout: React.FC = () => {
  const { vistaActiva } = useLogistics();

  const renderVista = () => {
    switch (vistaActiva) {
      case 'pipeline':
        return <PipelineView />;
      case 'pedidos':
        return <PedidosView />;
      case 'flota':
        return <FlotaView />;
      case 'rutas':
        return <RutasView />;
      case 'despachos':
        return <DespachosView />;
      case 'admin':
        return <AdminView />;
      default:
        return <PipelineView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8faf9] flex font-sans text-[#1b171a] antialiased selection:bg-[#c4e7d4] selection:text-[#181417]">
      {/* Sidebar fijo a la izquierda */}
      <Sidebar />

      {/* Area de Trabajo Principal */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />

        <main className="flex-1 p-8 max-w-7xl w-full mx-auto">
          {renderVista()}
        </main>

        <footer className="px-8 py-4 border-t border-[rgba(99,88,94,0.1)] text-center text-xs text-[#7d737a] bg-white">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto">
            <span>
              Kira Logistic CRM — Distribuidora Kiramar S.A.S.
            </span>
            <span className="font-mono text-[11px] text-[#998da0]">
              Version de Produccion v1.0.0-kiramar • Arquitectura React 19 + TypeScript
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export function App() {
  return (
    <LogisticsProvider>
      <MainLayout />
    </LogisticsProvider>
  );
}

export default App;
