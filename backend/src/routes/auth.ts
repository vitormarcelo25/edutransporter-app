/**
 * auth.ts — Login e registro de usuários.
 *
 * POST /api/auth/login     — Aluno: CPF + senha | Motorista: email + senha
 * POST /api/auth/register  — Cria usuario + aluno ou motorista (2 tabelas)
 */

import { Router, Request, Response } from 'express';
import { queryOne, execute } from '../database';

const router = Router();

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  const { email, password, role, cpf } = req.body;

  if (!password) {
    res.status(400).json({ success: false, message: 'Email/CPF e senha obrigatórios' });
    return;
  }

  let user;

  if (role === 'aluno') {
    const cpfValue = cpf || '';
    const emailValue = email || '';

    if (!cpfValue && !emailValue) {
      res.status(400).json({ success: false, message: 'CPF ou e-mail é obrigatório' });
      return;
    }

    // Tenta login por CPF primeiro
    if (cpfValue) {
      const cpfLimpo = cpfValue.replace(/\D/g, '');
      user = await queryOne('SELECT * FROM usuarios WHERE cpf = ? AND password = ? AND role = ?', [cpfLimpo, password, 'aluno']);
    }

    // Se não achou por CPF, tenta por email
    if (!user && emailValue) {
      user = await queryOne('SELECT * FROM usuarios WHERE email = ? AND password = ? AND role = ?', [emailValue, password, 'aluno']);
    }
  } else {
    if (!email) {
      res.status(400).json({ success: false, message: 'Email é obrigatório' });
      return;
    }
    user = await queryOne('SELECT * FROM usuarios WHERE email = ? AND password = ? AND role = ?', [email, password, role || 'motorista']);
  }

  if (!user) {
    res.status(401).json({ success: false, message: 'Credenciais inválidas' });
    return;
  }

  res.json({
    success: true,
    token: `token_${user.id}_${Date.now()}`,
    user: {
      id: String(user.id),
      nome: user.nome,
      email: user.email || '',
      role: user.role,
    },
  });
});

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  const { nome, email, cpf, password, role, telefone, cidade, escola, matriculaEscolar, matriculaVeiculo, cartaConducao } = req.body;

  if (!nome || !password) {
    res.status(400).json({ success: false, message: 'Nome e senha são obrigatórios' });
    return;
  }

  if (role === 'aluno') {
    const cpfLimpo = (cpf || '').replace(/\D/g, '');
    if (cpfLimpo.length !== 11) {
      res.status(400).json({ success: false, message: 'CPF inválido' });
      return;
    }

    if (!email || !email.includes('@')) {
      res.status(400).json({ success: false, message: 'E-mail é obrigatório' });
      return;
    }

    const existenteCPF = await queryOne('SELECT id FROM usuarios WHERE cpf = ?', [cpfLimpo]);
    if (existenteCPF) {
      res.status(400).json({ success: false, message: 'CPF já cadastrado' });
      return;
    }

    const existenteEmail = await queryOne('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (existenteEmail) {
      res.status(400).json({ success: false, message: 'E-mail já cadastrado' });
      return;
    }

    const result = await execute(
      'INSERT INTO usuarios (nome, email, password, role, cpf, telefone, cidade) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [nome, email, password, 'aluno', cpfLimpo, telefone || '', cidade || '']
    );

    await execute(
      'INSERT INTO alunos (usuario_id, escola, matricula_escolar) VALUES (?, ?, ?)',
      [result.lastInsertRowid, escola || '', matriculaEscolar || '']
    );

    // Vincula o aluno na rota da instituição que ele escolheu
    if (escola) {
      await execute(
        `INSERT IGNORE INTO rota_alunos (rota_id, aluno_id, parada)
         SELECT r.id, ?, ? FROM rotas r WHERE r.escola LIKE ? LIMIT 1`,
        [result.lastInsertRowid, cidade || '', `%${escola}%`]
      );
    }

    res.json({
      success: true,
      message: 'Conta criada com sucesso!',
      userId: String(result.lastInsertRowid),
      token: `token_${result.lastInsertRowid}_${Date.now()}`,
      user: {
        id: String(result.lastInsertRowid),
        nome,
        email: email || '',
        role: 'aluno',
      },
    });
  } else {
    if (!email) {
      res.status(400).json({ success: false, message: 'Email é obrigatório para motorista' });
      return;
    }

    const existente = await queryOne('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (existente) {
      res.status(400).json({ success: false, message: 'Email já cadastrado' });
      return;
    }

    const result = await execute(
      'INSERT INTO usuarios (nome, email, password, role, cpf, telefone, cidade) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [nome, email, password, role || 'motorista', '', telefone || '', cidade || '']
    );

    await execute(
      'INSERT INTO motoristas (usuario_id, cnh, matricula_veiculo) VALUES (?, ?, ?)',
      [result.lastInsertRowid, cartaConducao || '', matriculaVeiculo || '']
    );

    res.json({
      success: true,
      message: 'Conta criada com sucesso!',
      userId: String(result.lastInsertRowid),
      token: `token_${result.lastInsertRowid}_${Date.now()}`,
      user: {
        id: String(result.lastInsertRowid),
        nome,
        email,
        role: role || 'motorista',
      },
    });
  }
});

export default router;
