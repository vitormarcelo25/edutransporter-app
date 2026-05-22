# 📋 DOCUMENTAÇÃO BANCO DE DADOS - EDUTRANSPORTER

> **Versão do App:** 10.1.0 Beta  
> **Desenvolvedor:** (ADS Uninassau Caruaru)

---

## 1. LOGIN/AUTENTICAÇÃO

### Endpoints API necessários:
- `POST /api/auth/login` - Login com email/CPF + senha
- `POST /api/auth/register` - Registro de novos usuários
- `PUT /api/auth/alterar-senha` - Alterar senha do usuário

### Tabela: usuarios

```sql
CREATE TABLE usuarios (
  id UUID PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  telefone VARCHAR(20),
  cidade VARCHAR(100),
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('aluno', 'motorista', 'admin') NOT NULL,
  
  -- Campos específicos para ALUNO
  escola VARCHAR(255),
  matricula_escolar VARCHAR(50),
  
  -- Campos específicos para MOTORISTA
  matricula_veiculo VARCHAR(20),
  carta_conducao VARCHAR(20),
  
  -- Controle
  foto VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ativo BOOLEAN DEFAULT true
);
```

**Observações:**
- Para **aluno**: login pode ser por email OU CPF
- Para **motorista**: login deve ser por email apenas
- Campos `escola` e `matricula_escolar` são obrigatórios para alunos
- Campos `matricula_veiculo` e `carta_conducao` são obrigatórios para motoristas

### Tabela: admin_access (login administrativo)

```sql
CREATE TABLE admin_access (
  id UUID PRIMARY KEY,
  access_key VARCHAR(50) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ativo BOOLEAN DEFAULT true
);
```

---

## 2. PERFIL DO USUÁRIO

Usa a tabela `usuarios` sama do login.

### Endpoints:
- `GET /api/usuarios/perfil` → Retorna dados do usuário logado
- `PUT /api/usuarios/perfil` → Atualiza dados pessoais
- `PUT /api/usuarios/notificacoes` → Atualiza preferências de notificação

### Tabela: notificacoes_config (preferências)

