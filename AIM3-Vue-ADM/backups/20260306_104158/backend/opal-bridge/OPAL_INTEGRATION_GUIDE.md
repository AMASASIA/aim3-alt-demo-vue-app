# OPAL Integration Guide for Antigravity

This guide defines how to translate **OPAL (Open Platform for Abstraction Layers)** visual workflows into executable code within the Antigravity environment.

## 1. System Role Definition (Context Setting)

When instructing an Antigravity agent to process an OPAL workflow, paste the following system prompt:

> **Role**: You are an advanced System Architect integrated into Google Antigravity.
> **Task**: Analyze the provided OPAL workflow definition (JSON) and transform it into production-ready code optimized for Google Cloud and Gemini 3 Flash.
> **Principle**: Build the code based on the Triple MINT System principles: Reasoning, Action, and Observation loops.

## 2. OPAL Node Mapping Logic

| OPAL Node Type | Antigravity Target Tech Stack |
| :--- | :--- |
| **Trigger Node** | FastAPI / Express Route / Cloud Functions Endpoint |
| **Logic/Branch Node** | TypeScript Conditionals or Gemini Reasoning Step |
| **Data Node** | BigQuery / Firestore / PostgreSQL Query Wrapper |
| **AI Action Node** | Vertex AI SDK / Google AI Studio (Gemini 3) |

## 3. Implementation Workflow

### Step 1: Analyze the Workflow
Run the translator script to generate an initial implementation plan from the JSON definition.

```bash
node backend/opal-bridge/opal_to_antigravity.js backend/opal-bridge/opal_workflow_customer_support.json
```

### Step 2: Implementation Prompts (Task)
After generating the plan, instruct the agent with:

> "Read the generated `backend/opal-bridge/GENERATED_PLAN.md`.
> **Architecture Design**: Confirm the microservice structure matches the plan.
> **MINT Loop**: Ensure every AI Action Node includes a self-correction loop (verify output format before proceeding).
> **AI Studio**: Apply the `systemInstruction` from the JSON to the Gemini calls.
> **Deploy**: Add necessary dependencies (e.g., `@google/generative-ai`) to `package.json`."

## 4. Example: Customer Support Triage
An example workflow is provided in `backend/opal-bridge/opal_workflow_customer_support.json`.
To implement this:
1. Run the script in Step 1.
2. Review `backend/opal-bridge/GENERATED_PLAN.md`.
3. Ask Antigravity: "Implement the code described in GENERATED_PLAN.md into `backend/services/workflow_cs_001.js` and expose it via `server.js`."

## 5. Frontend Integration (React/Vue)

To generate the frontend interface for an OPAL workflow:

**Prompt to Agent:**
> "Based on the input parameters defined in `backend/opal-bridge/opal_workflow_customer_support.json` (e.g., `customer_email`, `message_body`), create a **Vue 3 / React Component**:
> 1. **UI**: Create a form with inputs matching the defined parameters.
> 2. **State**: Use `ref` for reactive variables.
> 3. **Action**: On submit, call the endpoint `/api/workflows/workflow_cs_001`.
> 4. **Response**: Display the workflow output (e.g., `draft_response`) in a glassmorphism card."

---
*Created by Antigravity Agent based on User Requirements.*
