# EduTransporter - Como Iniciar

## No Dia do Pitch (PC novo)

### Passo 1: Clonar e instalar
```powershell
git clone https://github.com/vitormarcelo25/edutransporter-app.git
cd edutransporter-app
npm install
```

### Passo 2: Iniciar o Frontend
**Duplo-clique em `pitch.bat`** — ele inicia o Expo e abre o app no navegador.

Se o duplo-clique não funcionar (abrir no Notepad), abra o PowerShell na pasta do projeto e digite:
```powershell
.\pitch.bat
```

### Passo 3: Abrir o app
Abra o navegador em **http://localhost:8081**

### Credenciais de teste
- **CPF:** `16006485474` (160.064.854-74)
- **Senha:** `12345`
- **Admin:** chave `admin26`

> Backend na nuvem: `https://backend-edutransporte.onrender.com` (configurado no `.env`).

---

## Bibliotecas necessárias no PC
- Node.js (https://nodejs.org)
- Git

---

## Arquitetura Atual

| Componente | Status | Observação |
|---|---|---|
| Frontend (Expo) | Obrigatório | Roda na porta 8081 |
| Backend Spring Boot | Nuvem (Render) | URL definida em `EXPO_PUBLIC_API_URL` no `.env` |
| Fonte do backend | `C:\Users\vitorsantana\edutransporte-backend` | Spring Boot + PostgreSQL (Supabase) |

### Funcionalidades já ligadas ao backend real
- Login de aluno e administrador (JWT)
- Cadastro de aluno (entra como PENDENTE)
- Aprovação/recusa de alunos pelo admin
- Cidades, faculdades, perfil do aluno
- Avisos, histórico de viagens, rotas do dia, presença, GPS

### Ainda com fallback local (mock)
- Iniciar/encerrar rota
- Feriados e convites (controllers ainda vazios no backend)
- Cadastro de motorista pelo painel admin

---

## Para Mostrar no Celular
No PowerShell:
```powershell
npx expo start --tunnel
```
Escaneie o QR code com o Expo Go.

---

## Executar o backend localmente (opcional)

O backend Spring Boot fica em `C:\Users\vitorsantana\edutransporte-backend`.

```powershell
cd C:\Users\vitorsantana\edutransporte-backend
.\mvnw.cmd spring-boot:run
```

Por padrão ele sobe em `http://localhost:8080` e usa o PostgreSQL do Supabase
(configurado em `src/main/resources/application.yml`). Para o app usar o backend
local, troque no `.env`:
```
EXPO_PUBLIC_API_URL=http://localhost:8080
```
Depois reinicie o Expo com `npx expo start --web -c`.

> Em celular físico, `localhost` não funciona: use o IP da máquina
> (ex.: `http://192.168.0.10:8080`) ou mantenha a URL do Render.

---

## Build web / deploy

```powershell
npx expo export --platform web   # gera a pasta dist/
npx vercel --prod                # publica o build novo
```

---

## Resumo Rápido

- **No pitch day**: `git pull` + `.\pitch.bat` → abre `http://localhost:8081`
- **Credenciais**: CPF `16006485474`, senha `12345`, admin `admin26`
- **Backend**: Render (`https://backend-edutransporte.onrender.com`)
- **Se o login falhar**: rode `npx expo start --web -c` e recarregue com `Ctrl+Shift+R`
