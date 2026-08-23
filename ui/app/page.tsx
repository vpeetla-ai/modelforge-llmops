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
};

const API = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8200";

export default function HomePage() {
  const [posture, setPosture] = useState<Posture | null>(null);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch(`${API}/v1/posture`).then((r) => r.json()),
      fetch(`${API}/v1/receipts`).then((r) => r.json()),
    ])
      .then(([p, rec]) => {
        setPosture(p);
        setReceipts(rec.receipts || []);
      })
      .catch((e) => setError(String(e)));
  }, []);

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
      </div>

      {error ? (
        <p style={{ color: "var(--warn)", marginTop: "1.5rem" }}>
          API unreachable at {API}. Start uvicorn on :8200 or set
          NEXT_PUBLIC_API_URL. ({error})
        </p>
      ) : null}

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
          Placeholders until Phases 2–4 publish GPU / bake-off artifacts. Posture
          stays honest.
        </p>
        <table>
          <thead>
            <tr>
              <th>Kind</th>
              <th>Title</th>
              <th>Status</th>
              <th>Summary</th>
            </tr>
          </thead>
          <tbody>
            {receipts.map((r) => (
              <tr key={r.id}>
                <td>{r.kind}</td>
                <td>{r.title}</td>
                <td>{r.status}</td>
                <td>{r.summary}</td>
              </tr>
            ))}
          </tbody>
        </table>
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
