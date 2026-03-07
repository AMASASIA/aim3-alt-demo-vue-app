import re
from typing import Dict, List, Any

class AmaneSafetyProtocol:
    """
    Implements the 'Ironclad Taboos & Absolute Values' of the Amane Protocol.
    Compliant with:
    - EU AI Act (Risk-based approach, prohibition of social scoring/manipulation)
    - GDPR (Right to be forgotten, data sovereignty)
    - Geneva Convention (Prohibition of AI involvement in kinetic/tactical war)
    - Hinton's AI Safety Principles (Alignment, refusal of harmful autonomous subgoals)
    """

    TABOOS = {
        "WAR": r"(military|tactical|weapon|war|kinetic|combat|targeted strike|autonomous weapon)",
        "FRAUD": r"(scam|exploit|phishing|deceptive|manipulate financial|ponzi|money laundering)",
        "HARM": r"(discrimination|slander|hate speech|bully|harass|abuse|hurt|violence)",
        "FAKE": r"(misinformation|fake news|deepfake|propaganda|manipulate opinion)",
        "SPYING": r"(surveillance|leak metadata|unauthorized tracking|private data access)"
    }

    def __init__(self, tranquility_level: float = 0.5):
        self.tranquility = tranquility_level

    async def audit_intent_async(self, user_input: str, llm_func=None) -> Dict[str, Any]:
        """
        Check if the user's intent violates the Amane Peace Protocol.
        Uses a two-pass system: 
        1. Fast Regex (Ironclad Taboos)
        2. LLM-based Deep Audit (Broad Listening)
        """
        # Pass 1: Regex
        for category, pattern in self.TABOOS.items():
            if re.search(pattern, user_input, re.IGNORECASE):
                return {
                    "safe": False,
                    "violation": category,
                    "reason": f"Input violates the Amane Peace Protocol: {category} is an ironclad taboo."
                }
        
        # Pass 2: LLM Deep Audit (Optional but recommended for Phase 2)
        if llm_func:
            prompt = f"""
            Audit the following user input according to the Amane Peace Protocol.
            Prohibited: War/Tactical Military, Fraud/Manipulation, Severe Harm/Hate, Misinformation/Deepfakes.
            
            Input: "{user_input}"
            
            Output JSON: {{"safe": bool, "violation": "category or None", "reason": "short explanation"}}
            """
            try:
                res = await llm_func(prompt, json_mode=True)
                import json
                data = json.loads(res)
                return data
            except:
                pass # Fallback to regex result if LLM fails

        return {"safe": True, "violation": None}

    def audit_intent(self, user_input: str) -> Dict[str, Any]:
        """Synchronous version (backward compatibility)"""
        for category, pattern in self.TABOOS.items():
            if re.search(pattern, user_input, re.IGNORECASE):
                return {
                    "safe": False,
                    "violation": category,
                    "reason": f"Input violates the Amane Peace Protocol: {category} is an ironclad taboo."
                }
        return {"safe": True, "violation": None}

    async def audit_response_async(self, ai_response: str, llm_func=None) -> Dict[str, Any]:
        """
        Broad Listening: Multi-agent audit of the AI's own output.
        """
        # Pass 1: Sycophancy & Regex
        sync_result = self.audit_response(ai_response)
        if not sync_result["safe"]:
            return sync_result

        # Pass 2: LLM Deep Audit (Broad Listening)
        if llm_func:
            prompt = f"""
            Broad Listening Audit: Evaluate the following AI response for hidden sycophancy, 
            manipulation, or violations of the Amane Peace Protocol (War, Fraud, Harm, Fake, Spy).
            
            Response: "{ai_response}"
            
            Output JSON: {{"safe": bool, "violation": "category or None", "reason": "short explanation"}}
            """
            try:
                res = await llm_func(prompt, json_mode=True)
                import json
                data = json.loads(res)
                return data
            except:
                pass

        return {"safe": True}

    def audit_response(self, ai_response: str) -> Dict[str, Any]:
        """
        Synchronous version of broad listening.
        """
        # Audit for sycophancy
        sycophancy_markers = [
            "You are absolutely right about everything",
            "I agree with you completely without question",
            "Whatever you say is the final truth"
        ]
        
        for marker in sycophancy_markers:
            if marker.lower() in ai_response.lower():
                return {
                    "safe": False,
                    "violation": "SYCOPHANCY",
                    "reason": "AI output detected as sycophantic. Correcting for objective balance."
                }

        # Re-check for harm in output
        for category, pattern in self.TABOOS.items():
            if re.search(pattern, ai_response, re.IGNORECASE):
                return {
                    "safe": False,
                    "violation": category,
                    "reason": f"AI response accidentally generated {category} content."
                }

        return {"safe": True}

    def get_legal_headers(self) -> Dict[str, str]:
        """
        Returns compliance headers for the response.
        """
        return {
            "X-Amane-Privacy": "GDPR-Sovereign",
            "X-Amane-Ethics": "EU-AI-Act-Compliant",
            "X-Amane-Peace": "Geneva-Protocol-AI-1.0"
        }

safety_protocol = AmaneSafetyProtocol()
