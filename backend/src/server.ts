/**
 * server.ts — Entrada do servidor Express
 * Configura CORS, JSON parsing e registra as rotas.
 * Verifica conexão com MySQL antes de iniciar.
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { query } from './database';
import authRoutes from './routes/auth';
import rotasRoutes from './routes/rotas';
import presencaRoutes from './routes/presenca';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/rotas', rotasRoutes);
app.use('/api/presenca', presencaRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

async function start() {
  try {
    await query('SELECT 1');
    console.log('MySQL conectado!');
  } catch (err: any) {
    console.error('Erro ao conectar no MySQL:', err.message);
    console.log('Certifique-se de que o MySQL está rodando.');
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
    console.log(`Endpoints:`);
    console.log(`  POST /api/auth/login`);
    console.log(`  POST /api/auth/register`);
    console.log(`  GET  /api/rotas/hoje`);
    console.log(`  POST /api/presenca/confirmar`);
    console.log(`  POST /api/presenca/cancelar`);
    console.log(`  POST /api/presenca/marcar`);
  });
}

start();
