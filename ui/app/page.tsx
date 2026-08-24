"use client";

import { useEffect, useState } from "react";

type Component = {
  id: string;
  label: string;
  status: string;
  detail: string;
};

type Posture = {
  service: string;
  thesis: string;
  spine_role: string;
  components: Component[];
  non_goals: string[];
};

type Receipt = {
  id: string;
  kind: string;
  title: string;
  status: string;
  summary: string;
  path: string | null;
  links: string[];
};

const API = process.env.NEXT_PUBLIC_API_URL || "";

const DECISIONS = [
  {
    title: "Buy API",
    when: "Long-context reasoning, data class allows cloud, time-to-value beats unit cost.",
  },
  {
    title: "RAG",
    when: "Facts change often; citations required; PEFT would bake stale knowledge.",
  },
  {
    title: "PEFT (QLoRA/DPO)",
    when: "Stable schema/behavior; eval Δ justifies adapter ops (DomainForge → receipt).",
  },
  {
    title: "Self-host SLM / vLLM",
    when: "Privacy, latency, or $ at volume wins bake-off; CUDA metrics on Serve receipt.",
  },
];

function publicReceiptHref(path: string | null): string | null {
  if (!path) return null;
  const name = path.split("/").pop();
  return name ? `/receipts/${name}` : null;
}

