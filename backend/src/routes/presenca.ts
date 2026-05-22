/**
 * presenca.ts — Gerenciamento de presença.
 *
 * POST /api/presenca/confirmar — Aluno confirma presença (ganha assento automático)
 * POST /api/presenca/cancelar  — Aluno cancela confirmação
 * POST /api/presenca/marcar    — Motorista marca presente/ausente
 */

import { Router, Request, Response } from 'express';
import { queryOne, execute } from '../database';

const router = Router();

// POST /api/presenca/confirmar
router.post('/confirmar', async (req: Request, res: Response) => {
  const { alunoId } = req.body;
  if (!alunoId) {
    res.status(400).json({ success: false, message: 'alunoId é obrigatório' });
    return;
  }

  const hoje = new Date().toISOString().split('T')[0];

  // Busca a rota que o aluno está vinculado
  const rota = await queryOne(
    "SELECT r.id FROM rotas r JOIN rota_alunos ra ON ra.rota_id = r.id WHERE ra.aluno_id = ? AND r.status != 'encerrada' LIMIT 1",
    [alunoId]
  );
  if (!rota) {
    res.json({ success: false, message: 'Nenhuma rota encontrada para este aluno' });
    return;
  }

  const jaConfirmou = await queryOne('SELECT id FROM presencas WHERE rota_id = ? AND aluno_id = ? AND data = ?', [rota.id, alunoId, hoje]);
  if (jaConfirmou) {
    res.json({ success: false, message: 'Presença já confirmada hoje' });
    return;
  }

  const total = await queryOne('SELECT COUNT(*) as total FROM presencas WHERE rota_id = ? AND data = ? AND confirmado = 1', [rota.id, hoje]);
  const novoAssento = (total?.total || 0) + 1;
  const ordem = novoAssento;

  await execute(`
    INSERT INTO presencas (rota_id, aluno_id, data, confirmado, presente)
    VALUES (?, ?, ?, 1, 1)
    ON DUPLICATE KEY UPDATE confirmado = 1, presente = 1
  `, [rota.id, alunoId, hoje]);

  await execute('UPDATE rota_alunos SET assento = ?, ordem_chegada = ? WHERE rota_id = ? AND aluno_id = ?',
    [novoAssento, ordem, rota.id, alunoId]);

  const totalConfirmados = await queryOne('SELECT COUNT(*) as total FROM presencas WHERE rota_id = ? AND data = ? AND confirmado = 1', [rota.id, hoje]);

  res.json({
    success: true,
    message: 'Presença confirmada!',
    assento: novoAssento,
    ordem,
    totalConfirmados: totalConfirmados?.total || 0,
  });
});

// POST /api/presenca/cancelar
router.post('/cancelar', async (req: Request, res: Response) => {
  const { alunoId } = req.body;
  if (!alunoId) {
    res.status(400).json({ success: false, message: 'alunoId é obrigatório' });
    return;
  }

  const hoje = new Date().toISOString().split('T')[0];

  // Busca a rota que o aluno está vinculado
  const rota = await queryOne(
    "SELECT r.id FROM rotas r JOIN rota_alunos ra ON ra.rota_id = r.id WHERE ra.aluno_id = ? AND r.status != 'encerrada' LIMIT 1",
    [alunoId]
  );
  if (!rota) {
    res.json({ success: false, message: 'Nenhuma rota encontrada para este aluno' });
    return;
  }

  await execute('DELETE FROM presencas WHERE rota_id = ? AND aluno_id = ? AND data = ?', [rota.id, alunoId, hoje]);
  await execute('UPDATE rota_alunos SET assento = NULL, ordem_chegada = NULL WHERE rota_id = ? AND aluno_id = ?', [rota.id, alunoId]);

  res.json({ success: true, message: 'Confirmação cancelada' });
});

// POST /api/presenca/marcar
router.post('/marcar', async (req: Request, res: Response) => {
  const { alunoId, presente } = req.body;
  if (!alunoId || presente === undefined) {
    res.status(400).json({ success: false, message: 'alunoId e presente são obrigatórios' });
    return;
  }

  const hoje = new Date().toISOString().split('T')[0];

  const rota = await queryOne("SELECT id FROM rotas WHERE status != 'encerrada' LIMIT 1");
  if (!rota) {
    res.json({ success: false, message: 'Nenhuma rota ativa' });
    return;
  }

  await execute(`
    INSERT INTO presencas (rota_id, aluno_id, data, presente)
    VALUES (?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE presente = ?
  `, [rota.id, alunoId, hoje, presente ? 1 : 0, presente ? 1 : 0]);

  res.json({
    success: true,
    message: presente ? 'Presença confirmada!' : 'Aluno marcado como ausente',
  });
});

export default router;
