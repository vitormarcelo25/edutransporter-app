/**
 * rotas.ts — Rota do dia com alunos, paradas e status de presença.
 *
 * GET /api/rotas/hoje — Retorna rota ativa + paradas + alunos com presença do dia.
 */

import { Router, Request, Response } from 'express';
import { query, queryOne } from '../database';

const router = Router();

router.get('/hoje', async (req: Request, res: Response) => {
  const hoje = new Date().toISOString().split('T')[0];
  const { alunoId } = req.query;

  let rota;

  // Se alunoId informado, busca a rota que o aluno está vinculado
  if (alunoId) {
    rota = await queryOne(`
      SELECT r.* FROM rotas r
      JOIN rota_alunos ra ON ra.rota_id = r.id
      WHERE ra.aluno_id = ? AND r.status != 'encerrada'
      ORDER BY r.id LIMIT 1
    `, [alunoId]);
  }

  // Se não encontrou rota do aluno, retorna a primeira rota ativa (motorista/admin)
  if (!rota) {
    rota = await queryOne("SELECT * FROM rotas WHERE status != 'encerrada' ORDER BY id LIMIT 1");
  }

  if (!rota) {
    res.json({ success: false, message: 'Nenhuma rota encontrada para hoje' });
    return;
  }

  const paradas = await query('SELECT * FROM rota_paradas WHERE rota_id = ? ORDER BY ordem', [rota.id]);

  const alunos = await query(`
    SELECT u.id, u.nome, a.escola, ra.parada, ra.assento, ra.ordem_chegada,
           COALESCE(p.presente, 0) as presente, COALESCE(p.confirmado, 0) as confirmouPresenca
    FROM rota_alunos ra
    JOIN usuarios u ON u.id = ra.aluno_id
    JOIN alunos a ON a.usuario_id = u.id
    LEFT JOIN presencas p ON p.aluno_id = ra.aluno_id AND p.rota_id = ra.rota_id AND p.data = ?
    WHERE ra.rota_id = ?
  `, [hoje, rota.id]);

  const alunosFormatados = alunos.map((a: any) => ({
    id: String(a.id),
    nome: a.nome,
    escola: a.escola || '',
    parada: a.parada || '',
    presente: Boolean(a.presente),
    confirmouPresenca: Boolean(a.confirmouPresenca),
    assentoAutomatico: a.assento,
    ordemChegada: a.ordem_chegada,
  }));

  const paradasFormatadas = paradas.map((p: any) => ({
    id: String(p.id),
    nome: p.nome,
    endereco: p.endereco,
    latitude: p.latitude,
    longitude: p.longitude,
  }));

  res.json({
    success: true,
    rota: {
      id: String(rota.id),
      nome: rota.nome,
      escola: rota.escola,
      horario: rota.horario,
      tipo: rota.tipo,
      status: rota.status,
      alunos: alunosFormatados,
      paradas: paradasFormatadas,
    },
  });
});

export default router;
