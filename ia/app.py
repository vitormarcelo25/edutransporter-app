"""API que responde perguntas com base em um arquivo .txt usando Ollama."""
import os
from pathlib import Path
import re

import requests
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

BASE_DIR = Path(__file__).resolve().parent
OLLAMA_URL = os.getenv("OLLAMA_URL", "http://127.0.0.1:11434").rstrip("/")
MODELO = os.getenv("MODELO", "qwen2.5:1.5b")
ARQUIVO = os.getenv("ARQUIVO", str(BASE_DIR / "dados" / "base.txt"))
TAMANHO_TRECHO = 800  # caracteres por trecho
TRECHOS_USADOS = 4    # quantos trechos vão para o modelo

app = FastAPI(title="EduTransporte IA")

# Permite requisições vindas do Expo Web, Vercel ou clientes locais em dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


def resolver_caminho_arquivo(caminho: str) -> Path:
    """Resolve o caminho da base de conhecimento a partir do cwd ou da pasta ia/."""
    path = Path(caminho)
    if path.exists():
        return path
    relativo = BASE_DIR / caminho
    if relativo.exists():
        return relativo
    return path


def carregar_trechos(caminho: str) -> list[str]:
    """Lê o .txt e divide em trechos menores, respeitando parágrafos."""
    arquivo_path = resolver_caminho_arquivo(caminho)
    with open(arquivo_path, encoding="utf-8") as f:
        texto = f.read()
    paragrafos = [p.strip() for p in texto.split("\n\n") if p.strip()]
    trechos, atual = [], ""
    for p in paragrafos:
        if len(atual) + len(p) > TAMANHO_TRECHO and atual:
            trechos.append(atual)
            atual = ""
        atual += p + "\n\n"
    if atual:
        trechos.append(atual)
    return trechos


def palavras(texto: str) -> set[str]:
    return {p for p in re.findall(r"\w+", texto.lower()) if len(p) > 2}


def buscar_trechos(pergunta: str) -> list[str]:
    """Escolhe os trechos com mais palavras em comum com a pergunta."""
    termos = palavras(pergunta)
    pontuados = sorted(TRECHOS, key=lambda t: len(termos & palavras(t)), reverse=True)
    return pontuados[:TRECHOS_USADOS]


TRECHOS = carregar_trechos(ARQUIVO)


class Pergunta(BaseModel):
    pergunta: str


@app.get("/")
@app.get("/health")
def status():
    return {"status": "ok", "modelo": MODELO, "trechos_carregados": len(TRECHOS)}


@app.post("/perguntar")
def perguntar(dados: Pergunta):
    pergunta_limpa = dados.pergunta.strip()
    if not pergunta_limpa:
        raise HTTPException(400, "A pergunta não pode ficar vazia.")

    contexto = "\n---\n".join(buscar_trechos(pergunta_limpa))
    prompt = (
        "Responda em português, de forma curta, usando APENAS as informações abaixo. "
        "Se a resposta não estiver nas informações, diga que não sabe.\n\n"
        f"INFORMAÇÕES:\n{contexto}\n\nPERGUNTA: {pergunta_limpa}\nRESPOSTA:"
    )
    try:
        r = requests.post(
            f"{OLLAMA_URL}/api/generate",
            json={"model": MODELO, "prompt": prompt, "stream": False},
            timeout=120,
        )
        r.raise_for_status()
    except requests.RequestException as e:
        raise HTTPException(503, f"Erro ao falar com o Ollama: {e}")
    return {"resposta": r.json()["response"].strip()}