export default function HomePage() {
  const [posture, setPosture] = useState<Posture | null>(null);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const base = API.replace(/\/$/, "");
    Promise.all([
      fetch(`${base}/api/v1/posture`).then((r) => r.json()),
      fetch(`${base}/api/v1/receipts`).then((r) => r.json()),
    ])
      .then(([p, rec]) => {
        setPosture(p);
        setReceipts(rec.receipts || []);
      })
      .catch((e) => setError(String(e)));
  }, []);

  const published = receipts.filter((r) => r.status === "published").length;
  const smoke = receipts.filter((r) => r.status === "smoke").length;
  const pending = receipts.filter(
    (r) => r.status === "placeholder" || r.status === "planned",
  ).length;
  const peftReady =
    posture?.components.find((c) => c.id === "peft")?.status === "ready";
  const vllmReady =
    posture?.components.find((c) => c.id === "vllm_cuda")?.status === "ready";
  const gpuReceiptsDone = Boolean(peftReady && vllmReady);

  return (
    <main>
      <div className="hero">
        <div className="pill ready">Model Plane · ADR-034</div>
        <h1>ModelForge</h1>
        <p>
          Hire-facing control surface for SLMs, PEFT, CUDA vLLM, and LLMOps.
          Agents decide what to do — ModelForge decides which weights, where they
          run, and how we prove it.
        </p>
        <p className="hero-meta">
          Live honesty:{" "}
          <strong>{published}</strong> published · <strong>{smoke}</strong> smoke
          · <strong>{pending}</strong> GPU-pending
        </p>
      </div>

      {error ? (
        <p style={{ color: "var(--warn)", marginTop: "1.5rem" }}>
          API unreachable ({error}). Same-origin /api should work on Vercel; for
          local UI-only, run `npm run dev` in ui/.
        </p>
      ) : null}

      <section className="panel-script">
        <h2>30-second CAIO rebuttal</h2>
        <blockquote>
          I am not agents-only. Agents are how work gets done; the{" "}
          <em>model plane</em> is how I decide buy vs RAG vs PEFT vs self-host.
          ModelForge is the control UI — DomainForge trains adapters, CUDA vLLM
          serves them, SLM bake-off proves when small models win, and the LLM
          gateway enforces + records.
        </blockquote>
        <p className="hero-meta">
          Proof links:{" "}
          <a href="https://modelforge-gamma.vercel.app">this demo</a> ·{" "}
          <a href="https://github.com/vpeetla-ai/domainforge-rag-peft">
            DomainForge
          </a>{" "}
          ·{" "}
          <a href="https://github.com/vpeetla-ai/ai-architecture-portfolio/blob/main/adr/ADR-034-modelforge-model-plane.md">
            ADR-034
          </a>
        </p>
      </section>

      <section>
        <h2>Buy · RAG · PEFT · self-host</h2>
        <p className="hero-meta">
          Panel decision tree — pick the cheapest honest path; receipts prove the
          choice.
        </p>
        <div className="grid">
          {DECISIONS.map((d) => (
            <div className="card" key={d.title}>
              <h3>{d.title}</h3>
              <p>{d.when}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginTop: "2rem" }}>
        <h2>Taxonomy glassbox</h2>
        <p style={{ color: "var(--muted)" }}>
          LoRA · QLoRA · Multi-LoRA · task types · classical ML stack — full tabbed taxonomy with
          honesty labels per row.
        </p>
        <p className="hero-meta">
          <a href="/taxonomy">Open taxonomy tab →</a>
          {" · "}
          <a href="https://venkat-ai.com/model-plane">venkat-ai.com/model-plane ↗</a>
        </p>
      </section>

      {posture ? (
        <>
          <p style={{ marginTop: "1.5rem", color: "var(--muted)" }}>
            {posture.thesis}
          </p>
          <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
            {posture.spine_role}
          </p>
          <div className="grid">
            {posture.components.map((c) => (
              <div className="card" key={c.id}>
                <div className={`pill ${c.status}`}>{c.status}</div>
                <h3>{c.label}</h3>
                <p>{c.detail}</p>
              </div>
            ))}
          </div>
        </>
      ) : null}

      <section style={{ marginTop: "2.5rem" }}>
        <h2 style={{ marginBottom: "0.25rem" }}>Receipts</h2>
        <p style={{ color: "var(--muted)", marginTop: 0 }}>
          Published artifacts are clickable. Smoke ≠ GPU. Honesty fields in each
          receipt JSON describe micro-run vs DomainForge 7B ladder depth.
        </p>
        <table>
          <thead>
            <tr>
              <th>Kind</th>
              <th>Title</th>
              <th>Status</th>
              <th>Summary</th>
              <th>Artifact</th>
            </tr>
          </thead>
          <tbody>
            {receipts.map((r) => {
              const href = publicReceiptHref(r.path);
              return (
                <tr key={r.id}>
                  <td>{r.kind}</td>
                  <td>{r.title}</td>
                  <td>
                    <span className={`pill ${r.status}`}>{r.status}</span>
                  </td>
                  <td>{r.summary}</td>
                  <td>
                    {href ? (
                      <a href={href} target="_blank" rel="noreferrer">
                        open
                      </a>
                    ) : (
                      <span style={{ color: "var(--muted)" }}>—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      {gpuReceiptsDone ? (
        <section style={{ marginTop: "2rem" }}>
          <h2>CUDA receipts — published</h2>
          <p style={{ color: "var(--muted)" }}>
            GPU receipts are live: <code>peft_gpu.json</code> and{" "}
            <code>vllm_cuda.json</code> with <code>cuda=true</code> (GCP Tesla
            T4 micro-run). Re-run operator scripts to refresh metrics or upgrade
            to DomainForge 7B ladder depth.
          </p>
          <p className="hero-meta">
            Runbook:{" "}
            <a href="https://github.com/vpeetla-ai/modelforge-llmops/blob/main/docs/RUNPOD_ONE_SHOT.md">
              docs/RUNPOD_ONE_SHOT.md
            </a>
            {" · "}
            <a href="https://github.com/vpeetla-ai/modelforge-llmops/blob/main/docs/OPERATOR_CUDA_UNBLOCK.md">
              operator unblock
            </a>
          </p>
        </section>
      ) : (
        <section style={{ marginTop: "2rem" }}>
          <h2>CUDA receipts — operator unblock</h2>
          <p style={{ color: "var(--muted)" }}>
            This demo host has no NVIDIA GPU. Phases 2–3 flip to{" "}
            <code>ready</code> only after RunPod (or equivalent) produces{" "}
            <code>peft_gpu.json</code> + <code>vllm_cuda.json</code> with{" "}
            <code>cuda=true</code>. Do not mint those files on CPU.
          </p>
          <pre
            style={{
              marginTop: "0.75rem",
              padding: "0.9rem 1rem",
              background: "var(--panel)",
              border: "1px solid var(--line)",
              borderRadius: 10,
              fontSize: "0.82rem",
              overflowX: "auto",
              color: "var(--muted)",
            }}
          >{`export GPU_SKU="1x A100-40GB" HF_TOKEN=...
bash scripts/one_shot_gpu_receipts.sh
# → docs/receipts/peft_gpu.json + vllm_cuda.json
# then: commit, push, vercel --prod`}</pre>
          <p className="hero-meta">
            Runbook:{" "}
            <a href="https://github.com/vpeetla-ai/modelforge-llmops/blob/main/docs/RUNPOD_ONE_SHOT.md">
              docs/RUNPOD_ONE_SHOT.md
            </a>
            {" · "}
            <a href="https://colab.research.google.com/github/vpeetla-ai/modelforge-llmops/blob/main/notebooks/cuda_receipts_colab.ipynb">
              Colab PEFT notebook
            </a>
          </p>
        </section>
      )}

      <section style={{ marginTop: "2rem" }}>
        <h2>FinOps bridge</h2>
        <p style={{ color: "var(--muted)" }}>
          Model choice without metering is incomplete. Bake-off cost narrative
          lands in the SLM memo; shared budgets/breach signals live in{" "}
          <a href="https://github.com/vpeetla-ai/agent-finops">agent-finops</a>{" "}
          (ADR-028/029 gateway records tokens for attribution).
        </p>
      </section>

      {posture ? (
        <section style={{ marginTop: "2rem" }}>
          <h2>Non-goals</h2>
          <ul style={{ color: "var(--muted)" }}>
            {posture.non_goals.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
