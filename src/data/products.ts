// Single source of truth for the product line. Used by /products and
// /products/[slug]. Each product is in development; framing is "design partner".

export interface Product {
  slug: string;
  num: string;
  name: string;
  tagline: string;
  industry: string;
  reg: string;
  problem: string;
  does: string[];
  for: string;
  /** Optional hero image basename in /public (without extension), e.g. 'ledger-banking'. Serves .webp + .jpg. */
  heroImage?: string;
  /** Alt text for the hero image */
  heroAlt?: string;
  /** Longer detail-page content */
  detail: {
    summary: string;
    why: string;
    architecture: { label: string; body: string }[];
    regulatory: string[];
    status: string;
  };
}

export const products: Product[] = [
  {
    slug: 'sentinel',
    num: '01',
    name: 'Sentinel',
    tagline: 'Sovereign claims-document AI for medical schemes',
    industry: 'Medical Aid',
    reg: 'POPIA §26 · CMS',
    heroImage: 'sentinel-medical',
    heroAlt: 'A South African medical-scheme administrator reviewing a claims dashboard in a Cape Town office with Table Mountain through the window',
    problem:
      'Schemes are buried in claims, pre-authorisations, and PMB disputes. An LLM could read and triage them in seconds, but every document is special personal information: it cannot touch a foreign API or leave SA jurisdiction.',
    does: [
      'Reads claims, pre-auths, and member correspondence on infrastructure you control',
      'Drafts responses and flags PMB and clinical-coding issues for a human to approve',
      'Keeps every byte of member health data inside SA, with a full audit trail for the CMS',
    ],
    for: 'Open and restricted schemes and their administrators handling high claim volumes.',
    detail: {
      summary:
        'Sentinel is a sovereign document-intelligence system for medical schemes. It reads the unstructured paperwork that floods a scheme every day (claims, pre-authorisations, member correspondence, PMB disputes) and turns it into triaged, drafted, audit-logged work, without a single byte of member health data leaving South African jurisdiction.',
      why:
        'Member health data is the most heavily protected category under POPIA: special personal information under Section 26, with the CMS watching on top. The global document-AI tools all run inference through US-controlled endpoints. For a scheme, that is a non-starter. Sentinel is built for on-prem GPU or Cassava AI Factory deployment so the model comes to the data, not the other way around.',
      architecture: [
        { label: 'Ingest', body: 'Documents are classified and PII-tagged at the point of entry. Nothing is sent off-site.' },
        { label: 'Retrieve', body: 'A sovereign RAG layer grounds the model in scheme rules, PMB definitions, and policy, with retrieval logged.' },
        { label: 'Draft', body: 'The model drafts a response or triage decision. A human reviews and approves before anything is actioned.' },
        { label: 'Audit', body: 'Every inference, document touched, and data path is recorded for a CMS or POPIA evidence request.' },
      ],
      regulatory: ['POPIA Section 26 (special personal information)', 'POPIA Section 72 (cross-border processing)', 'CMS circulars on member data handling'],
      status: 'In development. Seeking one or two scheme or administrator design partners.',
    },
  },
  {
    slug: 'ledger',
    num: '02',
    name: 'Ledger',
    tagline: 'Sovereign AML and transaction-monitoring copilot',
    industry: 'Banking',
    reg: 'SARB Directive 3 · FIC',
    heroImage: 'ledger-banking',
    heroAlt: 'A South African financial-crime team reviewing transaction-monitoring dashboards in a Johannesburg bank office at dusk',
    problem:
      'AML analysts manually review thousands of flagged transactions. AI could draft the suspicious-transaction narratives, but transaction and KYC data sits under POPIA, FIC, and SARB cloud rules at once. It cannot route through an offshore model.',
    does: [
      'Drafts STR and SAR narratives from flagged activity, analyst-in-the-loop',
      'Summarises customer risk and surfaces the reasoning behind every flag',
      'Runs entirely on owned or sovereign infrastructure, explainable to a regulator',
    ],
    for: 'Retail and business banks running high-volume financial-crime operations.',
    detail: {
      summary:
        'Ledger is a sovereign copilot for financial-crime teams. It reads flagged transactions and customer history, drafts the suspicious-transaction narrative an analyst would otherwise write by hand, and shows its reasoning, all on infrastructure the bank controls.',
      why:
        'Transaction and KYC data is triple-bound: POPIA, the FIC Act, and SARB Directive 3 on cloud computing and offshoring. An offshore LLM endpoint touches all three. Ledger is designed so the model runs inside the bank or on sovereign cloud, with an explainability layer that lets a SARB or FIC reviewer see exactly why a narrative was drafted the way it was.',
      architecture: [
        { label: 'Ingest', body: 'Flagged transactions and linked KYC records are pulled into a sovereign workspace. No data egress.' },
        { label: 'Reason', body: 'The model assembles the risk picture and proposes a narrative, citing the specific signals it used.' },
        { label: 'Review', body: 'An analyst edits and approves. The copilot never files anything autonomously.' },
        { label: 'Evidence', body: 'The reasoning trail is preserved so the decision is defensible to FIC and SARB.' },
      ],
      regulatory: ['SARB Directive 3 (cloud and offshoring)', 'FIC Act (STR/SAR obligations)', 'POPIA (transaction and KYC personal data)'],
      status: 'In development. Seeking a retail or business bank design partner.',
    },
  },
  {
    slug: 'adjudicator',
    num: '03',
    name: 'Adjudicator',
    tagline: 'Sovereign claims and underwriting explainability engine',
    industry: 'Insurance',
    reg: 'SAM · FSCA · TCF',
    heroImage: 'adjudicator-insurance',
    heroAlt: 'Two South African insurance professionals reviewing a claim together in a Cape Town office overlooking the Atlantic coastline',
    problem:
      'Insurers want AI in claims and underwriting, but SAM, FSCA, and Treating Customers Fairly require every automated decision to be explainable and fair, to a regulator and to a customer. A black-box foreign model cannot satisfy that.',
    does: [
      'Produces a plain-language, auditable rationale for every AI-assisted decision',
      'Tests outcomes for fairness and surfaces where a decision needs human review',
      'Defensible to the FSCA, on infrastructure that keeps policyholder data sovereign',
    ],
    for: 'Life and short-term insurers putting AI into claims or underwriting.',
    detail: {
      summary:
        'Adjudicator is an explainability layer for AI-assisted claims and underwriting. It does not replace the insurer’s models; it makes their decisions defensible, producing a plain-language rationale for every outcome and testing for the fairness that TCF and the FSCA require.',
      why:
        'Under the Solvency Assessment and Management regime, FSCA conduct standards, and Treating Customers Fairly, an automated decision that cannot be explained or shown to be fair is a regulatory liability. Foreign black-box models fail this on both counts. Adjudicator sits over the decision pipeline on sovereign infrastructure and turns every output into something an insurer can stand behind.',
      architecture: [
        { label: 'Observe', body: 'Adjudicator wraps the existing claims or underwriting model, capturing inputs and outputs.' },
        { label: 'Explain', body: 'It generates a plain-language rationale a customer and a regulator can both follow.' },
        { label: 'Test', body: 'Outcomes are checked for fairness across cohorts; outliers are routed to human review.' },
        { label: 'Defend', body: 'The full rationale and fairness record is retained for an FSCA enquiry.' },
      ],
      regulatory: ['SAM (Solvency Assessment and Management)', 'FSCA conduct standards', 'Treating Customers Fairly (TCF)'],
      status: 'In development. Seeking a life or short-term insurer design partner.',
    },
  },
  {
    slug: 'custodian',
    num: '04',
    name: 'Custodian',
    tagline: 'The POPIA control plane for any AI workload',
    industry: 'All three',
    reg: 'POPIA §72 · cross-sector',
    problem:
      'Whatever AI you run, you have to prove where personal information went during inference, not just at rest. Almost no one can answer that today. It is the question a regulator or a legal team asks first.',
    does: [
      'Sits over any AI workload and maps where personal data moves at every layer',
      'Produces the data-residency and access audit trail legal and the regulator need',
      'Turns "is our AI compliant?" into a document you can hand over, not a guess',
    ],
    for: 'Any regulated enterprise that needs to evidence AI data sovereignty.',
    detail: {
      summary:
        'Custodian is the control plane that sits over any AI workload and answers the one question every regulator asks first: where did the personal information actually go? It maps data movement through storage, embeddings, prompt history, and inference state, and produces the residency and access audit trail legal and the regulator need.',
      why:
        'Data residency tells you where the disk sits. It does not tell you where personal information travelled during inference, who could access it, or under whose jurisdiction. That gap is where POPIA exposure lives, and almost no tool covers it. Custodian is the productised version of the Readiness Assessment: continuous, evidence-generating, and built to be handed to legal and the Information Regulator.',
      architecture: [
        { label: 'Map', body: 'Custodian instruments every AI workload and traces personal data through each layer it touches.' },
        { label: 'Watch', body: 'It monitors access and data paths continuously, not just at a point-in-time audit.' },
        { label: 'Flag', body: 'Any movement that crosses a jurisdictional or policy boundary is surfaced immediately.' },
        { label: 'Evidence', body: 'It generates the residency and access record a CIO can hand to legal or the regulator.' },
      ],
      regulatory: ['POPIA Section 72 (cross-border)', 'POPIA Section 19 (security safeguards)', 'Sector overlays: CMS, SARB, FSCA'],
      status: 'In development. Relevant to every regulated industry; design partners welcome.',
    },
  },
];

export const getProduct = (slug: string) => products.find((p) => p.slug === slug);
