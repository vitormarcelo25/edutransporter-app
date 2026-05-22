/**
 * schema.ts — Cria o banco "edutransporte" e todas as tabelas.
 * Idempotente (usa IF NOT EXISTS, pode rodar várias vezes).
 *
 * Tabelas: usuarios (base) → alunos, motoristas (específicas)
 *          rotas → rota_paradas, rota_alunos, presencas
 */

import 'dotenv/config';
import mysql from 'mysql2/promise';

async function createDatabase() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  });

  await conn.query('CREATE DATABASE IF NOT EXISTS edutransporte CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
  await conn.query('USE edutransporte');

  await conn.query(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nome VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL DEFAULT '',
      password VARCHAR(255) NOT NULL,
      role ENUM('aluno', 'motorista', 'admin') NOT NULL,
      cpf VARCHAR(11) NOT NULL DEFAULT '',
      telefone VARCHAR(20) DEFAULT '',
      cidade VARCHAR(100) DEFAULT '',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uk_cpf (cpf),
      UNIQUE KEY uk_email (email)
    )
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS alunos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      usuario_id INT NOT NULL,
      escola VARCHAR(255) DEFAULT '',
      matricula_escolar VARCHAR(50) DEFAULT '',
      serie VARCHAR(50) DEFAULT '',
      turma VARCHAR(50) DEFAULT '',
      responsavel_nome VARCHAR(255) DEFAULT '',
      responsavel_telefone VARCHAR(20) DEFAULT '',
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
    )
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS motoristas (
      id INT AUTO_INCREMENT PRIMARY KEY,
      usuario_id INT NOT NULL,
      cnh VARCHAR(20) DEFAULT '',
      validade_cnh DATE DEFAULT NULL,
      categoria VARCHAR(10) DEFAULT '',
      matricula_veiculo VARCHAR(20) DEFAULT '',
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
    )
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS rotas (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nome VARCHAR(255) NOT NULL,
      escola VARCHAR(255) NOT NULL,
      horario VARCHAR(5) NOT NULL,
      tipo ENUM('Ida', 'Volta') NOT NULL,
      status ENUM('agendada', 'em_andamento', 'encerrada') DEFAULT 'agendada',
      motorista_id INT,
      FOREIGN KEY (motorista_id) REFERENCES usuarios(id)
    )
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS rota_paradas (
      id INT AUTO_INCREMENT PRIMARY KEY,
      rota_id INT NOT NULL,
      nome VARCHAR(255) NOT NULL,
      endereco VARCHAR(255) NOT NULL,
      latitude DECIMAL(10,7) NOT NULL,
      longitude DECIMAL(10,7) NOT NULL,
      ordem INT NOT NULL,
      FOREIGN KEY (rota_id) REFERENCES rotas(id) ON DELETE CASCADE
    )
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS rota_alunos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      rota_id INT NOT NULL,
      aluno_id INT NOT NULL,
      parada VARCHAR(255) DEFAULT '',
      assento INT DEFAULT NULL,
      ordem_chegada INT DEFAULT NULL,
      FOREIGN KEY (rota_id) REFERENCES rotas(id) ON DELETE CASCADE,
      FOREIGN KEY (aluno_id) REFERENCES usuarios(id) ON DELETE CASCADE,
      UNIQUE KEY uk_rota_aluno (rota_id, aluno_id)
    )
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS presencas (
      id INT AUTO_INCREMENT PRIMARY KEY,
      rota_id INT NOT NULL,
      aluno_id INT NOT NULL,
      data DATE NOT NULL,
      presente TINYINT(1) DEFAULT 0,
      confirmado TINYINT(1) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (rota_id) REFERENCES rotas(id) ON DELETE CASCADE,
      FOREIGN KEY (aluno_id) REFERENCES usuarios(id) ON DELETE CASCADE,
      UNIQUE KEY uk_presenca (rota_id, aluno_id, data)
    )
  `);

  console.log('Schema criado com sucesso!');
  await conn.end();
}

createDatabase().catch(console.error);
