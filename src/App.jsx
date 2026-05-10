import { useState, useRef, useEffect } from "react";
import Cal, { getCalApi } from "@calcom/embed-react";

const PKR = 280;

const TIERS = [
    {
        id: "rule",
        label: "Tier I",
        name: "Rule-Based Bot",
        subtitle: "Scripted decision trees and keyword-matched flows",
        complexity: "Low",
        timeline: "2 – 3 weeks",
        devUSD: [650, 1250],
        runUSD: [0, 18],
        model: "No LLM required",
        modelNote: "Flat-rate platform fee (Botpress / Voiceflow) or open-source self-hosted.",
        stack: ["Botpress / Voiceflow", "WhatsApp Cloud API", "Node.js Webhook", "No vector database"],
        description:
            "A rule-based bot follows a fixed script. It matches user input against predefined keywords or button selections and returns a predetermined response. There is no language model, no <span class='tt' data-def='The act of running a model to produce an output. Every response requires inference.'>inference</span>, and no reasoning. It is entirely deterministic — the same input always produces the same output.",
        useCases: [
            "Product FAQ and business hours",
            "Order status lookup via webhook",
            "Lead qualification via button flows",
            "Appointment slot selection",
        ],
        pros: [
            "Lowest cost to build and operate",
            "Fully predictable and auditable outputs",
            "No hallucination risk — only authored content is served",
            "No ongoing model API costs",
        ],
        cons: [
            "Cannot handle any input outside its scripted paths",
            "Fails silently on open-ended questions",
            "Requires manual rule updates as the business evolves",
            "Unsuitable for complex or nuanced conversations",
        ],
        requirements: [
            "WhatsApp Business Account (verified green tick preferred)",
            "Website domain access for widget embed script",
            "Minimum 30 written FAQ pairs, reviewed and approved by client",
            "Process flowcharts or existing call scripts",
            "Brand voice and tone guidelines (written)",
            "Named content owner for ongoing updates",
        ],
    },
    {
        id: "llm",
        label: "Tier II",
        name: "LLM-Powered Bot",
        subtitle: "Direct large language model integration with a system-prompted persona",
        complexity: "Moderate",
        timeline: "3 – 5 weeks",
        devUSD: [1250, 3000],
        runUSD: [50, 300],
        model: "Claude Sonnet 4.6 / GPT-5.2",
        modelNote: "Claude Sonnet 4.6 at $3.00/M input · $15.00/M output. GPT-5.2 at $1.75/M input · $14.00/M output.",
        stack: ["Claude Sonnet 4.6 or GPT-5.2", "Next.js frontend", "Node.js API layer", "Supabase or Firebase"],
        description:
            "An LLM-powered bot routes each user message directly to a large language model. A system prompt defines its persona, scope, and constraints. The model reasons over the conversation history and generates a contextually appropriate response. No external knowledge retrieval is involved — the model responds from its training and the active context window.",
        useCases: [
            "Customer support for general product enquiries",
            "Sales conversation and objection handling",
            "Internal staff assistant for policies and procedures",
            "Onboarding guide and product walk-through",
        ],
        pros: [
            "Natural, open-ended conversations with no scripting required",
            "Fast to deploy — days not months once requirements are defined",
            "Behaviour tunable through system prompt iteration",
            "Minimal infrastructure overhead",
        ],
        cons: [
            "No access to your proprietary documents or real-time data",
            "Risk of hallucination on specific business facts",
            "Token costs scale directly with conversation volume",
            "Context window limits multi-session memory",
        ],
        requirements: [
            "Brand tone and persona definition (written brief)",
            "API budget approval — Insurgo provisions and manages the key",
            "Cloud hosting approval (AWS / Vercel / Railway)",
            "CRM credentials if integration is required",
            "Internal testing group of 5–10 users for acceptance testing",
            "Defined escalation path for queries the bot cannot resolve",
        ],
    },
    {
        id: "rag",
        label: "Tier III",
        name: "RAG Knowledge Bot",
        subtitle: "Retrieval-augmented generation grounded in your proprietary documents",
        complexity: "High",
        timeline: "6 – 10 weeks",
        devUSD: [2500, 7000],
        runUSD: [100, 500],
        model: "Claude Sonnet 4.6",
        modelNote: "Claude Sonnet 4.6 at $3.00/M input · $15.00/M output. Pinecone vector DB approx. $70/mo base plan.",
        stack: ["Claude Sonnet 4.6", "LangChain / LlamaIndex", "Pinecone or Weaviate", "Next.js + Tailwind CSS"],
        description:
            "A <span class='tt' data-def='Retrieval-Augmented Generation. This grounds the model in your actual documents.'>RAG</span> bot adds a retrieval layer between the user and the language model. When a query arrives, the system searches a <span class='tt' data-def='A database that stores text as mathematical vectors for similarity search.'>vector database</span> of your indexed documents, extracts the most relevant passages, and passes them as context to the model. The model then generates a response grounded in your actual content — not its training data. This eliminates hallucination on covered topics and allows the knowledge base to be updated without retraining the model.",
        useCases: [
            "Legal or compliance Q&A over internal policy documents",
            "Real estate listing search and recommendations",
            "Product catalog intelligent search with specifications",
            "HR policy, benefits, and onboarding knowledge base",
        ],
        pros: [
            "Responses grounded in your actual documents and data",
            "Near-zero hallucination on topics your knowledge base covers",
            "Knowledge base updates in real time without retraining",
            "Scales to thousands of documents with maintained accuracy",
        ],
        cons: [
            "Retrieval quality is sensitive to document structure and chunking",
            "Significantly more complex to build, test, and maintain",
            "Vector database adds a recurring monthly infrastructure cost",
            "Requires a structured document ingestion and update pipeline",
        ],
        requirements: [
            "Complete document library: PDFs, Word docs, spreadsheets — organised and current",
            "Defined access control: which documents the bot may access vs. restricted",
            "Vector DB subscription sign-off (Pinecone at approx. PKR 19,600 / mo)",
            "Named document owner responsible for update cadence",
            "Domain expert availability for knowledge-base validation sessions",
            "Cloud hosting and API budget approval",
            "Acceptance testing group with relevant domain knowledge",
        ],
    },
    {
        id: "agentic",
        label: "Tier IV",
        name: "Agentic AI System",
        subtitle: "Autonomous multi-step reasoning with tool use, memory, and system integrations",
        complexity: "Enterprise",
        timeline: "12 – 20 weeks",
        devUSD: [7000, 20000],
        runUSD: [300, 1500],
        model: "Claude Opus 4.6",
        modelNote: "Claude Opus 4.6 at $15.00/M input · $75.00/M output. Infrastructure and integration costs are additional.",
        stack: ["Claude Opus 4.6", "Multi-agent orchestration layer", "Long-term memory store", "CRM / ERP / API integrations"],
        description:
            "An <span class='tt' data-def='AI that can plan, reason, and execute tasks autonomously.'>agentic</span> system does not merely respond — it plans and executes. The AI decomposes a user goal into sub-tasks, selects and calls tools (APIs, databases, calendars, CRM systems), evaluates intermediate results, and iterates until the objective is met. It maintains memory across sessions and can initiate follow-up actions autonomously. This architecture is required when the chatbot must operate as a digital team member — not just an information service.",
        useCases: [
            "Autonomous sales pipeline agent with CRM updates and follow-up scheduling",
            "IT helpdesk agent that opens, routes, and resolves tickets without human handoff",
            "End-to-end booking and fulfilment orchestration across third-party platforms",
            "Multi-channel marketing automation with dynamic personalisation",
        ],
        pros: [
            "Takes real actions inside your business systems",
            "Connects to any external system with an API or webhook",
            "Handles complex, multi-step workflows spanning minutes to hours",
            "Long-term memory enables continuity across sessions and users",
        ],
        cons: [
            "Highest build cost and highest ongoing operational cost",
            "Requires robust error handling, retry logic, and human override paths",
            "Longer QA, red-teaming, and safety review cycles before go-live",
            "Requires a technically capable liaison on the client side",
        ],
        requirements: [
            "CRM / ERP API documentation and sandbox plus production admin credentials",
            "Webhook endpoint access on all integrated third-party systems",
            "Dedicated technical liaison on the client side (minimum 4 hrs / week)",
            "Formal staging environment separate from production",
            "Data privacy and security review sign-off before build commences",
            "Defined SLA, escalation path, and human override protocol",
            "6-week parallel run with human oversight before full autonomous handover",
            "All Tier III requirements listed above apply",
        ],
    },
];

const MODELS = [
    { name: "Gemini 2.5 Flash-Lite", inM: 0.10, outM: 0.40, tier: "Budget" },
    { name: "Claude Haiku 4.5", inM: 0.80, outM: 4.00, tier: "Standard" },
    { name: "Claude Sonnet 4.6", inM: 3.00, outM: 15.00, tier: "Premium" },
    { name: "Claude Opus 4.6", inM: 15.00, outM: 75.00, tier: "Enterprise" },
];

const QUESTIONS = [
    {
        id: "goal",
        text: "What is the primary goal of this chatbot?",
        options: [
            { label: "Automate repetitive FAQ and scripted conversation flows", scores: [3, 0, 0, 0] },
            { label: "Hold natural, open-ended conversations with customers", scores: [0, 3, 0, 0] },
            { label: "Answer questions based on our internal documents and data", scores: [0, 0, 3, 0] },
            { label: "Automate multi-step tasks and take actions inside systems", scores: [0, 0, 0, 3] },
        ],
    },
    {
        id: "data",
        text: "Does the bot need to reference your proprietary documents, product data, or internal databases?",
        options: [
            { label: "No — general knowledge or authored responses are sufficient", scores: [2, 2, 0, 0] },
            { label: "Yes — it must draw from our specific files and records", scores: [0, 0, 3, 1] },
        ],
    },
    {
        id: "actions",
        text: "Should the bot take actions — booking appointments, sending emails, updating records, or calling external APIs?",
        options: [
            { label: "No — providing answers and information is sufficient", scores: [2, 2, 2, 0] },
            { label: "Yes — it must perform tasks inside our systems", scores: [0, 0, 0, 3] },
        ],
    },
    {
        id: "volume",
        text: "What is your expected monthly conversation volume?",
        options: [
            { label: "Under 5,000 conversations", scores: [3, 2, 1, 0] },
            { label: "5,000 – 50,000 conversations", scores: [1, 3, 2, 1] },
            { label: "50,000 – 200,000 conversations", scores: [0, 1, 2, 2] },
            { label: "Over 200,000 conversations", scores: [0, 0, 1, 3] },
        ],
    },
    {
        id: "budget",
        text: "What is your monthly operating budget for this system — <span class='tt' data-def='The fees paid to AI providers for processing text.'>API</span>, hosting, and maintenance combined?",
        options: [
            { label: "Starter: under PKR 50,000 / month", scores: [3, 1, 0, 0] },
            { label: "Growth: PKR 50,000 – 200,000 / month", scores: [1, 3, 1, 0] },
            { label: "Scale: PKR 200,000 – 500,000 / month", scores: [0, 1, 3, 1] },
            { label: "Enterprise: over PKR 500,000 / month", scores: [0, 0, 1, 3] },
        ],
    },
    {
        id: "timeline",
        text: "When do you need the system live?",
        options: [
            { label: "Immediately — under 4 weeks", scores: [3, 2, 0, 0] },
            { label: "1 – 3 months", scores: [1, 3, 2, 0] },
            { label: "3 – 6 months", scores: [0, 1, 3, 2] },
            { label: "Flexible — quality over speed", scores: [0, 0, 1, 2] },
        ],
    },
];

