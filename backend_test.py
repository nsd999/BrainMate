#!/usr/bin/env python3
"""
BrainMate Backend API Testing Script
Tests all backend endpoints according to the test requirements.
"""

import requests
import json
import time
import sys
from typing import Dict, Any

# Use the external URL from .env
BASE_URL = "https://82df8663-624d-438d-8dbb-5551b805e52f.preview.emergentagent.com/api"
TIMEOUT = 60  # 60 seconds timeout for LLM calls

def test_get_root():
    """Test GET /api -> expect HTTP 200 and JSON containing ok: true"""
    print("\n=== Testing GET /api ===")
    try:
        response = requests.get(f"{BASE_URL}", timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get("ok") is True:
                print("✅ GET /api test PASSED")
                return True
            else:
                print("❌ GET /api test FAILED - missing 'ok: true' in response")
                return False
        else:
            print(f"❌ GET /api test FAILED - expected 200, got {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ GET /api test FAILED - Exception: {e}")
        return False

def test_get_health():
    """Test GET /api/health -> expect HTTP 200 and ok:true"""
    print("\n=== Testing GET /api/health ===")
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get("ok") is True:
                print("✅ GET /api/health test PASSED")
                return True
            else:
                print("❌ GET /api/health test FAILED - missing 'ok: true' in response")
                return False
        else:
            print(f"❌ GET /api/health test FAILED - expected 200, got {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ GET /api/health test FAILED - Exception: {e}")
        return False

def test_get_nonexistent():
    """Test GET /api/nonexistent -> expect HTTP 404"""
    print("\n=== Testing GET /api/nonexistent ===")
    try:
        response = requests.get(f"{BASE_URL}/nonexistent", timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 404:
            print("✅ GET /api/nonexistent test PASSED")
            return True
        else:
            print(f"❌ GET /api/nonexistent test FAILED - expected 404, got {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ GET /api/nonexistent test FAILED - Exception: {e}")
        return False

def validate_explain_response(data: Dict[str, Any], expected_topic: str, expected_mode: str) -> bool:
    """Validate the structure of /api/explain response"""
    required_fields = [
        "topic", "mode", "generated_at", "simple_explanation", 
        "real_life_analogy", "step_by_step", "summary", "action_plan"
    ]
    
    # Check all required fields exist
    for field in required_fields:
        if field not in data:
            print(f"❌ Missing required field: {field}")
            return False
    
    # Validate field types and content
    if data["topic"] != expected_topic:
        print(f"❌ Topic mismatch - expected: {expected_topic}, got: {data['topic']}")
        return False
    
    if data["mode"] != expected_mode:
        print(f"❌ Mode mismatch - expected: {expected_mode}, got: {data['mode']}")
        return False
    
    if not isinstance(data["generated_at"], str) or not data["generated_at"]:
        print("❌ generated_at should be a non-empty string")
        return False
    
    if not isinstance(data["simple_explanation"], str) or not data["simple_explanation"]:
        print("❌ simple_explanation should be a non-empty string")
        return False
    
    if not isinstance(data["real_life_analogy"], str) or not data["real_life_analogy"]:
        print("❌ real_life_analogy should be a non-empty string")
        return False
    
    if not isinstance(data["step_by_step"], list) or len(data["step_by_step"]) < 3:
        print(f"❌ step_by_step should be an array with length >= 3, got: {len(data.get('step_by_step', []))}")
        return False
    
    if not isinstance(data["summary"], str) or not data["summary"]:
        print("❌ summary should be a non-empty string")
        return False
    
    if not isinstance(data["action_plan"], list) or len(data["action_plan"]) < 3:
        print(f"❌ action_plan should be an array with length >= 3, got: {len(data.get('action_plan', []))}")
        return False
    
    # Validate action_plan structure
    for i, action in enumerate(data["action_plan"]):
        if not isinstance(action, dict):
            print(f"❌ action_plan[{i}] should be an object")
            return False
        if "step" not in action or not isinstance(action["step"], str):
            print(f"❌ action_plan[{i}] should have a 'step' string field")
            return False
        if "time" not in action or not isinstance(action["time"], str):
            print(f"❌ action_plan[{i}] should have a 'time' string field")
            return False
    
    print("✅ Response structure validation PASSED")
    return True

def test_explain_student_mode():
    """Test POST /api/explain with student mode"""
    print("\n=== Testing POST /api/explain (student mode) ===")
    try:
        payload = {
            "topic": "How does photosynthesis work?",
            "mode": "student"
        }
        
        print(f"Sending request with payload: {json.dumps(payload, indent=2)}")
        response = requests.post(f"{BASE_URL}/explain", json=payload, timeout=TIMEOUT)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response keys: {list(data.keys())}")
            
            if validate_explain_response(data, payload["topic"], payload["mode"]):
                print("✅ POST /api/explain (student mode) test PASSED")
                return True
            else:
                print("❌ POST /api/explain (student mode) test FAILED - invalid response structure")
                return False
        else:
            print(f"❌ POST /api/explain (student mode) test FAILED - expected 200, got {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ POST /api/explain (student mode) test FAILED - Exception: {e}")
        return False

def test_explain_kid_mode():
    """Test POST /api/explain with kid mode"""
    print("\n=== Testing POST /api/explain (kid mode) ===")
    try:
        payload = {
            "topic": "How do rainbows form?",
            "mode": "kid"
        }
        
        print(f"Sending request with payload: {json.dumps(payload, indent=2)}")
        response = requests.post(f"{BASE_URL}/explain", json=payload, timeout=TIMEOUT)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response keys: {list(data.keys())}")
            
            if validate_explain_response(data, payload["topic"], payload["mode"]):
                print("✅ POST /api/explain (kid mode) test PASSED")
                return True
            else:
                print("❌ POST /api/explain (kid mode) test FAILED - invalid response structure")
                return False
        else:
            print(f"❌ POST /api/explain (kid mode) test FAILED - expected 200, got {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ POST /api/explain (kid mode) test FAILED - Exception: {e}")
        return False

def test_explain_pro_mode():
    """Test POST /api/explain with pro mode"""
    print("\n=== Testing POST /api/explain (pro mode) ===")
    try:
        payload = {
            "topic": "Explain transformer attention mechanism",
            "mode": "pro"
        }
        
        print(f"Sending request with payload: {json.dumps(payload, indent=2)}")
        response = requests.post(f"{BASE_URL}/explain", json=payload, timeout=TIMEOUT)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response keys: {list(data.keys())}")
            
            if validate_explain_response(data, payload["topic"], payload["mode"]):
                print("✅ POST /api/explain (pro mode) test PASSED")
                return True
            else:
                print("❌ POST /api/explain (pro mode) test FAILED - invalid response structure")
                return False
        else:
            print(f"❌ POST /api/explain (pro mode) test FAILED - expected 200, got {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ POST /api/explain (pro mode) test FAILED - Exception: {e}")
        return False

def test_explain_empty_topic():
    """Test POST /api/explain with empty topic -> expect 400"""
    print("\n=== Testing POST /api/explain (empty topic) ===")
    try:
        payload = {
            "topic": "",
            "mode": "student"
        }
        
        print(f"Sending request with payload: {json.dumps(payload, indent=2)}")
        response = requests.post(f"{BASE_URL}/explain", json=payload, timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 400:
            data = response.json()
            if "error" in data:
                print("✅ POST /api/explain (empty topic) test PASSED")
                return True
            else:
                print("❌ POST /api/explain (empty topic) test FAILED - missing 'error' field in response")
                return False
        else:
            print(f"❌ POST /api/explain (empty topic) test FAILED - expected 400, got {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ POST /api/explain (empty topic) test FAILED - Exception: {e}")
        return False

def test_explain_long_topic():
    """Test POST /api/explain with topic > 500 chars -> expect 400"""
    print("\n=== Testing POST /api/explain (long topic) ===")
    try:
        # Create a topic with 600+ characters
        long_topic = "A" * 600
        payload = {
            "topic": long_topic,
            "mode": "student"
        }
        
        print(f"Sending request with topic length: {len(long_topic)} chars")
        response = requests.post(f"{BASE_URL}/explain", json=payload, timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 400:
            data = response.json()
            if "error" in data:
                print("✅ POST /api/explain (long topic) test PASSED")
                return True
            else:
                print("❌ POST /api/explain (long topic) test FAILED - missing 'error' field in response")
                return False
        else:
            print(f"❌ POST /api/explain (long topic) test FAILED - expected 400, got {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ POST /api/explain (long topic) test FAILED - Exception: {e}")
        return False

def test_explain_missing_body():
    """Test POST /api/explain with missing body -> expect 400 or 500"""
    print("\n=== Testing POST /api/explain (missing body) ===")
    try:
        # Send request without JSON body
        response = requests.post(f"{BASE_URL}/explain", timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code in [400, 500]:
            print("✅ POST /api/explain (missing body) test PASSED")
            return True
        else:
            print(f"❌ POST /api/explain (missing body) test FAILED - expected 400 or 500, got {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ POST /api/explain (missing body) test FAILED - Exception: {e}")
        return False

def main():
    """Run all backend tests"""
    print("🚀 Starting BrainMate Backend API Tests")
    print(f"Testing against: {BASE_URL}")
    
    tests = [
        test_get_root,
        test_get_health,
        test_get_nonexistent,
        test_explain_student_mode,
        test_explain_kid_mode,
        test_explain_pro_mode,
        test_explain_empty_topic,
        test_explain_long_topic,
        test_explain_missing_body
    ]
    
    results = []
    for test_func in tests:
        try:
            result = test_func()
            results.append(result)
        except Exception as e:
            print(f"❌ Test {test_func.__name__} crashed with exception: {e}")
            results.append(False)
        
        # Small delay between tests
        time.sleep(1)
    
    # Summary
    passed = sum(results)
    total = len(results)
    
    print(f"\n{'='*60}")
    print(f"🏁 TEST SUMMARY: {passed}/{total} tests passed")
    print(f"{'='*60}")
    
    if passed == total:
        print("🎉 All tests PASSED!")
        return 0
    else:
        print(f"⚠️  {total - passed} tests FAILED")
        return 1

if __name__ == "__main__":
    sys.exit(main())