const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Configuración de Seguridad
app.use(cors());
app.use(express.json());

// --- DATOS INSTITUCIONALES AXIOMA ---
app.get('/api/v1/market-data', (req, res) => {
    res.json({
        precision: "99.4%", 
        agents: "150+",
        optimization: "32%",
        latency: "12ms",
        firm: "Axioma Ventures Intelligence"
    });
});

// --- RUTAS DE AUTENTICACIÓN ---
app.post('/api/auth/login', (req, res) => {
    res.json({ success: true, token: 'avi_token_secure_2026' });
});

app.post('/api/auth/register', (req, res) => {
    res.status(201).json({ success: true });
});

// --- ARRANQUE DEL SERVIDOR ---
app.listen(PORT, '0.0.0.0', () => {
    console.log('=========================================');
    console.log('🚀 SERVIDOR AXIOMA: ESTADO OPERATIVO');
    console.log(`📡 PUERTO: ${PORT}`);
    console.log('=========================================');
    console.log('La terminal debe permanecer bloqueada aquí.');
});