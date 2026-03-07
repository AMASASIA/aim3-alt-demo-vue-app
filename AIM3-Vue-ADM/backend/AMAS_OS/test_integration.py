
# AMAS OS: Integrated SI Test Script
import sys
import os

# Adjust path to find sibling modules
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from core.voice_insight import VoiceInsight
from interfaces.live_activity import LiveActivityProvider

# 1. Initialize Components
voice_kernel = VoiceInsight()
ios_bridge = LiveActivityProvider("USER_TEST_001")

print("\n--- AMAS OS: Simulating Voice Stream ---")

# 2. Simulate High Stress Voice Data
# Pitch variance > 0.8 and Rate > 1.5 -> HYPER_AROUSAL
# We force the mock values for this test by subclassing or just injecting
class MockVoiceInsight(VoiceInsight):
    def _get_pitch_variance(self, b): return 0.95
    def _get_speech_rate(self, b): return 1.8
    def _get_silence_duration(self, b): return 0.5

mock_kernel = MockVoiceInsight()
analysis = mock_kernel.analyze_stream([])

print(f"VOICE Analysis Result: {analysis}")

# 3. Check for Intervention & Push to iPhone
if analysis['needs_intervention']:
    print(f"\n[ALERT] Intervention Triggered (Index: {analysis['index']})")
    print(f"[BRIDGE] Sending 'Invisible Bridge' to Lock Screen...")
    
    result = ios_bridge.push_insight_options(analysis)
    print(f"\n[OK] Result: {result}")
else:
    print("No intervention needed. Virtue maintained.")
