import sys
import os
import time

# Ensure imports work
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from core_daemon import on_drift_detected

if __name__ == "__main__":
    print("Simulating drift: VS Code -> YouTube")
    # prev_app, app, prev_emb, emb, sim
    on_drift_detected("VS Code", "YouTube", None, None, 0.25)
    
    print("Intervention thread started. Wait for voice...")
    time.sleep(15)
