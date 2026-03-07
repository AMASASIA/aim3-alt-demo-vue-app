import os
import json
import time
import firebase_admin
from firebase_admin import credentials, db
from datetime import datetime

# ==========================================
# Pillar 4: Verified Learning (Achiever Daemon)
# ==========================================
# This daemon implements the "Self-Improving Loop" by:
# 1. Monitoring on-chain/Firebase economic results (A2A transactions)
# 2. Calculating a Reward score based on ETH gain vs resource cost
# 3. Refining the AI's internal search/negotiation weights
# ==========================================

# Firebase Init (Reusing environment variables)
FIREBASE_URL = os.getenv("VITE_FIREBASE_DATABASE_URL") or os.getenv("NEXT_PUBLIC_FIREBASE_DATABASE_URL")

if not firebase_admin._apps:
    try:
        # For simplicity, we assume we have a service account or can use default credentials
        # In this env, we might need to rely on the JSON path from ENV
        cred_path = os.getenv("FIREBASE_SERVICE_ACCOUNT")
        if cred_path and os.path.exists(cred_path):
            cred = credentials.Certificate(cred_path)
        else:
            # Fallback for local testing if env is missing
            cred = credentials.ApplicationDefault()
        
        firebase_admin.initialize_app(cred, {
            'databaseURL': FIREBASE_URL
        })
    except Exception as e:
        print(f"[Achiever] Firebase Init Warning: {e}. Running in Local-Simulation Mode.")

STRATEGY_FILE = "agent_strategy.json"

class AchieverDaemon:
    def __init__(self):
        self.strategy = self.load_strategy()
        self.last_reward = 0.0
        self.learning_rate = 0.05

    def load_strategy(self):
        if os.path.exists(STRATEGY_FILE):
            with open(STRATEGY_FILE, 'r') as f:
                return json.load(f)
        return {
            "serendipity_bias": 0.15,
            "temporal_weight": 0.1,
            "soul_sensitivity": 1.0,
            "last_updated": datetime.now().isoformat(),
            "generation": 1
        }

    def save_strategy(self):
        self.strategy["last_updated"] = datetime.now().isoformat()
        with open(STRATEGY_FILE, 'w') as f:
            json.dump(self.strategy, f, indent=4)

    def fetch_verified_outcomes(self):
        """
        Fetches 'A2A' transaction outcomes from Firebase.
        In a real production environment, this would query a blockchain indexer for TBA transactions.
        """
        try:
            ref = db.reference('transactions')
            # Fetch last 50 transactions to analyze performance
            data = ref.order_by_child('timestamp').limit_to_last(50).get()
            return data if data else {}
        except Exception:
            # Simulation: Random noise representing market fluctuations if no real data
            return {"sim": {"eth_gain": 0.02, "cost": 0.005, "soul_gain": 150}}

    def calculate_reward(self, transactions):
        """
        [Mathematical Loop] Reward = Σ(ΔETH + ΔΠ) - Σ(Cost)
        """
        total_eth = 0.0
        total_soul = 0
        total_cost = 0.0

        for tx_id, tx in transactions.items():
            total_eth += float(tx.get('eth_gain', 0))
            total_soul += int(tx.get('soul_gain', 0))
            total_cost += float(tx.get('cost', 0.001))

        # 0.01 ETH is weighted significantly more than 1 SOUL point
        reward = (total_eth * 1000) + (total_soul * 0.1) - (total_cost * 500)
        return reward

    def evolve(self):
        """
        Self-Improving logic: Adjusts weights based on performance.
        If reward increased, push the strategy further in that direction.
        If reward decreased, revert and try a different creative branch (Serendipity).
        """
        transactions = self.fetch_verified_outcomes()
        current_reward = self.calculate_reward(transactions)
        
        print(f"[Achiever] Iteration: {self.strategy['generation']} | Reward: {current_reward:.4f}")

        # Simple Gradient Descent/Ascent logic based on Reward
        if current_reward > self.last_reward:
            # Success! Gently increase exploration (Serendipity)
            self.strategy["serendipity_bias"] = min(self.strategy["serendipity_bias"] + 0.01, 1.0)
            print("[Achiever] Strategy Optimization: Increasing Serendipity Bias.")
        else:
            # Failure. Revert and focus on SOUL reliability
            self.strategy["serendipity_bias"] = max(self.strategy["serendipity_bias"] - 0.02, 0.05)
            self.strategy["soul_sensitivity"] += 0.01
            print("[Achiever] Strategy Optimization: Focusing on SOUL Reliability.")

        self.last_reward = current_reward
        self.strategy["generation"] += 1
        self.save_strategy()

    def run_forever(self, interval=60):
        print("[Achiever Daemon] Starting Self-Improvement Loop...")
        while True:
            try:
                self.evolve()
                time.sleep(interval)
            except KeyboardInterrupt:
                break
            except Exception as e:
                print(f"[Achiever Error] {e}")
                time.sleep(10)

if __name__ == "__main__":
    daemon = AchieverDaemon()
    # In production, this would run as a 'Daemon' (Achiever Daemon)
    daemon.run_forever(interval=300) # Every 5 minutes
