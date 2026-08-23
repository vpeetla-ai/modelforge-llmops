from fastapi.testclient import TestClient

from modelforge_llmops.api.main import app

client = TestClient(app)


def test_health() -> None:
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


def test_posture_lists_components() -> None:
    r = client.get("/v1/posture")
    assert r.status_code == 200
    body = r.json()
    assert body["service"] == "modelforge-llmops"
    assert len(body["components"]) >= 4
    assert "Foundation-model pretraining" in " ".join(body["non_goals"])


def test_receipts_start_as_placeholders() -> None:
    r = client.get("/v1/receipts")
    assert r.status_code == 200
    kinds = {x["kind"] for x in r.json()["receipts"]}
    assert {"peft", "vllm_cuda", "slm_bakeoff", "gateway"} <= kinds


def test_plane_summary() -> None:
    r = client.get("/v1/plane")
    assert r.status_code == 200
    assert r.json()["name"] == "ModelForge"


def test_probes_without_urls() -> None:
    r = client.get("/v1/probes")
    assert r.status_code == 200
    body = r.json()
    assert body["domainforge"]["configured"] is False
    assert body["llm_gateway"]["configured"] is False
