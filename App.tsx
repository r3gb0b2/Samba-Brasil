
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import AdminPanel from './pages/AdminPanel';

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        {/* Rota principal */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Rota solicitada para o evento */}
        <Route path="/sambabrasil" element={<LandingPage />} />
        
        {/* Rota administrativa */}
        <Route path="/admin" element={<AdminPanel />} />
        
        {/* Catch-all: qualquer outra rota volta para a Landing Page */}
        <Route path="*" element={<LandingPage />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
