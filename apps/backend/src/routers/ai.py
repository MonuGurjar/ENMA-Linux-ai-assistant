from fastapi import APIRouter, Depends, Query
from sqlmodel import Session
from openai import AsyncOpenAI
import httpx
from typing import Optional
from ..db import get_session
from ..models.settings import Setting

router = APIRouter(prefix="/ai", tags=["ai"])

DEFAULT_PROVIDER_URLS = {
    "ollama": "http://localhost:11434/v1",
    "lmstudio": "http://localhost:1234/v1",
    "vllm": "http://localhost:8080/v1",
}

@router.get("/models")
async def get_models(
    provider: Optional[str] = Query("ollama"),
    custom_url: Optional[str] = Query(None),
    session: Session = Depends(get_session)
):
    models = []
    
    if provider == "custom" and custom_url:
        base_url = custom_url.rstrip("/") + "/v1" if not custom_url.endswith("/v1") else custom_url
    elif provider in DEFAULT_PROVIDER_URLS:
        base_url = DEFAULT_PROVIDER_URLS[provider]
    else:
        setting = session.get(Setting, "ai_base_url")
        base_url = setting.value if setting else "http://localhost:11434/v1"
    
    # Method 1: AsyncOpenAI client
    try:
        client = AsyncOpenAI(
            base_url=base_url,
            api_key="local-ai",
            timeout=3.0
        )
        response = await client.models.list()
        for m in response.data:
            models.append({"id": m.id, "name": m.id})
    except Exception:
        pass

    # Method 2: Fallback direct HTTP requests if OpenAI client returned no models
    if not models:
        async with httpx.AsyncClient(timeout=3.0) as http_client:
            if provider == "ollama":
                try:
                    res = await http_client.get("http://localhost:11434/api/tags")
                    if res.status_code == 200:
                        data = res.json()
                        for m in data.get("models", []):
                            m_name = m.get("name")
                            if m_name:
                                models.append({"id": m_name, "name": m_name})
                except Exception:
                    pass
            elif provider == "lmstudio":
                try:
                    res = await http_client.get("http://localhost:1234/v1/models")
                    if res.status_code == 200:
                        data = res.json()
                        for m in data.get("data", []):
                            m_id = m.get("id")
                            if m_id:
                                models.append({"id": m_id, "name": m_id})
                except Exception:
                    pass
            elif provider == "vllm":
                try:
                    res = await http_client.get("http://localhost:8080/v1/models")
                    if res.status_code == 200:
                        data = res.json()
                        for m in data.get("data", []):
                            m_id = m.get("id")
                            if m_id:
                                models.append({"id": m_id, "name": m_id})
                except Exception:
                    pass
                    
    return models

@router.get("/health")
async def check_services_health():
    """Pings local provider endpoints cleanly and returns status."""
    async with httpx.AsyncClient(timeout=1.5) as http_client:
        results = {
            "backend": "running",
            "sqlite": "running",
            "ollama": "stopped",
            "lmstudio": "stopped",
            "vllm": "stopped",
        }
        
        # Check Ollama
        try:
            res = await http_client.get("http://localhost:11434/api/tags")
            if res.status_code == 200:
                results["ollama"] = "running"
        except Exception:
            pass

        # Check LM Studio
        try:
            res = await http_client.get("http://localhost:1234/v1/models")
            if res.status_code == 200:
                results["lmstudio"] = "running"
        except Exception:
            pass

        # Check vLLM
        try:
            res = await http_client.get("http://localhost:8080/v1/models")
            if res.status_code == 200:
                results["vllm"] = "running"
        except Exception:
            pass
            
        return results
