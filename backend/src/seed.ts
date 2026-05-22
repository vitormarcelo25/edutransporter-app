/**
 * seed.ts — Cria 4 rotas para Caruaru (uma por instituição).
 * 
 * Executado via: npm run seed
 * 
 * Limpa tudo e recria as rotas com paradas realistas da região.
 * Não cria usuários — quem for usar se registra pelo app.
 */

import { execute } from './database';

async function main() {
  // Limpa na ordem correta (foreign keys)
  await execute('DELETE FROM presencas');
  await execute('DELETE FROM rota_alunos');
  await execute('DELETE FROM rota_paradas');
  await execute('DELETE FROM rotas');
  await execute('DELETE FROM motoristas');
  await execute('DELETE FROM alunos');
  await execute('DELETE FROM usuarios');

  // Reseta auto_increment pra começar do 1
  await execute('ALTER TABLE usuarios AUTO_INCREMENT = 1');
  await execute('ALTER TABLE alunos AUTO_INCREMENT = 1');
  await execute('ALTER TABLE motoristas AUTO_INCREMENT = 1');
  await execute('ALTER TABLE rotas AUTO_INCREMENT = 1');
  await execute('ALTER TABLE rota_paradas AUTO_INCREMENT = 1');
  await execute('ALTER TABLE rota_alunos AUTO_INCREMENT = 1');
  await execute('ALTER TABLE presencas AUTO_INCREMENT = 1');

  // ── ROTA 1: EE Prof. João Silva (06:45) ──
  const r1 = await execute(
    'INSERT INTO rotas (nome, escola, horario, tipo, status, motorista_id) VALUES (?, ?, ?, ?, ?, ?)',
    ['Rota João Silva', 'EE Prof. João Silva', '06:45', 'Ida', 'agendada', null]
  );
  const paradasJoaoSilva = [
    { nome: 'Pão de Açúcar', endereco: 'Pão de Açúcar, Taquaritinga do Norte, PE', lat: -7.8900, lng: -36.0500, ordem: 1 },
    { nome: 'Toritama', endereco: 'R. Principal - Toritama, PE', lat: -7.8950, lng: -36.0400, ordem: 2 },
    { nome: 'Brejo', endereco: 'Av. Industrial - Brejo da Madre de Deus, PE', lat: -8.0000, lng: -36.2000, ordem: 3 },
    { nome: 'Caruaru Centro', endereco: 'R. Vigário Tenório - Caruaru, PE', lat: -8.2761, lng: -35.9769, ordem: 4 },
    { nome: 'EE Prof. João Silva', endereco: 'Caruaru, PE', lat: -8.2830, lng: -35.9750, ordem: 5 },
  ];
  for (const p of paradasJoaoSilva) {
    await execute(
      'INSERT INTO rota_paradas (rota_id, nome, endereco, latitude, longitude, ordem) VALUES (?, ?, ?, ?, ?, ?)',
      [r1.lastInsertRowid, p.nome, p.endereco, p.lat, p.lng, p.ordem]
    );
  }

  // ── ROTA 2: Colégio Dom Bosco (07:15) ──
  const r2 = await execute(
    'INSERT INTO rotas (nome, escola, horario, tipo, status, motorista_id) VALUES (?, ?, ?, ?, ?, ?)',
    ['Rota Dom Bosco', 'Colégio Dom Bosco', '07:15', 'Ida', 'agendada', null]
  );
  const paradasDomBosco = [
    { nome: 'Pão de Açúcar', endereco: 'Pão de Açúcar, Taquaritinga do Norte, PE', lat: -7.8900, lng: -36.0500, ordem: 1 },
    { nome: 'Toritama', endereco: 'R. Principal - Toritama, PE', lat: -7.8950, lng: -36.0400, ordem: 2 },
    { nome: 'Caruaru Centro', endereco: 'R. Vigário Tenório - Caruaru, PE', lat: -8.2761, lng: -35.9769, ordem: 3 },
    { nome: 'Colégio Dom Bosco', endereco: 'Caruaru, PE', lat: -8.2810, lng: -35.9680, ordem: 4 },
  ];
  for (const p of paradasDomBosco) {
    await execute(
      'INSERT INTO rota_paradas (rota_id, nome, endereco, latitude, longitude, ordem) VALUES (?, ?, ?, ?, ?, ?)',
      [r2.lastInsertRowid, p.nome, p.endereco, p.lat, p.lng, p.ordem]
    );
  }

  // ── ROTA 3: IFPE Campus Caruaru (06:30) ──
  const r3 = await execute(
    'INSERT INTO rotas (nome, escola, horario, tipo, status, motorista_id) VALUES (?, ?, ?, ?, ?, ?)',
    ['Rota IFPE', 'IFPE Campus Caruaru', '06:30', 'Ida', 'agendada', null]
  );
  const paradasIFPE = [
    { nome: 'Pão de Açúcar', endereco: 'Pão de Açúcar, Taquaritinga do Norte, PE', lat: -7.8900, lng: -36.0500, ordem: 1 },
    { nome: 'Brejo', endereco: 'Av. Industrial - Brejo da Madre de Deus, PE', lat: -8.0000, lng: -36.2000, ordem: 2 },
    { nome: 'Caruaru Centro', endereco: 'R. Vigário Tenório - Caruaru, PE', lat: -8.2761, lng: -35.9769, ordem: 3 },
    { nome: 'IFPE Campus Caruaru', endereco: 'Caruaru, PE', lat: -8.2900, lng: -35.9700, ordem: 4 },
  ];
  for (const p of paradasIFPE) {
    await execute(
      'INSERT INTO rota_paradas (rota_id, nome, endereco, latitude, longitude, ordem) VALUES (?, ?, ?, ?, ?, ?)',
      [r3.lastInsertRowid, p.nome, p.endereco, p.lat, p.lng, p.ordem]
    );
  }

  // ── ROTA 4: Faculdade Maurício de Nassau (07:30) ──
  const r4 = await execute(
    'INSERT INTO rotas (nome, escola, horario, tipo, status, motorista_id) VALUES (?, ?, ?, ?, ?, ?)',
    ['Rota Nassau', 'Faculdade Maurício de Nassau', '07:30', 'Ida', 'agendada', null]
  );
  const paradasNassau = [
    { nome: 'Pão de Açúcar', endereco: 'Pão de Açúcar, Taquaritinga do Norte, PE', lat: -7.8900, lng: -36.0500, ordem: 1 },
    { nome: 'Toritama', endereco: 'R. Principal - Toritama, PE', lat: -7.8950, lng: -36.0400, ordem: 2 },
    { nome: 'Caruaru Centro', endereco: 'R. Vigário Tenório - Caruaru, PE', lat: -8.2761, lng: -35.9769, ordem: 3 },
    { nome: 'Faculdade Maurício de Nassau', endereco: 'R. do Cedro, 55 - Caruaru, PE', lat: -8.2800, lng: -35.9800, ordem: 4 },
  ];
  for (const p of paradasNassau) {
    await execute(
      'INSERT INTO rota_paradas (rota_id, nome, endereco, latitude, longitude, ordem) VALUES (?, ?, ?, ?, ?, ?)',
      [r4.lastInsertRowid, p.nome, p.endereco, p.lat, p.lng, p.ordem]
    );
  }

  console.log('Banco populado com sucesso!');
  console.log('');
  console.log('=== 4 Rotas Criadas ===');
  console.log('1. Rota João Silva     — EE Prof. João Silva     — 06:45');
  console.log('2. Rota Dom Bosco      — Colégio Dom Bosco        — 07:15');
  console.log('3. Rota IFPE           — IFPE Campus Caruaru      — 06:30');
  console.log('4. Rota Nassau         — Faculdade Maurício de Nassau — 07:30');
}

main().catch(console.error);
