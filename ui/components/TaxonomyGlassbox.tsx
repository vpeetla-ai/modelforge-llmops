"use client";

import { useState } from "react";
import {
  TAXONOMY_TABS,
  STATUS_LABELS,
  adaptationMethods,
  taskTypes,
  solutionLadder,
  classicalMLStack,
  composeMap,
  type TaxonomyRow,
  type TaxonomyStatus,
  type TaxonomyTabId,
} from "@/lib/taxonomy";

const STATUS_CLASS: Record<TaxonomyStatus, string> = {
  live: "pill ready",
  receipt: "pill ready",
  educational: "pill smoke",
  playbook: "pill external",
  planned: "pill placeholder",
};

function RowCard({ row }: { row: TaxonomyRow }) {
  const [open, setOpen] = useState(false);
  return (
    <article className="tax-card">
      <button type="button" className="tax-card-head" onClick={() => setOpen(!open)} aria-expanded={open}>
        <div>
          <span className={`pill ${STATUS_CLASS[row.status]}`}>{STATUS_LABELS[row.status]}</span>
          <h3>{row.label}</h3>
          <p className="tax-platform">{row.platform}</p>
        </div>
        <span className="tax-chevron">{open ? "−" : "+"}</span>
      </button>
      {open ? (
        <div className="tax-card-body">
          <p>{row.summary}</p>
          <p className="tax-limit">{row.limitation}</p>
          {row.href ? (
            <a href={row.href} target="_blank" rel="noreferrer">
              Open proof →
            </a>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

export function TaxonomyGlassbox() {
  const [tab, setTab] = useState<TaxonomyTabId>("adaptation");

  return (
    <div className="taxonomy-shell">
      <div className="taxonomy-tabs">
        {TAXONOMY_TABS.filter((t) => t.id !== "overview").map((t) => (
          <button
            key={t.id}
            type="button"
            className={tab === t.id ? "taxonomy-tab active" : "taxonomy-tab"}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "adaptation" ? (
        <div className="tax-list">
          <p className="tax-lede">LoRA · QLoRA · Multi-LoRA · regular/base · DPO — status per platform.</p>
          {adaptationMethods.map((r) => (
            <RowCard key={r.id} row={r} />
          ))}
        </div>
      ) : null}

      {tab === "tasks" ? (
        <div className="tax-list">
          <p className="tax-lede">LLM vs classical ML task types — including eval regression vs tabular regression.</p>
          {taskTypes.map((r) => (
            <RowCard key={r.id} row={r} />
          ))}
        </div>
      ) : null}

      {tab === "ladder" ? (
        <table>
          <thead>
            <tr>
              <th>Step</th>
              <th>Method</th>
              <th>Plane</th>
              <th>Metrics</th>
            </tr>
          </thead>
          <tbody>
            {solutionLadder.map((s) => (
              <tr key={s.id}>
                <td>
                  {s.href ? (
                    <a href={s.href} target="_blank" rel="noreferrer">
                      {s.label}
                    </a>
                  ) : (
                    s.label
                  )}
                </td>
                <td>{s.method}</td>
                <td>{s.plane}</td>
                <td>{s.metrics}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}

      {tab === "classical" ? (
        <ol className="classical-stack">
          {classicalMLStack.map((l) => (
            <li key={l.id}>
              <div>
                <strong>{l.layer}</strong>
                <p>{l.capability}</p>
              </div>
              <a href={l.playbookHref} target="_blank" rel="noreferrer">
                Playbook →
              </a>
            </li>
          ))}
        </ol>
      ) : null}

      {tab === "compose" ? (
        <div className="compose-grid">
          {composeMap.map((n) => (
            <a key={n.id} href={n.href} className="card compose-card" target="_blank" rel="noreferrer">
              <span className={`pill ${STATUS_CLASS[n.status]}`}>{STATUS_LABELS[n.status]}</span>
              <h3>{n.name}</h3>
              <p>{n.role}</p>
            </a>
          ))}
        </div>
      ) : null}
    </div>
  );
}