function calcCost(m, n) {
    return (n * 500 * m.inM + n * 300 * m.outM) / 1_000_000;
}

function fmt(usd, currency) {
    return currency === "PKR"
        ? "PKR " + Math.round(usd * PKR).toLocaleString("en-PK")
        : "$" + usd.toLocaleString();
}

/* ─── MERMAID LOADER ────────────────────────────── */
let mermaidReady = null;

function loadMermaid() {
    if (mermaidReady) return mermaidReady;
    mermaidReady = new Promise((resolve) => {
        if (window.mermaid) { resolve(window.mermaid); return; }
        const s = document.createElement("script");
        s.src = "https://cdnjs.cloudflare.com/ajax/libs/mermaid/10.9.1/mermaid.min.js";
        s.onload = () => {
            window.mermaid.initialize({
                startOnLoad: false,
                theme: "base",
                themeVariables: {
                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                    fontSize: "13px",
                    primaryColor: "#181818",
                    primaryBorderColor: "#2e2e2e",
                    primaryTextColor: "#e6e4df",
                    lineColor: "#444444",
                    edgeLabelBackground: "#101010",
                    secondaryColor: "#141414",
                    tertiaryColor: "#141414",
                    background: "#101010",
                    mainBkg: "#181818",
                    nodeBorder: "#333333",
                    clusterBkg: "#141414",
                    clusterBorder: "#2e2e2e",
                    titleColor: "#e6e4df",
                    attributeBackgroundColorEven: "#181818",
                    attributeBackgroundColorOdd: "#141414",
                },
            });
            resolve(window.mermaid);
        };
        document.head.appendChild(s);
    });
    return mermaidReady;
}

let diagramCounter = 0;

function MermaidDiagram({ chart, caption }) {
    const ref = useRef(null);
    const id = useRef("md_" + ++diagramCounter).current;
    const [err, setErr] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        loadMermaid().then(async (m) => {
            if (cancelled || !ref.current) return;
            try {
                const { svg } = await m.render(id, chart);
                if (!cancelled && ref.current) {
                    ref.current.innerHTML = svg;
                    // make SVG responsive
                    const svgEl = ref.current.querySelector("svg");
                    if (svgEl) {
                        svgEl.removeAttribute("height");
                        svgEl.style.maxWidth = "100%";
                        svgEl.style.height = "auto";
                    }
                    setLoading(false);
                }
            } catch (e) {
                if (!cancelled) { setErr(e.message); setLoading(false); }
            }
        });
        return () => { cancelled = true; };
    }, [chart, id]);

    return (
        <div>
            <div style={{ position: "relative", minHeight: loading ? 120 : 0 }}>
                {loading && !err && (
                    <div style={{ padding: "40px 0", textAlign: "center", color: "var(--dim)", fontSize: 12, fontFamily: "var(--mono)", letterSpacing: "0.08em" }}>
                        Rendering diagram…
                    </div>
                )}
                {err && (
                    <div style={{ padding: "16px", background: "var(--s2)", border: "1px solid var(--border)", color: "var(--dim)", fontSize: 12 }}>
                        Could not render diagram.
                    </div>
                )}
                <div ref={ref} style={{ display: loading ? "none" : "block" }} />
            </div>
            {caption && (
                <div style={{ marginTop: 10, fontSize: 11.5, color: "var(--dim)", fontStyle: "italic", lineHeight: 1.6 }}>
                    {caption}
                </div>
            )}
        </div>
    );
}

/* ─── FLOW DIAGRAMS DATA ────────────────────────── */
const FLOWS = [
    {
        id: "rule",
        label: "Tier I",
        name: "Rule-Based Bot",
        description: "Every message is matched against a fixed library of keywords or button selections. If a match is found, the corresponding scripted response is returned. If no rule applies, a fallback message is shown. There is no intelligence — only pattern matching.",
        chart: `flowchart LR
  A["User Input"] --> B["Keyword &amp; Button Matcher"]
  B --> C{"Rule Found?"}
  C -->|"Yes"| D["Scripted Response\nfrom Rule Library"]
  C -->|"No"| E["Fallback Message\nor Human Escalation"]
  D --> F["WhatsApp / Web Widget"]
  E --> F`,
        caption: "Entirely deterministic. The same input always produces the same output. No AI inference occurs at any point in this flow.",
    },
    {
        id: "llm",
        label: "Tier II",
        name: "LLM-Powered Bot",
        description: "Each incoming message is assembled with the system prompt and full conversation history, then sent to the language model API. The model reasons over the full context and generates a response. A session store maintains conversation continuity across turns within a session.",
        chart: `flowchart LR
  A["User Message"] --> B["API Layer\nNode.js"]
  G["Session Store\nSupabase"] <-->|"Read / Write History"| B
  B --> C["Context Assembly"]
  P["System Prompt\n& Persona"] --> C
  C --> D["LLM\nClaude Sonnet 4.6"]
  D --> E["Generated Response"]
  E --> F["User"]`,
        caption: "The model never reads your private documents — it reasons from its training data and whatever context is assembled in the system prompt.",
    },
    {
        id: "rag",
        label: "Tier III",
        name: "RAG Knowledge Bot",
        description: "Before the LLM is called, the user's query is converted into a vector embedding and used to search your indexed document library. The most relevant passages are retrieved and injected into the model's context window alongside the system prompt and conversation history. The model is then instructed to answer using only the retrieved content.",
        chart: `flowchart LR
  DOCS["Your Documents\nPDFs, Sheets, Policies"] -->|"Chunk & Embed\non ingest"| VDB
  A["User Query"] --> EMB["Embedding Model"]
  EMB -->|"Query Vector"| VDB["Vector Database\nPinecone"]
  VDB -->|"Top K Relevant Chunks"| CTX["Context Assembly"]
  SYS["System Prompt"] --> CTX
  HIST["Chat History"] --> CTX
  CTX --> LLM["LLM\nClaude Sonnet 4.6"]
  LLM --> ANS["Grounded Answer"]
  ANS --> USR["User"]`,
        caption: "The model's answer is anchored to passages retrieved from your actual documents. If your knowledge base does not cover a topic, the model is instructed to say so.",
    },
    {
        id: "agentic",
        label: "Tier IV",
        name: "Agentic AI System",
        description: "The user states a high-level goal. The orchestrator agent decomposes it into sub-tasks and selects the appropriate tools to call — retrieving documents, querying your CRM, sending notifications, or updating records. Results are fed back into the orchestrator, which iterates until the goal is fully met. Human override is available at any point.",
        chart: `flowchart TD
  A["User Goal"] --> ORCH["Orchestrator Agent\nClaude Opus 4.6"]
  ORCH --> PLAN["Decompose into Sub-tasks"]
  PLAN --> T1["Tool: Search\nDocument Store"]
  PLAN --> T2["Tool: Query / Update\nCRM & ERP"]
  PLAN --> T3["Tool: Send\nEmail / WhatsApp"]
  T1 --> AGG["Aggregate Results"]
  T2 --> AGG
  T3 --> AGG
  AGG --> ORCH
  ORCH --> CHK{"Goal\nComplete?"}
  CHK -->|"No — iterate"| PLAN
  CHK -->|"Yes"| RESP["Response + Actions\nConfirmed to User"]
  ORCH -.->|"Override available\nat any step"| HUM["Human\nEscalation"]`,
        caption: "Unlike the tiers above, the agentic system does not wait for the user to confirm each step. It acts autonomously — making real changes in your connected systems — until the goal is satisfied or an override is triggered.",
    },
];

