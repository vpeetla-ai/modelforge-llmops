import { TaxonomyGlassbox } from "@/components/TaxonomyGlassbox";
import {
  adaptationMethods,
  taskTypes,
  classicalMLStack,
  modelPlaneIntro,
} from "@/lib/taxonomy";

export default function TaxonomyPage() {
  return (
    <main>
      <div className="hero">
        <div className="pill ready">Taxonomy glassbox</div>
        <h1>Model methods & task types</h1>
        <p>
          {modelPlaneIntro.subtitle} Canonical copy also lives on{" "}
          <a href="https://venkat-ai.com/model-plane">venkat-ai.com/model-plane</a>.
        </p>
        <p className="hero-meta">
          {adaptationMethods.length} adaptation methods · {taskTypes.length} task types ·{" "}
          {classicalMLStack.length} classical ML layers
        </p>
      </div>

      <section className="panel-script">
        <h2>DomainForge ↔ ModelForge split</h2>
        <blockquote>
          DomainForge owns the S0→S4 train/eval ladder (QLoRA + DPO). ModelForge owns posture, CUDA
          receipts, SLM bake-off, and this taxonomy — hire-facing control surface, not a second
          training repo.
        </blockquote>
      </section>

      <TaxonomyGlassbox />

      <section style={{ marginTop: "2.5rem" }} className="panel-script">
        <h2>Panel prep — industry question bank</h2>
        <p style={{ color: "var(--muted)", margin: 0 }}>
          30+ archetype questions (LoRA · QLoRA · multi-LoRA · classification vs regression · MLOps
          crossover) with org proof pointers —{" "}
          <a
            href="https://github.com/vpeetla-ai/ai-architect-interview-playbook/blob/main/model-plane/MODEL_PLANE_PANEL_QUESTION_BANK.md"
            target="_blank"
            rel="noreferrer"
          >
            MODEL_PLANE_PANEL_QUESTION_BANK.md
          </a>
          {" · "}
          <a href="https://ai-architect-interview-playbook.vercel.app" target="_blank" rel="noreferrer">
            Study UI → Model Plane
          </a>
        </p>
      </section>
    </main>
  );
}
