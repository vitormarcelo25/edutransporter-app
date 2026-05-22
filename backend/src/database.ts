/**
 * database.ts — Pool de conexões MySQL e helpers de query.
 * Configurações vêm do .env (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME).
 */

import 'dotenv/config';
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'edutransporte',
  waitForConnections: true,
  connectionLimit: 10,
  dateStrings: true,
});

/** Retorna todas as linhas de um SELECT. */
export async function query(sql: string, params: any[] = []): Promise<any[]> {
  const [rows] = await pool.execute(sql, params);
  return rows as any[];
}

/** Retorna a primeira linha de um SELECT (ou null). */
export async function queryOne(sql: string, params: any[] = []): Promise<any | null> {
  const rows = await query(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

/** Executa INSERT/UPDATE/DELETE. Retorna affectedRows e insertId. */
export async function execute(sql: string, params: any[] = []): Promise<{ changes: number; lastInsertRowid: number }> {
  const [result] = await pool.execute(sql, params) as any;
  return { changes: result.affectedRows, lastInsertRowid: result.insertId };
}

export function getPool() {
  return pool;
}
