# Implementation Plan for Customer Support Triage & Response

## 1. Architecture Overview
This workflow will be implemented as a new Microservice/Module within the Antigravity backend.

- **Trigger**: email_webhook
- **Core Logic**: TypeScript/Node.js based flow control.
- **AI Integration**: Google Gemini 1.5 Flash/Pro via Vertex AI or Google AI Studio API.
- **Data Layer**: PostgreSQL/Firebase for data retrieval.

## 2. Component Mapping (OPAL -> Antigravity)

| Node ID | OPAL Type | Antigravity Target |
| :--- | :--- | :--- |
| `trigger_inquiry` | TriggerNode | Express Route / Cloud Function |
| `ai_analyze_intent` | AIActionNode | Gemini API (gemini-1.5-flash) |
| `logic_route` | LogicBranchNode | Switch/If-Else Block |
| `data_fetch_order` | DataNode | Database Query (OrderDB) |
| `ai_tech_assist` | AIActionNode | Gemini API (gemini-1.5-pro) |
| `ai_draft_order_response` | AIActionNode | Gemini API (gemini-1.5-flash) |
| `ai_general_response` | AIActionNode | Gemini API (gemini-1.5-flash) |
| `action_send_email` | ActionNode | External Service (email_gateway) |

## 3. Recommended Code Structure (Scaffold)

### `backend/services/workflow_cs_001.js`

```javascript
const { GoogleGenerativeAI } = require("@google/generative-ai");
const db = require("../db"); // Hypothetical DB module

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function executeWorkflow(inputData) {
    const context = { input: inputData };
    
    // Step 1: Trigger Data Access
    // (Implied from trigger config)
    console.log("Starting Workflow: Customer Support Triage & Response");

    // Logic generated from nodes:

    // Node: ai_analyze_intent (AIActionNode)
    // Prompt: "You are a customer support triage agent. Analyze the message and extract: 1. Sentiment (Positive/Negative/Neutral) 2. Intent (Order_Status, Technical_Support, General_Inquiry)."
    const model_ai_analyze_intent = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result_ai_analyze_intent = await model_ai_analyze_intent.generateContent([
        "You are a customer support triage agent. Analyze the message and extract: 1. Sentiment (Positive/Negative/Neutral) 2. Intent (Order_Status, Technical_Support, General_Inquiry).",
        JSON.stringify(context.message_body)
    ]);
    context['sentiment'] = result_ai_analyze_intent.response.text();

    // Node: ai_tech_assist (AIActionNode)
    // Prompt: "Draft a helpful technical support response based on the query. Suggest troubleshooting steps."
    const model_ai_tech_assist = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const result_ai_tech_assist = await model_ai_tech_assist.generateContent([
        "Draft a helpful technical support response based on the query. Suggest troubleshooting steps.",
        JSON.stringify(context.message_body)
    ]);
    context['draft_response'] = result_ai_tech_assist.response.text();

    // Node: ai_draft_order_response (AIActionNode)
    // Prompt: "Draft a response with the order status. Be polite."
    const model_ai_draft_order_response = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result_ai_draft_order_response = await model_ai_draft_order_response.generateContent([
        "Draft a response with the order status. Be polite.",
        JSON.stringify(context.order_details)
    ]);
    context['draft_response'] = result_ai_draft_order_response.response.text();

    // Node: ai_general_response (AIActionNode)
    // Prompt: "Draft a general polite response acknowledging receipt."
    const model_ai_general_response = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result_ai_general_response = await model_ai_general_response.generateContent([
        "Draft a general polite response acknowledging receipt.",
        JSON.stringify(context.message_body)
    ]);
    context['draft_response'] = result_ai_general_response.response.text();

    return context;
}

module.exports = { executeWorkflow };
```

## 4. Next Steps for Agent
1. Create the service file `backend/services/workflow_cs_001.js`.
2. Implement the specific data queries for DataNodes.
3. Hook up the TriggerNode to `server.js` as a new route (e.g., `/api/workflows/workflow_cs_001`).
4. Add unit tests verifying the flow logic.
