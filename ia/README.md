# EduTransporte IA (`IA-EduTransporte`)

Serviço FastAPI que responde às perguntas dos usuários do **EduTransporter** com base na documentação oficial (`dados/base.txt`) utilizando o **Ollama** (`qwen2.5:1.5b`).

Origem: `https://github.com/David-Rn01/IA-EduTransporte.git`

## Pré-requisitos

1. Python 3.11+
2. [Ollama](https://ollama.com/) instalado e rodando com o modelo configurado:
   ```powershell
   ollama pull qwen2.5:1.5b
   ```
3. (Opcional para acesso externo) `cloudflared` instalado para expor o túnel HTTPS público.

## Como rodar localmente

```powershell
cd ia
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app:app --host 0.0.0.0 --port 8000
```

Para subir a API junto com o túnel Cloudflare:

```powershell
powershell -ExecutionPolicy Bypass -File .\ia\iniciar.ps1
```

## Conexão com o aplicativo

Configure a variável `EXPO_PUBLIC_IA_URL` no `.env` na raiz do projeto:

```env
EXPO_PUBLIC_IA_URL=http://127.0.0.1:8000
```

Se estiver usando o túnel `cloudflared` ou um servidor na nuvem, substitua pela URL pública correspondente (ex.: `https://sua-url.trycloudflare.com`) e reinicie o Expo com `npx expo start -c`.

> Quando a API de IA estiver offline, o aplicativo utiliza automaticamente a base oficial em modo fallback local para não deixar o usuário sem resposta.
