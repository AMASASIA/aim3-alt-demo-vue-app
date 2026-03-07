
# System Architecture from OPAL Workflow

## Node Mapping
- [Trigger] `Customer_Inquiry` -> Google Cloud Functions (HTTP POST) - `backend/api/opal_gateway.js`
- [Logic] `Sentiment_Analysis` -> Gemini 3 Flash (Zero-shot Reasoning) - `backend/agent-engine/mint_topology.js`
- [Data] `CRM_Lookup` -> BigQuery Connector / Firebase - `backend/db/`
- [MINT Loop] `Self_Correction` -> Integrated into `MintAgent.observe()`

## Deployment Flow
Antigravity will deploy via `gcloud functions deploy` or standard `npm start` execution.

## MINT Topology Implementation
The core logic resides in `backend/agent-engine/mint_topology.js` which implements the recursive reasoning loop:

```javascript
// MINT (Multimodal Intelligent Network Topology) Core Implementation
async executeStep(task, context) {
    // 1. Reasoning (推論)
    const plan = await this.reason(task, context);
    
    // 2. Action (実行)
    const result = await this.act(plan);
    
    // 3. Observation (検証)
    const validation = await this.observe(result);
    
    if (!validation.success) {
      return this.executeStep(`Retry: ${validation.error}`, context);
    }
    return result;
}
```
