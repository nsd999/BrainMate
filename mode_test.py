#!/usr/bin/env python3
"""
Additional test to verify that different modes produce different explanations
"""

import requests
import json

BASE_URL = "https://82df8663-624d-438d-8dbb-5551b805e52f.preview.emergentagent.com/api"
TIMEOUT = 60

def test_mode_differences():
    """Test that different modes produce different explanations for the same topic"""
    print("\n=== Testing Mode Differences ===")
    
    topic = "How does gravity work?"
    modes = ["kid", "student", "pro"]
    responses = {}
    
    # Get responses for all modes
    for mode in modes:
        try:
            payload = {"topic": topic, "mode": mode}
            print(f"Testing mode: {mode}")
            
            response = requests.post(f"{BASE_URL}/explain", json=payload, timeout=TIMEOUT)
            if response.status_code == 200:
                data = response.json()
                responses[mode] = data
                print(f"✅ {mode} mode response received")
            else:
                print(f"❌ {mode} mode failed with status {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ {mode} mode failed with exception: {e}")
            return False
    
    # Compare explanations to ensure they're different
    if len(responses) == 3:
        kid_explanation = responses["kid"]["simple_explanation"]
        student_explanation = responses["student"]["simple_explanation"]
        pro_explanation = responses["pro"]["simple_explanation"]
        
        print(f"\nKid explanation: {kid_explanation[:100]}...")
        print(f"Student explanation: {student_explanation[:100]}...")
        print(f"Pro explanation: {pro_explanation[:100]}...")
        
        # Check that explanations are different
        if (kid_explanation != student_explanation and 
            student_explanation != pro_explanation and 
            kid_explanation != pro_explanation):
            print("✅ Mode differences test PASSED - explanations are different")
            return True
        else:
            print("❌ Mode differences test FAILED - explanations are too similar")
            return False
    else:
        print("❌ Mode differences test FAILED - couldn't get all responses")
        return False

if __name__ == "__main__":
    test_mode_differences()