function FlowDiagramsTab() {
    const [active, setActive] = useState("rule");
    const flow = FLOWS.find(f => f.id === active);

    return (
        <div className="fade">
            <div className="sl">Architecture Flow Diagrams</div>
            <p style={{ fontSize: 13, color: "var(--sub)", lineHeight: 1.75, maxWidth: 580, marginBottom: 28 }}>
                Step-by-step data flow for each architecture tier. Select a tier below to view how a user message travels through the system from input to response.
            </p>

            {/* Tier selector */}
            <div style={{ display: "flex", gap: 0, marginBottom: 32, flexWrap: "wrap" }}>
                {FLOWS.map((f, i) => (
                    <button
                        key={f.id}
                        onClick={() => setActive(f.id)}
                        style={{
                            padding: "9px 18px",
                            fontFamily: "var(--mono)",
                            fontSize: 10, fontWeight: 500,
                            letterSpacing: "0.08em", textTransform: "uppercase",
                            cursor: "pointer",
                            border: "1px solid",
                            marginLeft: i > 0 ? -1 : 0,
                            borderColor: active === f.id ? "var(--accent)" : "var(--border2)",
                            background: active === f.id ? "rgba(251,12,12,0.08)" : "var(--s1)",
                            color: active === f.id ? "var(--accent)" : "var(--sub)",
                            transition: "all 0.15s",
                            zIndex: active === f.id ? 1 : 0,
                            position: "relative",
                        }}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Active flow */}
            {flow && (
                <div key={flow.id} className="fade">
                    {/* Header */}
                    <div style={{ marginBottom: 20 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                            <span style={{ width: 3, height: 16, background: "var(--accent)", display: "inline-block", flexShrink: 0 }} />
                            <h2 className="serif" style={{ fontSize: 20, fontWeight: 700, color: "var(--text)", margin: 0 }}>{flow.name}</h2>
                        </div>
                        <p style={{ fontSize: 13.5, color: "var(--sub)", lineHeight: 1.8, maxWidth: 680, marginLeft: 13 }}>
                            {flow.description}
                        </p>
                    </div>

                    {/* Diagram */}
                    <div style={{
                        background: "var(--s1)",
                        border: "1px solid var(--border)",
                        padding: "28px 24px",
                        marginBottom: 0,
                        overflowX: "auto",
                    }}>
                        <MermaidDiagram chart={flow.chart} caption={flow.caption} />
                    </div>

                    {/* Legend */}
                    <div style={{
                        marginTop: 16,
                        display: "flex", gap: 22, flexWrap: "wrap",
                        padding: "14px 16px",
                        border: "1px solid var(--border)",
                        background: "var(--s2)",
                    }}>
                        {[
                            { shape: "rect", label: "Process / System component" },
                            { shape: "diamond", label: "Decision point" },
                            { shape: "arrow", label: "Data or message flow" },
                            { shape: "dashed", label: "Optional / escalation path" },
                        ].map(item => (
                            <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <span style={{
                                    display: "inline-block", flexShrink: 0,
                                    width: item.shape === "diamond" ? 10 : item.shape === "arrow" || item.shape === "dashed" ? 22 : 10,
                                    height: item.shape === "diamond" ? 10 : 2,
                                    background: item.shape === "dashed" ? "transparent" : "var(--dim)",
                                    borderTop: item.shape === "dashed" ? "1.5px dashed var(--dim)" : undefined,
                                    transform: item.shape === "diamond" ? "rotate(45deg)" : undefined,
                                    border: item.shape === "rect" ? "1px solid var(--dim)" : undefined,
                                }} />
                                <span style={{ fontSize: 11, color: "var(--dim)", fontFamily: "var(--mono)", letterSpacing: "0.04em" }}>
                                    {item.label}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Cross-nav to other tabs */}
                    <div style={{ marginTop: 24, display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 12, color: "var(--dim)", alignSelf: "center" }}>View full detail →</span>
                        <button onClick={() => { }} style={{
                            padding: "7px 16px", background: "transparent",
                            border: "1px solid var(--border2)", color: "var(--sub)",
                            fontSize: 11, cursor: "default", fontFamily: "var(--font)",
                        }}>
                            Architecture Guide contains system requirements, pros, cons &amp; stack for this tier
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

const GLOSSARY = [
    {
        category: "Artificial Intelligence & Language Models",
        terms: [
            {
                term: "Large Language Model",
                abbr: "LLM",
                definition:
                    "A neural network trained on vast quantities of text data that can understand and generate human language. LLMs such as Claude and GPT do not follow scripts — they reason over the full conversation context and produce statistically likely, contextually appropriate responses. The quality and behaviour of an LLM is shaped primarily by its training data, fine-tuning, and the system prompt supplied at runtime.",
            },
            {
                term: "System Prompt",
                abbr: null,
                definition:
                    "A set of instructions supplied to an LLM before any user message is sent. It defines the model's persona, scope, tone, constraints, and operational rules. The user never sees the system prompt. For example: 'You are a support agent for Acme Ltd. Only answer questions about our products. Never discuss competitors.' System prompt engineering is the primary method of customising LLM behaviour without retraining the model.",
            },
            {
                term: "Inference",
                abbr: null,
                definition:
                    "The act of running a trained model to produce an output from a given input. Inference is what happens every time a user sends a message and the model generates a reply. It is computationally expensive — this is why API providers charge per token rather than per request. Inference cost is distinct from training cost; deploying an existing model requires only inference.",
            },
            {
                term: "Hallucination",
                abbr: null,
                definition:
                    "When a language model generates a confident, fluent, and plausible-sounding response that is factually incorrect or entirely fabricated. Hallucination is an inherent property of generative models — they predict probable text, not verified facts. It is mitigated through retrieval-augmented generation (RAG), grounding responses in real documents, and careful prompt design. It cannot be fully eliminated in pure LLM deployments without external grounding.",
            },
            {
                term: "Fine-tuning",
                abbr: null,
                definition:
                    "A training process in which a pre-trained LLM is further trained on a smaller, domain-specific dataset to adjust its behaviour, style, or knowledge. Fine-tuning is expensive (compute + time), requires careful data curation, and the model's knowledge becomes static at the point of training. For most business chatbot use cases, RAG is preferred over fine-tuning because it allows knowledge updates without retraining.",
            },
            {
                term: "Prompt Caching",
                abbr: null,
                definition:
                    "A feature offered by API providers (including Anthropic) that stores the processed representation of a repeated prompt prefix — such as a long system prompt or a fixed document — so it does not need to be recomputed on every request. Cached input tokens are charged at a significant discount (typically 80–90% less than standard input pricing). At high volume, caching is one of the most effective cost-reduction strategies available.",
            },
            {
                term: "Context Window",
                abbr: null,
                definition:
                    "The maximum amount of text — measured in tokens — that a model can process in a single request, encompassing the system prompt, conversation history, retrieved documents, and the user's latest message. If the total exceeds the context window, older content must be truncated or summarised. A larger context window allows longer conversations and more retrieved context, but also increases per-request token costs.",
            },
        ],
    },
    {
        category: "Tokens & Pricing",
        terms: [
            {
                term: "Token",
                abbr: null,
                definition:
                    "The unit of text that language models process. Tokenisation splits text into chunks — roughly one token per four characters, or approximately three-quarters of a word in English. 'Hello, how are you?' is approximately six tokens. API pricing is denominated in tokens per million (1M), charged separately for input (what you send) and output (what the model generates). Output tokens cost significantly more because generation is computationally heavier than reading.",
            },
            {
                term: "Input Tokens",
                abbr: null,
                definition:
                    "All text sent to the model in a single request: the system prompt, conversation history, retrieved document passages, and the user's message. Input tokens are processed by the model but not generated — they are read. Input pricing is typically 3–10× cheaper than output pricing per token because reading is computationally less expensive than generation.",
            },
            {
                term: "Output Tokens",
                abbr: null,
                definition:
                    "The text generated by the model in its response. Output tokens are produced one at a time through a process called autoregressive generation — each token is predicted based on all preceding tokens. This is computationally intensive, which is why output tokens carry a higher price per unit than input tokens. Response length is the primary driver of output cost.",
            },
            {
                term: "Hybrid Routing",
                abbr: null,
                definition:
                    "An architecture pattern in which an orchestration layer classifies each incoming query by complexity and routes it to the appropriate model. Simple, high-confidence queries (e.g. opening hours, return policy) are handled by a fast, cheap model such as Claude Haiku. Complex, nuanced queries are escalated to a premium model such as Claude Sonnet or Opus. At scale, hybrid routing can reduce per-message costs by 60–80% while maintaining response quality.",
            },
        ],
    },
    {
        category: "Retrieval-Augmented Generation",
        terms: [
            {
                term: "Retrieval-Augmented Generation",
                abbr: "RAG",
                definition:
                    "An architecture that augments an LLM's response with relevant information retrieved from an external knowledge source at query time. When a user asks a question, the system searches a vector database for the most semantically similar passages from your documents, injects those passages into the model's context window, and instructs the model to answer using only that retrieved content. This grounds the model's response in your actual data and dramatically reduces hallucination on covered topics.",
            },
            {
                term: "Vector Embedding",
                abbr: null,
                definition:
                    "A numerical representation of a piece of text as a high-dimensional vector (a list of numbers). An embedding model converts words, sentences, or document chunks into these vectors such that semantically similar texts produce similar vectors. This allows mathematical similarity search: 'What is your refund policy?' will produce a vector close to the passage in your documents that describes refunds, even if the exact words differ. Embeddings are the foundation of semantic search in RAG systems.",
            },
            {
                term: "Vector Database",
                abbr: null,
                definition:
                    "A specialised database designed to store, index, and query high-dimensional vector embeddings at speed. Given a query vector, a vector database returns the k most similar stored vectors (nearest-neighbour search) in milliseconds, even across millions of documents. Common providers include Pinecone, Weaviate, and Chroma. In a RAG pipeline, the vector database is the retrieval engine that finds relevant document passages before the LLM generates a response.",
            },
            {
                term: "Chunking",
                abbr: null,
                definition:
                    "The process of splitting source documents into smaller, fixed or semantically bounded segments before embedding and indexing them. Chunk size is a critical tuning parameter in RAG systems: chunks that are too small lose context; chunks that are too large dilute relevance and consume context window budget. Common strategies include fixed token windows (e.g. 512 tokens with 10% overlap), sentence-boundary splitting, and semantic paragraph chunking.",
            },
            {
                term: "Semantic Search",
                abbr: null,
                definition:
                    "Search based on meaning and intent rather than exact keyword matching. A keyword search for 'refund' will only find documents containing that exact word. A semantic search for 'refund' will also surface documents about 'returns', 'money back', and 'cancellation policy' because their embeddings are mathematically close. Semantic search is how RAG systems retrieve relevant passages even when the user's phrasing does not exactly match the document's language.",
            },
        ],
    },
    {
        category: "Agentic Systems",
        terms: [
            {
                term: "Agentic AI",
                abbr: null,
                definition:
                    "An AI system that does not merely generate text responses but plans and executes multi-step tasks autonomously. An agentic system is given a goal, decomposes it into sub-tasks, selects and calls tools (APIs, databases, search engines, calendars), evaluates intermediate results, and iterates until the objective is met. Unlike a chatbot, an agentic system can take actions with real-world consequences — booking appointments, sending emails, updating records — without human approval at each step.",
            },
            {
                term: "Multi-agent Orchestration",
                abbr: null,
                definition:
                    "A pattern in which multiple specialised AI agents collaborate under a central orchestrator to complete a complex task. Each agent handles a specific domain — one might retrieve documents, another interpret data, another draft communications, another execute API calls. The orchestrator decomposes the goal, delegates sub-tasks, and aggregates results. This enables parallelism and specialisation but adds significant architectural complexity and requires robust error handling between agents.",
            },
            {
                term: "Tool Use",
                abbr: null,
                definition:
                    "A capability in modern LLMs that allows the model to call external functions or APIs during its reasoning process. The model is given a list of available tools (e.g. 'search_crm', 'send_email', 'get_calendar_slots') with their parameters. When the model determines it needs external information or must perform an action, it emits a structured tool call rather than a text response. The result is returned to the model, which then continues its reasoning. Tool use is the mechanism that enables agentic behaviour.",
            },
            {
                term: "Long-term Memory",
                abbr: null,
                definition:
                    "The ability of an AI system to retain information about a user or task across multiple separate conversations. Unlike the context window (which resets between sessions), long-term memory is stored externally — in a database or vector store — and selectively retrieved and injected into the context at the start of each new session. This allows the system to remember prior preferences, past decisions, and ongoing objectives across days or weeks.",
            },
            {
                term: "Red-teaming",
                abbr: null,
                definition:
                    "A structured adversarial testing process in which a team attempts to elicit harmful, incorrect, or unintended behaviour from an AI system before it is deployed. Red-teamers probe the system with edge cases, prompt injection attempts, misleading inputs, and out-of-scope requests to identify failure modes. For agentic systems — where the AI can take real-world actions — red-teaming is mandatory before go-live to prevent costly or irreversible automated errors.",
            },
        ],
    },
    {
        category: "Infrastructure & Frameworks",
        terms: [
            {
                term: "API",
                abbr: "Application Programming Interface",
                definition:
                    "A defined interface that allows two software systems to communicate. When we say a chatbot 'calls the Claude API', we mean the chatbot sends a structured HTTP request to Anthropic's servers and receives the model's response as structured data. APIs are the connective tissue of modern software: they allow a chatbot to query a CRM, trigger a booking system, or retrieve live inventory data without any of those systems needing direct integration with each other.",
            },
            {
                term: "Webhook",
                abbr: null,
                definition:
                    "A mechanism by which one system notifies another in real time when a specific event occurs. Rather than polling (repeatedly asking 'has anything changed?'), a webhook sends an HTTP POST request to a specified URL the moment an event fires. Example: when a customer submits an order, an e-commerce platform fires a webhook to the chatbot backend with the order details, allowing the bot to respond immediately with a confirmation.",
            },
            {
                term: "Node.js",
                abbr: null,
                definition:
                    "A JavaScript runtime environment that executes JavaScript code outside a web browser, on a server. Node.js is the most common backend choice for chatbot API layers because it handles concurrent connections efficiently, has a vast package ecosystem (npm), and allows developers to use the same language across frontend and backend. It is used to build the middleware layer that sits between the chat interface and the LLM API.",
            },
            {
                term: "Next.js",
                abbr: null,
                definition:
                    "A React-based web framework that supports both server-side rendering and client-side rendering. Next.js is used to build the frontend chat interface and, in many chatbot architectures, doubles as the API layer through its built-in server routes. It is the standard choice for production-grade AI chat interfaces because it handles routing, performance optimisation, and deployment concerns out of the box.",
            },
            {
                term: "LangChain",
                abbr: null,
                definition:
                    "An open-source orchestration framework for building applications with large language models. LangChain provides pre-built abstractions for common LLM patterns: RAG pipelines, memory management, tool use, and agent loops. It reduces the engineering effort required to connect an LLM to a vector database, structure multi-step chains, or implement agentic behaviour. LlamaIndex is an alternative framework with similar goals but a stronger focus on data ingestion and indexing.",
            },
            {
                term: "Pinecone",
                abbr: null,
                definition:
                    "A managed, cloud-hosted vector database service. Pinecone handles the infrastructure of storing and querying billions of vector embeddings at low latency without requiring the client to manage servers or indexing infrastructure. It is the most widely adopted vector database for production RAG applications. Alternatives include Weaviate (open-source, self-hostable) and Chroma (lightweight, suitable for development and small deployments).",
            },
            {
                term: "Botpress",
                abbr: null,
                definition:
                    "An open-source conversational AI platform for building rule-based and hybrid chatbots with a visual flow editor. Botpress provides a drag-and-drop interface for defining conversation flows, integrates with messaging channels including WhatsApp and web widgets, and handles session management. It is appropriate for Tier I (rule-based) deployments where the conversation structure is well-defined and does not require generative AI reasoning.",
            },
            {
                term: "WhatsApp Cloud API",
                abbr: null,
                definition:
                    "Meta's official API for sending and receiving WhatsApp messages programmatically. It requires a verified WhatsApp Business Account and approval from Meta. The Cloud API (hosted by Meta) is distinct from the on-premise WhatsApp Business API. It enables chatbots to interact with users via WhatsApp, the dominant messaging channel in Pakistan, South Asia, and MENA markets. Messages beyond the 24-hour customer service window require pre-approved message templates.",
            },
            {
                term: "Sandbox Environment",
                abbr: null,
                definition:
                    "An isolated replica of a production system used for testing. A sandbox mimics the behaviour of live databases, APIs, and services without affecting real customer data or triggering actual transactions. For agentic systems, a sandbox is mandatory during development: an agent that books appointments or sends emails must be tested in an environment where those actions have no real-world consequences.",
            },
            {
                term: "Staging Environment",
                abbr: null,
                definition:
                    "A near-identical copy of the production environment, used as the final testing step before a release goes live. Unlike a sandbox, staging typically uses production-scale infrastructure and realistic (but anonymised) data. Changes are deployed to staging first, validated, and then promoted to production. For chatbot systems, staging is where end-to-end integration tests, user acceptance testing, and red-teaming occur before any public launch.",
            },
        ],
    },
    {
        category: "Business & Process Terms",
        terms: [
            {
                term: "CRM",
                abbr: "Customer Relationship Management",
                definition:
                    "Software that manages a company's interactions with current and potential customers. A CRM stores contact records, deal pipelines, communication history, and task assignments. Common platforms include HubSpot, Salesforce, Zoho, and Pipedrive. In agentic chatbot systems, the CRM is frequently an integration target: the agent reads lead data, updates contact records, logs conversation summaries, and triggers follow-up tasks automatically.",
            },
            {
                term: "ERP",
                abbr: "Enterprise Resource Planning",
                definition:
                    "Integrated business management software covering finance, inventory, supply chain, HR, and operations. ERP systems (SAP, Oracle, Microsoft Dynamics, Odoo) are the authoritative source of record for business-critical data. Integrating a chatbot with an ERP is a Tier IV (agentic) concern — it requires API access, careful data validation, and rigorous testing because errors can affect financial records or inventory counts.",
            },
            {
                term: "SLA",
                abbr: "Service Level Agreement",
                definition:
                    "A formal contract between a service provider and a client that defines the expected level of service — including uptime guarantees, response times, error rates, and support obligations. For a deployed AI chatbot, an SLA might specify 99.9% uptime, a maximum response latency of 3 seconds, and a defined escalation path for system failures. SLAs are a prerequisite for Tier IV agentic deployments where system downtime has direct business impact.",
            },
            {
                term: "Acceptance Testing",
                abbr: null,
                definition:
                    "A formal testing phase in which the client — not the development team — validates that the delivered system meets the agreed requirements. Acceptance testing for a chatbot typically involves a defined set of test conversations, edge cases, and integration scenarios that the client's team runs against the system. Passing acceptance testing is the contractual gateway before final payment and go-live authorisation.",
            },
            {
                term: "Parallel Run",
                abbr: null,
                definition:
                    "A deployment strategy in which the new AI system operates alongside the existing human-staffed process for a defined period before full handover. During the parallel run, the AI handles queries and its responses are compared against what a human agent would have said. Discrepancies are reviewed, the system is tuned, and confidence is built incrementally. For Tier IV agentic systems, a 6-week parallel run is standard practice before autonomous operation begins.",
            },
            {
                term: "Parallel Run",
                abbr: null,
                definition:
                    "A deployment strategy in which the new AI system operates alongside the existing human-staffed process for a defined period before full handover. During the parallel run, the AI handles queries and its responses are compared against what a human agent would have said. Discrepancies are reviewed, the system is tuned, and confidence is built incrementally. For Tier IV agentic systems, a 6-week parallel run is standard practice before autonomous operation begins.",
            },
            {
                term: "Green Tick Verification",
                abbr: null,
                definition:
                    "The verified business badge displayed on a WhatsApp Business Account, indicating that Meta has confirmed the account belongs to a legitimate, named business. The green tick improves user trust and deliverability. It is obtained through Meta's official verification process and requires a registered business entity. For customer-facing WhatsApp chatbots, green tick verification is strongly recommended and required for certain message categories.",
            },
            {
                term: "Knowledge Base",
                abbr: null,
                definition:
                    "The structured collection of documents, articles, product specifications, policies, and data that a RAG chatbot draws from when answering questions. The knowledge base is the source of ground truth for the system — its quality, completeness, and organisation directly determine the accuracy of the chatbot's responses. Maintaining the knowledge base is an ongoing operational responsibility that must be assigned to a named owner on the client side.",
            },
        ],
    },
];

// deduplicate any repeated terms
const GLOSSARY_CLEAN = GLOSSARY.map(cat => ({
    ...cat,
    terms: cat.terms.filter((t, i, arr) => arr.findIndex(x => x.term === t.term) === i),
}));

function GlossaryTab() {
    const [query, setQuery] = useState("");
    const q = query.trim().toLowerCase();

    const filtered = GLOSSARY_CLEAN.map(cat => ({
        ...cat,
        terms: cat.terms.filter(t =>
            !q ||
            t.term.toLowerCase().includes(q) ||
            (t.abbr && t.abbr.toLowerCase().includes(q)) ||
            t.definition.toLowerCase().includes(q)
        ),
    })).filter(cat => cat.terms.length > 0);

    const totalTerms = GLOSSARY_CLEAN.reduce((acc, c) => acc + c.terms.length, 0);

    return (
        <div className="fade">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 14, marginBottom: 24 }}>
                <div>
                    <div className="sl">Technical Glossary</div>
                    <p style={{ fontSize: 13, color: "var(--sub)", lineHeight: 1.7, maxWidth: 540 }}>
                        Definitions for every technical term used across this proposal. Written for a non-technical audience.
                        <span className="mono" style={{ fontSize: 10, color: "var(--dim)", marginLeft: 10 }}>{totalTerms} terms</span>
                    </p>
                </div>
            </div>

            {/* Search */}
            <div style={{ marginBottom: 32, position: "relative" }}>
                <input
                    type="text"
                    placeholder="Search terms, abbreviations, or definitions…"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    style={{
                        width: "100%", padding: "11px 16px 11px 40px",
                        background: "var(--s1)", border: "1px solid var(--border2)",
                        color: "var(--text)", fontSize: 13,
                        fontFamily: "Inter, -apple-system, BlinkMacSystemFont, SF Pro Display, system-ui, Segoe UI, Roboto, sans-serif",
                        outline: "none",
                        transition: "border-color 0.15s",
                    }}
                    onFocus={e => (e.target.style.borderColor = "var(--accent)")}
                    onBlur={e => (e.target.style.borderColor = "var(--border2)")}
                />
                <span style={{
                    position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
                    color: "var(--dim)", fontSize: 13, pointerEvents: "none", fontFamily: "ui-monospace, SF Mono, Fira Code, Roboto Mono, monospace",
                }}>
                    /
                </span>
                {query && (
                    <button onClick={() => setQuery("")} style={{
                        position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
                        background: "none", border: "none", color: "var(--dim)", cursor: "pointer",
                        fontSize: 16, lineHeight: 1, fontFamily: "ui-monospace, SF Mono, Fira Code, Roboto Mono, monospace",
                    }}>×</button>
                )}
            </div>

            {filtered.length === 0 && (
                <div style={{ textAlign: "center", padding: "48px 0", color: "var(--dim)", fontSize: 13 }}>
                    No terms match <span style={{ color: "var(--sub)" }}>"{query}"</span>
                </div>
            )}

            {filtered.map((cat, ci) => (
                <div key={ci} style={{ marginBottom: 44 }}>
                    <div style={{
                        display: "flex", alignItems: "center", gap: 12, marginBottom: 20,
                        paddingBottom: 10, borderBottom: "1px solid var(--border)",
                    }}>
                        <span style={{ width: 3, height: 14, background: "var(--accent)", display: "inline-block", flexShrink: 0 }} />
                        <span className="serif" style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>{cat.category}</span>
                        <span className="mono" style={{ fontSize: 9, color: "var(--dim)", marginLeft: 4 }}>
                            {cat.terms.length} {cat.terms.length === 1 ? "term" : "terms"}
                        </span>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                        {cat.terms.map((t, ti) => (
                            <div key={ti} className="glossary-item" style={{
                                display: "grid",
                                gridTemplateColumns: "200px 1fr",
                                gap: 0,
                                borderBottom: "1px solid var(--border)",
                                padding: "18px 0",
                            }}>
                                {/* Term + abbr */}
                                <div style={{ paddingRight: 24 }}>
                                    <div className="serif" style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: t.abbr ? 4 : 0, lineHeight: 1.3 }}>
                                        {highlight(t.term, q)}
                                    </div>
                                    {t.abbr && (
                                        <div className="mono" style={{ fontSize: 9, color: "var(--accent)", letterSpacing: "0.08em", lineHeight: 1.5 }}>
                                            {highlight(t.abbr, q)}
                                        </div>
                                    )}
                                </div>
                                {/* Definition */}
                                <div style={{ fontSize: 13, color: "var(--sub)", lineHeight: 1.8 }}>
                                    {highlight(t.definition, q)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            <div className="mono" style={{ marginTop: 16, fontSize: 9, color: "var(--dim)", lineHeight: 1.9 }}>
                Definitions written for a non-technical audience. Some simplifications apply.
                Technical implementations may vary by project scope and provider.
            </div>
        </div>
    );
}

function highlight(text, q) {
    if (!q || q.length < 2) return text;
    const idx = text.toLowerCase().indexOf(q);
    if (idx === -1) return text;
    return (
        <>
            {text.slice(0, idx)}
            <mark style={{ background: "rgba(251,12,12,0.18)", color: "var(--accent)", padding: "0 1px" }}>
                {text.slice(idx, idx + q.length)}
            </mark>
            {text.slice(idx + q.length)}
        </>
    );
}

export default function App() {
    const [tab, setTab] = useState("quiz");
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState({});
    const [picked, setPicked] = useState(null);
    const [result, setResult] = useState(null);
    const [expanded, setExpanded] = useState(null);
    const [msgs, setMsgs] = useState(15000);
    const [currency, setCurrency] = useState("PKR");
    const [menuOpen, setMenuOpen] = useState(false);
    const [auth, setAuth] = useState(localStorage.getItem("insurgo_auth") === "true");
    const [pass, setPass] = useState("");
    const [error, setError] = useState(false);

    useEffect(() => {
        (async function () {
            const cal = await getCalApi({ "namespace": "30min" });
            cal("ui", { "hideEventTypeDetails": false, "layout": "month_view" });
        })();
    }, []);

    function handleAuth(e) {
        e?.preventDefault();
        if (pass === "Insurgo2026") {
            localStorage.setItem("insurgo_auth", "true");
            setAuth(true);
            // Trigger notification
            fetch("/.netlify/functions/notify", { method: "POST" }).catch(() => {});
        } else {
            setError(true);
            setTimeout(() => setError(false), 2000);
        }
    }

    function choose(qid, scores) {
        const next = { ...answers, [qid]: scores };
        setAnswers(next);
        if (step < QUESTIONS.length - 1) {
            setTimeout(() => { setStep(step + 1); setPicked(null); }, 180);
        } else {
            const totals = [0, 0, 0, 0];
            Object.values(next).forEach(s => s.forEach((v, i) => (totals[i] += v)));
            const max = Math.max(...totals);
            setResult({ tier: TIERS[totals.indexOf(max)], totals });
            setStep(QUESTIONS.length);
        }
    }

    function restart() {
        setStep(0); setAnswers({}); setPicked(null); setResult(null);
    }

    return (
        <>
            <style dangerouslySetInnerHTML={{
                __html: `
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --font: "Inter Variable", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          --mono: "JetBrains Mono", "IBM Plex Mono", monospace;
          --bg:      #0a0a0f;
          --s1:      #0f1011;
          --s2:      #191a1b;
          --border:  rgba(255, 255, 255, 0.08);
          --border2: rgba(255, 255, 255, 0.12);
          --text:    #f7f8f8;
          --sub:     #d0d6e0;
          --dim:     #8a8f98;
          --faint:   #4a4d54;
          --accent:  #fb0c0c;
          --adim:    rgba(251,12,12,0.07);
          --aborder: rgba(251,12,12,0.28);
          --accent-hover: #ff3434;
        }
        body { background: var(--bg); font-family: var(--font); }
        .serif { font-family: var(--font); }
        .sans  { font-family: var(--font); }
        .mono  { font-family: var(--mono); }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade { animation: fadeUp 0.3s ease forwards; }
        .tab-btn {
          font-family: var(--mono);
          font-size: 10px; font-weight: 500;
          letter-spacing: 0.12em; text-transform: uppercase;
          background: transparent; border: none; border-bottom: 2px solid transparent;
          padding: 12px 0; cursor: pointer; color: var(--sub);
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .tab-btn.on { color: var(--accent); border-bottom-color: var(--accent); }
        .tab-btn:hover:not(.on) { color: var(--text); }
        .opt {
          width: 100%; text-align: left; display: flex; align-items: flex-start; gap: 13px;
          background: var(--s1); border: 1px solid var(--border);
          color: var(--text); cursor: pointer;
          font-family: var(--font); font-size: 13.5px; font-weight: 400;
          padding: 14px 18px; line-height: 1.5;
          transition: border-color 0.15s, background 0.15s;
        }
        .opt:hover  { border-color: var(--border2); background: var(--s2); }
        .opt.sel    { border-color: var(--accent); background: var(--adim); }
        .radio {
          width: 16px; height: 16px; border-radius: 50%; border: 1px solid var(--border2);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; margin-top: 1px; transition: border-color 0.15s, background 0.15s;
        }
        .radio.on { border-color: var(--accent); background: var(--accent); }
        .radio-dot { width: 5px; height: 5px; border-radius: 50%; background: #fff; }
        .tier-block { border: 1px solid var(--border); background: var(--s1); margin-bottom: 5px; transition: border-color 0.2s; }
        .tier-block.open { border-color: var(--aborder); }
        .tier-hd { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; cursor: pointer; gap: 12px; }
        .bar-track { height: 2px; background: var(--border); border-radius: 1px; overflow: hidden; }
        .bar-fill  { height: 100%; background: var(--accent); border-radius: 1px; transition: width 0.5s ease; }
        .pill {
          font-family: var(--mono); font-size: 9px; font-weight: 500;
          letter-spacing: 0.06em; text-transform: uppercase;
          display: inline-block; padding: 2px 8px;
          border: 1px solid var(--border2); color: var(--sub);
        }
        .range-sl { -webkit-appearance: none; appearance: none; width: 100%; height: 2px; background: var(--border2); border-radius: 1px; outline: none; }
        .range-sl::-webkit-slider-thumb { -webkit-appearance: none; width: 13px; height: 13px; border-radius: 50%; background: var(--accent); cursor: pointer; }
        .range-sl::-moz-range-thumb { width: 13px; height: 13px; border-radius: 50%; background: var(--accent); cursor: pointer; border: none; }
        .cta { transition: opacity 0.18s; cursor: pointer; }
        .cta:hover { opacity: 0.82; }
        .sl { font-family: var(--mono); font-size: 9px; color: var(--sub); letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 12px; }
        .tabs-container {
          display: flex; gap: 26px; border-top: 1px solid var(--border);
          overflow-x: auto; -webkit-overflow-scrolling: touch;
          scrollbar-width: none; -ms-overflow-style: none;
          justify-content: center;
        }
        .tabs-container::-webkit-scrollbar { display: none; }
        .tab-btn { flex-shrink: 0; }
        .mobile-only { display: none; }
        .desktop-only { display: inline; }
        
        @media (max-width: 640px) {
          .mobile-only { display: inline; }
          .desktop-only { display: none; }
          .glossary-item { grid-template-columns: 1fr !important; gap: 8px !important; }
          .header-content { flex-direction: column !important; align-items: center !important; text-align: center !important; }
          .header-content h1 { text-align: center !important; }
          .tier-hd { flex-direction: column !important; align-items: flex-start !important; gap: 8px !important; }
          .summary-bar { gap: 16px !important; }
          .comparison-matrix th, .comparison-matrix td { padding: 8px 10px !important; font-size: 11px !important; }
          .matrix-label { width: 120px !important; }
          .tabs-container { 
            display: flex !important; 
            gap: 16px !important; 
            justify-content: center !important;
            padding: 0 !important;
          }
          .tab-btn { 
            font-size: 10px !important; 
            padding: 10px 0 !important;
            letter-spacing: 0.05em !important;
          }
          .floating-cta { bottom: 16px !important; right: 16px !important; left: 16px !important; width: auto !important; border-radius: 8px !important; }
        }
        
        .floating-cta {
          position: fixed; bottom: 32px; right: 32px;
          background: var(--accent); color: #fff;
          padding: 14px 24px; border-radius: 8px;
          display: flex; alignItems: center; gap: 12px;
          box-shadow: 0 8px 32px rgba(251,12,12,0.3);
          cursor: pointer; z-index: 100;
          text-decoration: none; font-weight: 600; font-size: 14px;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          text-transform: uppercase; letter-spacing: 0.05em;
        }
        .floating-cta:hover { transform: translateY(-2px); background: var(--accent-hover); box-shadow: 0 12px 40px rgba(251,12,12,0.4); }
        
        .tt {
          border-bottom: 1px dotted var(--accent);
          cursor: help; position: relative;
          display: inline-block;
        }
        .tt:hover::after {
          content: attr(data-def);
          position: absolute; bottom: 120%; left: 50%; transform: translateX(-50%);
          background: var(--s2); border: 1px solid var(--border2);
          color: var(--text); padding: 10px 14px; border-radius: 4px;
          font-size: 11px; width: 220px; line-height: 1.5;
          z-index: 200; box-shadow: 0 4px 12px rgba(0,0,0,0.5);
          pointer-events: none; text-align: left;
          font-family: var(--font); font-weight: 400; font-style: normal;
        }
      `}} />

            <div className="sans" style={{ background: "var(--bg)", color: "var(--text)", minHeight: "100vh" }}>
                {!auth ? (
                    <div className="fade" style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 26 }}>
                        <div style={{ maxWidth: 320, width: "100%", textAlign: "center" }}>
                            <img src="/logo.svg" alt="Insurgo" style={{ height: 42, margin: "0 auto 32px", display: "block" }} />
                            <div className="mono" style={{ fontSize: 9, color: "var(--dim)", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 24 }}>
                                Project Access Restricted
                            </div>
                            <form onSubmit={handleAuth}>
                                <input
                                    type="password"
                                    value={pass}
                                    onChange={(e) => setPass(e.target.value)}
                                    placeholder="Enter Access Key"
                                    autoFocus
                                    style={{
                                        width: "100%", background: "var(--s1)", border: `1px solid ${error ? "var(--accent)" : "var(--border)"}`,
                                        color: "var(--text)", padding: "14px", fontSize: 13, textAlign: "center", outline: "none",
                                        fontFamily: "var(--mono)", marginBottom: 16, transition: "border-color 0.2s"
                                    }}
                                />
                                <button className="cta" style={{
                                    width: "100%", padding: "12px", background: "var(--accent)", border: "none",
                                    color: "#fff", fontSize: 11, fontWeight: 600, textTransform: "uppercase",
                                    letterSpacing: "0.1em", fontFamily: "var(--mono)"
                                }}>
                                    Unlock Proposal
                                </button>
                            </form>
                            {error && <div style={{ marginTop: 16, fontSize: 11, color: "var(--accent)", fontFamily: "var(--mono)" }}>Invalid Access Key</div>}
                        </div>
                    </div>
                ) : (
                    <>
                        {/* HEADER */}
                <div style={{ position: "sticky", top: 0, zIndex: 90, background: "rgba(10, 10, 15, 0.8)", backdropFilter: "blur(12px)", borderBottom: "1px solid var(--border)" }}>
                    <div style={{ maxWidth: 960, margin: "0 auto", padding: "26px 26px 0" }}>
                        <div className="header-content" style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 12, paddingBottom: 16 }}>
                            <div style={{ flex: "1 1 auto", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginBottom: 8 }}>
                                    <img src="/logo.svg" alt="Insurgo Systems" style={{ height: 32, width: "auto", display: "block" }} />
                                    <h1 className="serif" style={{ fontSize: "clamp(16px,2.8vw,22px)", fontWeight: 700, lineHeight: 1, color: "var(--text)", textAlign: "left" }}>
                                        AI Chatbot Architecture <span style={{ color: "var(--accent)" }}>Proposal</span>
                                    </h1>
                                </div>
                                <p style={{ fontSize: 12, color: "var(--sub)", lineHeight: 1.6, maxWidth: 650, margin: "0 auto" }}>
                                    System requirements, production tiers, and pricing. Updated May 2026.
                                </p>
                            </div>
                        </div>

                        <div className="tabs-container">
                            {[
                                { id: "quiz", label: "Quiz", full: "Needs Assessment" },
                                { id: "guide", label: "Guide", full: "Architecture Guide" },
                                { id: "flows", label: "Flows", full: "Flow Diagrams" },
                                { id: "calc", label: "Pricing", full: "API Pricing" },
                                { id: "book", label: "Book", full: "Book a Call" },
                                { id: "glossary", label: "Glossary", full: "Glossary" },
                            ].map(t => (
                                <button key={t.id} onClick={() => setTab(t.id)} className={`tab-btn ${tab === t.id ? "on" : ""}`}>
                                    <span className="desktop-only">{t.full}</span>
                                    <span className="mobile-only">{t.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* BODY */}
                <div style={{ maxWidth: 960, margin: "0 auto", padding: "36px 26px 72px" }}>

                    {/* ── NEEDS ASSESSMENT ── */}
                    {tab === "quiz" && (
                        <div className="fade">
                            {step < QUESTIONS.length && (
                                <>
                                    <div style={{ marginBottom: 30 }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                                            <span className="mono" style={{ fontSize: 9, color: "var(--dim)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                                                Question {step + 1} of {QUESTIONS.length}
                                            </span>
                                            <span className="mono" style={{ fontSize: 9, color: "var(--faint)" }}>
                                                {Math.round((step / QUESTIONS.length) * 100)}%
                                            </span>
                                        </div>
                                        <div className="bar-track">
                                            <div className="bar-fill" style={{ width: `${(step / QUESTIONS.length) * 100}%` }} />
                                        </div>
                                    </div>

                                    <div key={step} className="fade">
                                        <h2 className="serif" style={{ fontSize: "clamp(16px,2.6vw,21px)", fontWeight: 700, lineHeight: 1.45, marginBottom: 22, color: "var(--text)" }}>
                                            {QUESTIONS[step].text}
                                        </h2>
                                        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                                            {QUESTIONS[step].options.map((opt, i) => (
                                                <button
                                                    key={i}
                                                    className={`opt ${picked === i ? "sel" : ""}`}
                                                    onClick={() => { setPicked(i); choose(QUESTIONS[step].id, opt.scores); }}
                                                >
                                                    <span className={`radio ${picked === i ? "on" : ""}`}>
                                                        {picked === i && <span className="radio-dot" />}
                                                    </span>
                                                    {opt.label}
                                                </button>
                                            ))}
                                        </div>

                                        {step > 0 && (
                                            <button onClick={() => { setStep(step - 1); setPicked(null); }} style={{
                                                marginTop: 18, background: "none", border: "none",
                                                color: "var(--dim)", fontSize: 12, cursor: "pointer",
                                                fontFamily: "Inter, -apple-system, BlinkMacSystemFont, SF Pro Display, system-ui, Segoe UI, Roboto, sans-serif", padding: 0,
                                                textDecoration: "underline", textUnderlineOffset: 3,
                                            }}>
                                                Back
                                            </button>
                                        )}
                                    </div>
                                </>
                            )}

                            {step === QUESTIONS.length && result && (
                                <div key="result" className="fade">
                                    <div className="mono" style={{ fontSize: 9, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 10 }}>
                                        Assessment Complete
                                    </div>
                                    <h2 className="serif" style={{ fontSize: "clamp(17px,2.8vw,24px)", fontWeight: 700, marginBottom: 6 }}>
                                        Recommended Architecture
                                    </h2>
                                    <p style={{ fontSize: 13, color: "var(--sub)", lineHeight: 1.7, marginBottom: 24 }}>
                                        Based on your responses, the following architecture is the best match for your stated requirements and constraints.
                                    </p>

                                    <div style={{ border: "1px solid var(--aborder)", background: "var(--adim)", padding: "22px 24px", marginBottom: 28 }}>
                                        <div className="mono" style={{ fontSize: 9, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 7 }}>
                                            {result.tier.label}
                                        </div>
                                        <h3 className="serif" style={{ fontSize: 20, fontWeight: 700, marginBottom: 5 }}>{result.tier.name}</h3>
                                        <p style={{ fontSize: 13, color: "var(--sub)", lineHeight: 1.7, marginBottom: 20 }}>{result.tier.subtitle}</p>

                                        <div style={{ display: "flex", gap: 28, flexWrap: "wrap", paddingTop: 16, borderTop: "1px solid var(--border)" }}>
                                            {[
                                                { l: "Timeline", v: result.tier.timeline },
                                                { l: `Dev Cost (${currency})`, v: `${fmt(result.tier.devUSD[0], currency)} – ${fmt(result.tier.devUSD[1], currency)}` },
                                                { l: `Monthly API (${currency})`, v: result.tier.runUSD[0] === 0 ? `Free – ${fmt(result.tier.runUSD[1], currency)}` : `${fmt(result.tier.runUSD[0], currency)} – ${fmt(result.tier.runUSD[1], currency)}` },
                                                { l: "Complexity", v: result.tier.complexity },
                                            ].map(item => (
                                                <div key={item.l}>
                                                    <div className="mono" style={{ fontSize: 9, color: "var(--dim)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>{item.l}</div>
                                                    <div className="serif" style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{item.v}</div>
                                                </div>
                                            ))}
                                        </div>
                                        
                                        <div style={{ marginTop: 24, paddingTop: 18, borderTop: "1px solid var(--border)" }}>
                                            <div className="sl" style={{ marginBottom: 12 }}>Your Path to Launch</div>
                                            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                                {[
                                                    `1. Project Scoping & Data Audit (${result.tier.timeline.split(' ')[0]} weeks)`,
                                                    "2. Environment Setup & Model Configuration",
                                                    "3. Integration & Red-Teaming Phase",
                                                    "4. Staging Validation & User Acceptance",
                                                ].map((step, i) => (
                                                    <div key={i} style={{ fontSize: 12, color: "var(--sub)", display: "flex", gap: 10 }}>
                                                        <span style={{ color: "var(--accent)" }}>✓</span> {step}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: 28 }}>
                                        <div className="sl">Fit Score by Architecture</div>
                                        {TIERS.map((t, i) => {
                                            const max = Math.max(...result.totals);
                                            const pct = max > 0 ? Math.round((result.totals[i] / max) * 100) : 0;
                                            const win = t.id === result.tier.id;
                                            return (
                                                <div key={t.id} style={{ marginBottom: 10 }}>
                                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                                                        <span style={{ fontSize: 12.5, color: win ? "var(--text)" : "var(--dim)", fontWeight: win ? 600 : 400 }}>
                                                            {t.label} — {t.name}
                                                            {win && <span className="mono" style={{ marginLeft: 8, fontSize: 9, color: "var(--accent)", letterSpacing: "0.08em" }}>RECOMMENDED</span>}
                                                        </span>
                                                        <span className="mono" style={{ fontSize: 10, color: win ? "var(--accent)" : "var(--faint)" }}>{pct}%</span>
                                                    </div>
                                                    <div className="bar-track">
                                                        <div className="bar-fill" style={{ width: `${pct}%`, opacity: win ? 1 : 0.28 }} />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                                        <button className="cta" onClick={() => { setTab("book"); }} style={{
                                            padding: "11px 22px", background: "var(--accent)", border: "none",
                                            color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer",
                                            fontFamily: "Inter, -apple-system, BlinkMacSystemFont, SF Pro Display, system-ui, Segoe UI, Roboto, sans-serif",
                                        }}>
                                            Request a Scoping Call
                                        </button>
                                        <button className="cta" onClick={() => { setTab("guide"); setExpanded(result.tier.id); }} style={{
                                            padding: "11px 22px", background: "transparent",
                                            border: "1px solid var(--border2)", color: "var(--dim)",
                                            fontSize: 13, cursor: "pointer", fontFamily: "Inter, -apple-system, BlinkMacSystemFont, SF Pro Display, system-ui, Segoe UI, Roboto, sans-serif",
                                        }}>
                                            View Architecture Details
                                        </button>
                                        <button className="cta" onClick={restart} style={{
                                            padding: "11px 22px", background: "transparent",
                                            border: "1px solid var(--border2)", color: "var(--dim)",
                                            fontSize: 13, cursor: "pointer", fontFamily: "Inter, -apple-system, BlinkMacSystemFont, SF Pro Display, system-ui, Segoe UI, Roboto, sans-serif",
                                        }}>
                                            Restart Assessment
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── ARCHITECTURE GUIDE ── */}
                    {tab === "guide" && (
                        <div className="fade">
                            <div className="sl">All Architecture Tiers</div>

                            {TIERS.map(t => {
                                const isOpen = expanded === t.id;
                                return (
                                    <div key={t.id} className={`tier-block ${isOpen ? "open" : ""}`}>
                                        <div className="tier-hd" onClick={() => setExpanded(isOpen ? null : t.id)}>
                                            <div style={{ display: "flex", alignItems: "baseline", gap: 14, flex: 1, minWidth: 0, flexWrap: "wrap" }}>
                                                <span className="mono" style={{ fontSize: 9, color: "var(--accent)", letterSpacing: "0.12em", textTransform: "uppercase", flexShrink: 0 }}>{t.label}</span>
                                                <span className="serif" style={{ fontSize: 15.5, fontWeight: 700 }}>{t.name}</span>
                                                <span style={{ fontSize: 12, color: "var(--sub)", fontWeight: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.subtitle}</span>
                                            </div>
                                            <span className="mono" style={{ fontSize: 18, color: isOpen ? "var(--accent)" : "var(--dim)", transition: "color 0.2s", flexShrink: 0 }}>
                                                {isOpen ? "−" : "+"}
                                            </span>
                                        </div>

                                        {/* Summary bar */}
                                        <div className="summary-bar" style={{ padding: "0 20px 14px", display: "flex", gap: 28, flexWrap: "wrap", borderTop: "1px solid var(--border)" }}>
                                            {[
                                                { l: "Timeline", v: t.timeline },
                                                { l: `Dev (${currency})`, v: `${fmt(t.devUSD[0], currency)} – ${fmt(t.devUSD[1], currency)}` },
                                                { l: `API/mo (${currency})`, v: t.runUSD[0] === 0 ? `Free – ${fmt(t.runUSD[1], currency)}` : `${fmt(t.runUSD[0], currency)} – ${fmt(t.runUSD[1], currency)}` },
                                                { l: "Complexity", v: t.complexity },
                                            ].map(item => (
                                                <div key={item.l} style={{ paddingTop: 12 }}>
                                                    <div className="mono" style={{ fontSize: 8, color: "var(--dim)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 3 }}>{item.l}</div>
                                                    <div style={{ fontSize: 12.5, color: "#ccc", fontWeight: 500 }}>{item.v}</div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Expanded */}
                                        {isOpen && (
                                            <div key={t.id + "_d"} className="fade" style={{ borderTop: "1px solid var(--border)", padding: "22px 20px 26px" }}>
                                                <p className="serif" style={{ fontSize: 14.5, lineHeight: 1.85, color: "var(--sub)", fontStyle: "italic", maxWidth: 700, marginBottom: 28 }}>
                                                    {t.description}
                                                </p>

                                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 28 }}>

                                                    {/* System Requirements */}
                                                    <div>
                                                        <div className="sl">System Requirements from Client</div>
                                                        {t.requirements.map((r, i) => (
                                                            <div key={i} style={{
                                                                display: "flex", gap: 10, alignItems: "flex-start",
                                                                padding: "9px 0", borderBottom: "1px solid var(--border)",
                                                                fontSize: 13, color: "#999", lineHeight: 1.6,
                                                            }}>
                                                                <span style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--accent)", flexShrink: 0, marginTop: 7 }} />
                                                                {r}
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {/* Use Cases */}
                                                    <div>
                                                        <div className="sl">Primary Use Cases</div>
                                                        {t.useCases.map((u, i) => (
                                                            <div key={i} style={{ fontSize: 13, color: "#999", padding: "9px 0", borderBottom: "1px solid var(--border)", lineHeight: 1.55 }}>{u}</div>
                                                        ))}

                                                        <div style={{ marginTop: 22 }}>
                                                            <div className="sl">Tech Stack</div>
                                                            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 18 }}>
                                                                {t.stack.map((s, i) => <span key={i} className="pill">{s}</span>)}
                                                            </div>
                                                            <div style={{ padding: "13px 14px", border: "1px solid var(--border)", background: "var(--s2)" }}>
                                                                <div className="mono" style={{ fontSize: 8, color: "var(--dim)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 5 }}>Recommended Model</div>
                                                                <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text)", marginBottom: 3 }}>{t.model}</div>
                                                                <div style={{ fontSize: 12, color: "var(--sub)", lineHeight: 1.65 }}>{t.modelNote}</div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Pros & Cons */}
                                                    <div>
                                                        <div className="sl">Advantages</div>
                                                        {t.pros.map((p, i) => (
                                                            <div key={i} style={{ display: "flex", gap: 10, padding: "9px 0", borderBottom: "1px solid var(--border)", alignItems: "flex-start" }}>
                                                                <span style={{ color: "var(--accent)", fontSize: 11, marginTop: 2, flexShrink: 0 }}>+</span>
                                                                <span style={{ fontSize: 13, color: "#999", lineHeight: 1.55 }}>{p}</span>
                                                            </div>
                                                        ))}
                                                        <div style={{ marginTop: 18 }}>
                                                            <div className="sl">Limitations</div>
                                                            {t.cons.map((c, i) => (
                                                                <div key={i} style={{ display: "flex", gap: 10, padding: "9px 0", borderBottom: "1px solid var(--border)", alignItems: "flex-start" }}>
                                                                    <span style={{ color: "var(--dim)", fontSize: 11, marginTop: 2, flexShrink: 0 }}>–</span>
                                                                    <span style={{ fontSize: 13, color: "var(--sub)", lineHeight: 1.55 }}>{c}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}

                            {/* Comparison table */}
                            <div style={{ marginTop: 36 }}>
                                <div className="sl">Comparison Matrix</div>
                                <div style={{ overflowX: "auto", margin: "0 -26px", padding: "0 26px" }}>
                                    <table className="comparison-matrix" style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5, minWidth: 580, fontFamily: "Inter, -apple-system, BlinkMacSystemFont, SF Pro Display, system-ui, Segoe UI, Roboto, sans-serif" }}>
                                        <thead>
                                            <tr style={{ borderBottom: "1px solid var(--border)" }}>
                                                <th className="matrix-label" style={{ padding: "10px 14px", textAlign: "left", color: "var(--sub)", fontWeight: 500, fontSize: 11, width: 170 }}>Feature</th>
                                                {TIERS.map(t => (
                                                    <th key={t.id} style={{ padding: "10px 14px", textAlign: "center", color: "var(--sub)", fontWeight: 500, fontSize: 11 }}>
                                                        <div className="mono" style={{ fontSize: 8, color: "var(--accent)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 2 }}>{t.label}</div>
                                                        {t.name}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {[
                                                { l: "Complexity", vs: TIERS.map(t => t.complexity) },
                                                { l: "Timeline", vs: TIERS.map(t => t.timeline) },
                                                { l: `Dev Cost (${currency})`, vs: TIERS.map(t => `${fmt(t.devUSD[0], currency)}+`) },
                                                { l: `Monthly API (${currency})`, vs: TIERS.map(t => t.runUSD[0] === 0 ? "Free" : `${fmt(t.runUSD[0], currency)}+`) },
                                                { l: "Open-ended conversation", vs: ["No", "Yes", "Yes", "Yes"] },
                                                { l: "Grounded in your data", vs: ["No", "No", "Yes", "Yes"] },
                                                { l: "Autonomous actions", vs: ["No", "No", "No", "Yes"] },
                                                { l: "Long-term memory", vs: ["No", "No", "Partial", "Yes"] },
                                                { l: "System integrations", vs: ["Limited", "Basic", "Moderate", "Full"] },
                                            ].map((row, i) => (
                                                <tr key={i} style={{ borderBottom: "1px solid var(--border)", background: i % 2 === 0 ? "rgba(255,255,255,0.01)" : "transparent" }}>
                                                    <td style={{ padding: "10px 14px", color: "var(--sub)", fontSize: 12 }}>{row.l}</td>
                                                    {row.vs.map((v, j) => (
                                                        <td key={j} style={{
                                                            padding: "10px 14px", textAlign: "center", fontSize: 12,
                                                            color: v === "Yes" ? "var(--accent)" : v === "No" ? "var(--dim)" : "var(--sub)",
                                                            fontWeight: (v === "Yes" || v === "No") ? 600 : 400,
                                                        }}>{v}</td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── API PRICING ── */}
                    {tab === "calc" && (
                        <div className="fade">
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32, flexWrap: "wrap", gap: 20 }}>
                                <div style={{ flex: 1, minWidth: 280 }}>
                                    <div className="sl">Volume & Infrastructure Estimator</div>
                                    <h2 className="serif" style={{ fontSize: 21, fontWeight: 700 }}>Monthly Operating Estimates</h2>
                                </div>
                                <div style={{ textAlign: "right" }}>
                                    <div className="mono" style={{ fontSize: 9, color: "var(--dim)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.1em" }}>Currency Select</div>
                                    <div style={{ display: "flex" }}>
                                        {["PKR", "USD"].map((c, i) => (
                                            <button key={c} onClick={() => setCurrency(c)} style={{
                                                padding: "6px 14px", fontSize: 11, fontWeight: 500,
                                                fontFamily: "var(--mono)", cursor: "pointer",
                                                border: "1px solid var(--border2)",
                                                marginLeft: i > 0 ? -1 : 0,
                                                background: currency === c ? "var(--accent)" : "transparent",
                                                color: currency === c ? "#fff" : "var(--sub)",
                                                transition: "all 0.15s",
                                            }}>{c}</button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <p style={{ fontSize: 13, color: "var(--sub)", lineHeight: 1.75, marginBottom: 30, maxWidth: 600 }}>
                                Costs calculated at 500 input and 300 output tokens per exchange. Actual costs vary with context depth, caching, and model selection. Prices from official provider documentation, May 2026.
                            </p>

                            <div style={{ marginBottom: 34 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                                    <span className="mono" style={{ fontSize: 9, color: "var(--dim)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Monthly Conversations</span>
                                    <span className="mono" style={{ fontSize: 15, color: "var(--text)", fontWeight: 500 }}>{msgs.toLocaleString()}</span>
                                </div>
                                <input type="range" className="range-sl" min={1000} max={500000} step={1000} value={msgs} onChange={e => setMsgs(+e.target.value)} />
                                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
                                    <span className="mono" style={{ fontSize: 9, color: "var(--dim)" }}>1,000</span>
                                    <span className="mono" style={{ fontSize: 9, color: "var(--dim)" }}>500,000</span>
                                </div>
                            </div>

                            {MODELS.map((m, i) => {
                                const costUSD = calcCost(m, msgs);
                                const maxCost = calcCost(MODELS[3], msgs);
                                const pct = Math.max(2, Math.round((costUSD / maxCost) * 100));
                                const display = currency === "PKR"
                                    ? "PKR " + Math.round(costUSD * PKR).toLocaleString("en-PK")
                                    : "$" + costUSD.toFixed(2);
                                return (
                                    <div key={m.name} style={{ padding: "16px 0", borderBottom: "1px solid var(--border)" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 9 }}>
                                            <div>
                                                <span style={{ fontSize: 13.5, color: "var(--text)", fontWeight: 500 }}>{m.name}</span>
                                                <span className="pill" style={{ marginLeft: 10 }}>{m.tier}</span>
                                            </div>
                                            <span className="serif" style={{ fontSize: 16, fontWeight: 700 }}>
                                                {display}
                                                <span style={{ fontSize: 11, color: "var(--sub)", fontFamily: "Inter, -apple-system, BlinkMacSystemFont, SF Pro Display, system-ui, Segoe UI, Roboto, sans-serif", fontWeight: 300, marginLeft: 3 }}>/mo</span>
                                            </span>
                                        </div>
                                        <div className="bar-track">
                                            <div className="bar-fill" style={{ width: `${pct}%`, opacity: 0.5 + i * 0.17 }} />
                                        </div>
                                        <div className="mono" style={{ fontSize: 9, color: "var(--dim)", marginTop: 5 }}>
                                            ${m.inM} / 1M input · ${m.outM} / 1M output
                                        </div>
                                    </div>
                                );
                            })}

                            <div style={{ marginTop: 48 }}>
                                <div className="sl">Infrastructure & Managed Services</div>
                                <h3 className="serif" style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Hosting Estimates</h3>
                                <div style={{ overflowX: "auto", margin: "0 -26px", padding: "0 26px" }}>
                                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", minWidth: 500 }}>
                                        <thead>
                                            <tr style={{ borderBottom: "1px solid var(--border2)" }}>
                                                <th className="mono" style={{ padding: "10px 14px", fontSize: 9, color: "var(--dim)" }}>TIER</th>
                                                <th className="mono" style={{ padding: "10px 14px", fontSize: 9, color: "var(--dim)" }}>INFRASTRUCTURE</th>
                                                <th className="mono" style={{ padding: "10px 14px", fontSize: 9, color: "var(--dim)" }}>EST. COST</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {[
                                                { t: "Tier I", i: "Shared Instance / Cloud Host", c: 15 },
                                                { t: "Tier II", i: "Dedicated VPS (Vultr/DigitalOcean)", c: 25 },
                                                { t: "Tier III", i: "Vector DB (Pinecone) + Node Cluster", c: 85 },
                                                { t: "Tier IV", i: "High-Availability Agent Node + DB", c: 150 },
                                            ].map((row, idx) => (
                                                <tr key={idx} style={{ borderBottom: "1px solid var(--border)", background: idx % 2 === 0 ? "rgba(255,255,255,0.01)" : "transparent" }}>
                                                    <td style={{ padding: "14px", color: "var(--text)", fontSize: 13, fontWeight: 600 }}>{row.t}</td>
                                                    <td style={{ padding: "14px", color: "var(--sub)", fontSize: 13 }}>{row.i}</td>
                                                    <td style={{ padding: "14px", color: "var(--accent)", fontSize: 14, fontWeight: 700 }}>
                                                        {currency === "PKR" ? `PKR ${(row.c * 280).toLocaleString()}` : `$${row.c}`}
                                                        <span style={{ fontSize: 10, color: "var(--dim)", marginLeft: 4, fontWeight: 400 }}>/mo</span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div style={{ marginTop: 26, padding: "15px 17px", border: "1px solid var(--border)", background: "var(--s1)" }}>
                                <div className="sl" style={{ marginBottom: 8 }}>Cost Optimisation Note</div>
                                <p style={{ fontSize: 12.5, color: "var(--sub)", lineHeight: 1.8 }}>
                                    At high volume, prompt caching reduces input token costs by 50–90% on repeated context.
                                    Hybrid routing — a budget model for simple queries, a premium model for complex ones — is standard practice at scale.
                                    Insurgo engineers these optimisations into every production deployment.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* ── FLOW DIAGRAMS ── */}
                    {tab === "flows" && (
                        <FlowDiagramsTab />
                    )}

                    {/* ── GLOSSARY ── */}
                    {tab === "glossary" && (
                        <GlossaryTab />
                    )}

                    {/* ── BOOK A CALL ── */}
                    {tab === "book" && (
                        <div className="fade" style={{ minHeight: 600 }}>
                            <div className="sl">Schedule a Scoping Call</div>
                            <p style={{ fontSize: 13, color: "var(--sub)", lineHeight: 1.75, marginBottom: 24, maxWidth: 600 }}>
                                Select a time that works for you. Our engineers will join to discuss your requirements, technical constraints, and project timeline.
                            </p>
                            <div style={{ background: "var(--s1)", border: "1px solid var(--border)", borderRadius: 4, overflow: "hidden" }}>
                                <Cal
                                    namespace="30min"
                                    calLink="insurgo-systems/30min"
                                    style={{ width: "100%", height: "700px", overflow: "scroll" }}
                                    config={{ "layout": "month_view", "useSlotsViewOnSmallScreen": "true" }}
                                />
                            </div>
                        </div>
                    )}

                    {/* FOOTER CTA */}
                    <div style={{ marginTop: 54, borderTop: "1px solid var(--border)", paddingTop: 34, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <h2 className="serif" style={{ fontSize: "clamp(17px,2.5vw,24px)", fontWeight: 700, marginBottom: 8 }}>
                            Ready to proceed?
                        </h2>
                        <p style={{ fontSize: 13, color: "var(--sub)", lineHeight: 1.8, maxWidth: 520, marginBottom: 22 }}>
                            Insurgo Systems Engineering handles architecture, development, deployment, and ongoing maintenance.
                            Complete the needs assessment to identify your tier, then contact us to scope the project formally.
                        </p>
                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
                            <button 
                                className="cta" 
                                onClick={() => setTab("book")}
                                style={{
                                    padding: "11px 22px", background: "var(--accent)", border: "none",
                                    color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer",
                                    fontFamily: "var(--font)",
                                }}
                            >
                                Request a Scoping Call
                            </button>
                            <button className="cta" onClick={() => setTab("quiz")} style={{
                                padding: "11px 22px", background: "transparent",
                                border: "1px solid var(--border2)", color: "var(--sub)",
                                fontSize: 13, cursor: "pointer", fontFamily: "var(--font)",
                            }}>
                                Start Needs Assessment
                            </button>
                        </div>
                        <div className="mono" style={{ marginTop: 22, fontSize: 9, color: "var(--dim)", lineHeight: 1.9 }}>
                            Pricing in USD — PKR rates as of May 2026 (1 USD = 280 PKR).<br />
                            API estimates at 500 input / 300 output tokens per exchange. Monthly API costs exclude infrastructure hosting and third-party integration fees.
                        </div>
                    </div>
                </div>
            </>
            )}
        </div>

            {/* FLOATING CTA */}
            <div onClick={() => setTab("book")} className="floating-cta">
                <span style={{ fontSize: 18 }}>📅</span>
                Book Scoping Call
            </div>
        </>
    );
}