```sql
CREATE TABLE notificacoes_config (
  usuario_id UUID PRIMARY KEY REFERENCES usuarios(id),
  avisos BOOLEAN DEFAULT true,
  presenca BOOLEAN DEFAULT true,
  mensagens BOOLEAN DEFAULT true,
  rotas BOOLEAN DEFAULT true,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 3. MAPA E ROTAS

### Tabela: paradas

```sql
CREATE TABLE paradas (
  id UUID PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  endereco VARCHAR(500),
  latitude DECIMAL(10,8) NOT NULL,
  longitude DECIMAL(11,8) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabela: rotas

```sql
CREATE TABLE rotas (
  id UUID PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  escola VARCHAR(255) NOT NULL,
  horario TIME NOT NULL,
  tipo ENUM('Ida', 'Volta') NOT NULL,
  status ENUM('agendada', 'em_andamento', 'encerrada') DEFAULT 'agendada',
  dias_semana VARCHAR(20), -- Ex: "1,2,3,4,5" para Segunda-Sexta
  
  -- Relacionamentos
  motorista_id UUID REFERENCES usuarios(id),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabela: rota_paradas (relação-many-to-many)

```sql
CREATE TABLE rota_paradas (
  rota_id UUID REFERENCES rotas(id) ON DELETE CASCADE,
  parada_id UUID REFERENCES paradas(id) ON DELETE CASCADE,
  ordem INTEGER NOT NULL,
  PRIMARY KEY (rota_id, parada_id)
);
```

### Tabela: rota_alunos (alunos atribuídos à rota)

```sql
CREATE TABLE rota_alunos (
  rota_id UUID REFERENCES rotas(id) ON DELETE CASCADE,
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  PRIMARY KEY (rota_id, usuario_id)
);
```

### Tabela: gps_positions (tracking em tempo real)

```sql
CREATE TABLE gps_positions (
  id UUID PRIMARY KEY,
  rota_id UUID REFERENCES rotas(id) ON DELETE CASCADE,
  latitude DECIMAL(10,8) NOT NULL,
  longitude DECIMAL(11,8) NOT NULL,
  velocidade DECIMAL(6,2),
  heading DECIMAL(5,2),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_gps_rota ON gps_positions(rota_id, timestamp);
```

### Endpoints:
- `GET /api/rotas/hoje` → Rota do dia atual
- `POST /api/rotas/iniciar` → Iniciar uma rota
- `POST /api/rotas/encerrar` → Encerrar uma rota
- `GET /api/rotas/agenda` → Agenda semanal de rotas
- `POST /api/gps/update` → Atualizar posição GPS

---

## 4. PRESENÇA

### Tabela: presencas

```sql
CREATE TABLE presencas (
  id UUID PRIMARY KEY,
  rota_id UUID REFERENCES rotas(id) ON DELETE CASCADE,
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  presente BOOLEAN NOT NULL,
  data DATE NOT NULL,
  horario TIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(rota_id, usuario_id, data)
);
```

### Endpoints:
- `POST /api/presenca/marcar` → Marcar presença (motorista marca para aluno)

---

## 5. HISTÓRICO DE VIAGENS

### Tabela: viagens

```sql
CREATE TABLE viagens (
  id UUID PRIMARY KEY,
  rota_id UUID REFERENCES rotas(id) ON DELETE CASCADE,
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  data DATE NOT NULL,
  tipo ENUM('Ida', 'Volta') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_viagens_usuario ON viagens(usuario_id, data);
```

### Endpoint:
- `GET /api/viagens/historico` → Lista histórico de viagens

---

## 6. AVISOS

### Tabela: avisos

```sql
CREATE TABLE avisos (
  id UUID PRIMARY KEY,
  tipo ENUM('urgente', 'info', 'sucesso') NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  admin_id UUID REFERENCES usuarios(id)
);
```

### Endpoint:
- `GET /api/avisos` → Lista todos os avisos

---

## 7. ADMIN - FERIADOS

### Tabela: feriados

```sql
CREATE TABLE feriados (
  id UUID PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  data DATE NOT NULL,
  motivo TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Endpoints:
- `GET /api/admin/feriados` → Lista feriados
- `POST /api/admin/feriados` → Criar feriado
- `DELETE /api/admin/feriados/:id` → Excluir feriado

---

## 8. ADMIN - CONVITES

### Tabela: convites

```sql
CREATE TABLE convites (
  id UUID PRIMARY KEY,
  codigo VARCHAR(50) UNIQUE NOT NULL,
  usado BOOLEAN DEFAULT false,
  usuario_id UUID REFERENCES usuarios(id),
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expira_em TIMESTAMP NOT NULL
);
```

### Endpoints:
- `GET /api/admin/convites` → Lista convites
- `POST /api/admin/convites` → Gerar novo convite

---

## 9. ADMIN - DASHBOARD

### Endpoints:
- `GET /api/admin/dashboard` → Stats (total alunos, motoristas, rotas ativas, avisos)

---

## 📌 RESUMO DOS ENDPOINTS API

| Método | Endpoint | Descrição |
|--------|---------|----------|
| POST | /api/auth/login | Login usuário |
| POST | /api/auth/register | Criar conta |
| PUT | /api/auth/alterar-senha | Alterar senha |
| GET | /api/usuarios/perfil | Buscar perfil |
| PUT | /api/usuarios/perfil | Atualizar perfil |
| PUT | /api/usuarios/notificacoes | Config notificações |
| GET | /api/rotas/hoje | Rota do dia |
| POST | /api/rotas/iniciar | Iniciar rota |
| POST | /api/rotas/encerrar | Encerrar rota |
| GET | /api/rotas/agenda | Agenda semanal |
| POST | /api/gps/update | Atualizar GPS |
| POST | /api/presenca/marcar | Marcar presença |
| GET | /api/viagens/historico | Histórico |
| GET | /api/avisos | Lista avisos |
| GET | /api/admin/dashboard | Stats admin |
| GET/POST/DELETE | /api/admin/rotas | Gerenciar rotas |
| GET/POST/DELETE | /api/admin/feriados | Gerenciar feriados |
| GET/POST | /api/admin/convites | Gerar convites |

---

## 🔧 CONFIGURAÇÃO NO FRONTEND

O app está configurado com dados mock (fake) para testes. Para conectar ao banco real:

1. Arquivo: `services/api.ts`
2. Mudar: `const USE_MOCK = false`
3. Alterar: `const API_BASE_URL = 'http://SEU_SERVidor:3000/api'`

---

## 📞 SUPORTE

Em caso de dúvidas sobre a estrutura, consulte o código frontend em:
- Login: `app/(auth)/index.tsx`
- Registo: `app/(auth)/registo.tsx`
- API: `services/api.ts`
- Contexto: `contexts/AppContext.tsx`

---

Feito com ☕ por Vitor Santana