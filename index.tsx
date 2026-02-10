
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

console.log("🚀 Samba Brasil App inicializando...");

// Lógica de redirecionamento para caminhos amigáveis (Ex: /sambabrasil -> /#/sambabrasil)
// Isso ajuda quando o servidor está configurado para servir o index.html em subdiretórios
const handlePathRedirect = () => {
  const path = window.location.pathname;
  if (path !== '/' && path !== '/index.html' && !window.location.hash) {
    console.log(`🔄 Redirecionando path "${path}" para o sistema de rotas interno...`);
    // Preserva o path original dentro do hash para o HashRouter processar
    window.location.replace(`${window.location.origin}/#${path}`);
  }
};

handlePathRedirect();

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error("❌ Elemento root não encontrado no DOM!");
} else {
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("✅ App montado com sucesso.");
  } catch (error) {
    console.error("💥 Erro crítico ao montar aplicação:", error);
    rootElement.innerHTML = `
      <div style="padding: 40px; text-align: center; font-family: sans-serif;">
        <h1 style="color: #1e3a8a;">Samba Brasil</h1>
        <p style="color: #ef4444;">Erro ao carregar a página.</p>
        <code style="display: block; background: #f3f4f6; padding: 10px; margin-top: 20px; border-radius: 8px; text-align: left; font-size: 12px;">
          ${error instanceof Error ? error.message : String(error)}
        </code>
        <button onclick="window.location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #1e3a8a; color: white; border: none; border-radius: 8px; cursor: pointer;">
          Tentar Novamente
        </button>
      </div>
    `;
  }
}
