# PLANO BACKEND - EDUTRANSPORTER v10.1.0

## Stack Recomendada
- **Runtime:** Node.js
- **Framework:** Express ou Fastify
- **Banco:** PostgreSQL (ou MySQL)
- **Auth:** JWT + bcrypt

---

## Endpoints da API

### Auth
| Método | Endpoint | Função |
|--------|----------|--------|
| POST | /api/auth/login | Login (CPF/email para aluno, email para motorista) |
| POST | /api/auth/register | Criar conta |
| PUT | /api/auth/alterar-senha | Alterar senha |

### Usuários
| Método | Endpoint |
|--------|----------|
| GET | /api/usuarios/perfil |
| PUT | /api/usuarios/perfil |
| PUT | /api/usuarios/notificacoes |

### Rotas
| Método | Endpoint |
|--------|----------|
| GET | /api/rotas/hoje |
| GET | /api/rotas/agenda |
| POST | /api/rotas/iniciar |
| POST | /api/rotas/encerrar |

### GPS
| POST | /api/gps/update |

### Presença
| POST | /api/presenca/marcar |

### Histórico
| GET | /api/viagens/historico |

### Avisos
| GET | /api/avisos |

### Admin
| GET | /api/admin/dashboard |
| GET/POST/DELETE | /api/admin/rotas |
| GET/POST/DELETE | /api/admin/feriados |
| GET/POST | /api/admin/convites |

---

## Tabelas do Banco

1. **usuarios** - id, nome, email, telefone, cidade, password_hash, role, escola, matricula_escola, matricula_veiculo, carta_conducao
2. **paradas** - id, nome, endereco, latitude, longitude
3. **rotas** - id, nome, escola, horario, tipo, status, dias_semana, motorista_id
4. **rota_paradas** - rota_id, parada_id, ordem
5. **rota_alunos** - rota_id, usuario_id
6. **gps_positions** - rota_id, latitude, longitude, velocidade, heading, timestamp
7. **presencas** - rota_id, usuario_id, presente, data
8. **viagens** - rota_id, usuario_id, data, tipo
9. **avisos** - tipo, titulo, descricao, admin_id
10. **feriados** - nome, data, motivo
11. **convites** - codigo, usado, expira_em

*(SQL completo está em DOC-BANCO-DADOS.md)*

---

## Autenticação JWT

Gerar token no login contendo: id, nome, email, role

**Response login esperado:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { "id": "...", "nome": "...", "email": "...", "role": "aluno" }
}
```

---

## Configuração Frontend

Arquivo: `services/api.ts`
- Mudar `USE_MOCK = false`
- Alterar `API_BASE_URL` para seu servidor