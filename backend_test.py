#!/usr/bin/env python3
"""
BrainMate Backend API Testing Script
Tests all backend endpoints according to the test requirements.
"""

import os
import requests
import json
import time
import sys
import uuid
import re
from typing import Dict, Any

BASE_URL = os.environ.get("API_BASE_URL", "http://localhost:3000/api")
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

# ============ NEW TESTS FOR MONGODB HISTORY ============

def test_history_crud():
    """Test complete MongoDB history CRUD operations"""
    print("\n=== Testing MongoDB History CRUD Operations ===")
    
    # Generate test user IDs
    user1_id = str(uuid.uuid4())
    user2_id = str(uuid.uuid4())
    saved_entry_id = None
    
    try:
        # Test 1a: POST /api/history with valid payload
        print("\n--- Test 1a: POST /api/history with valid payload ---")
        payload1 = {
            "user_id": user1_id,
            "payload": {
                "topic": "Test topic for history",
                "mode": "student",
                "language": "English",
                "simple_explanation": "This is a test explanation",
                "real_life_analogy": "Like a test in real life",
                "step_by_step": ["Step 1", "Step 2", "Step 3"],
                "summary": "Test summary",
                "action_plan": [
                    {"step": "First action", "time": "5 min"},
                    {"step": "Second action", "time": "10 min"},
                    {"step": "Third action", "time": "15 min"}
                ]
            }
        }
        
        response = requests.post(f"{BASE_URL}/history", json=payload1, timeout=TIMEOUT)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code != 200:
            print("❌ POST /api/history test FAILED - expected 200")
            return False
            
        data = response.json()
        if not data.get("ok") or not data.get("id") or not data.get("entry"):
            print("❌ POST /api/history test FAILED - missing required fields")
            return False
            
        saved_entry_id = data["id"]
        print(f"✅ POST /api/history test PASSED - saved entry ID: {saved_entry_id}")
        
        # Test 1b: POST /api/history without user_id -> expect 400
        print("\n--- Test 1b: POST /api/history without user_id ---")
        payload_no_user = {"payload": {"topic": "test"}}
        response = requests.post(f"{BASE_URL}/history", json=payload_no_user, timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 400:
            print("❌ POST /api/history without user_id test FAILED - expected 400")
            return False
        print("✅ POST /api/history without user_id test PASSED")
        
        # Test 1c: POST /api/history without payload -> expect 400
        print("\n--- Test 1c: POST /api/history without payload ---")
        payload_no_payload = {"user_id": user1_id}
        response = requests.post(f"{BASE_URL}/history", json=payload_no_payload, timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 400:
            print("❌ POST /api/history without payload test FAILED - expected 400")
            return False
        print("✅ POST /api/history without payload test PASSED")
        
        # Test 1d: POST another entry for same user
        print("\n--- Test 1d: POST another entry for same user ---")
        payload2 = {
            "user_id": user1_id,
            "payload": {
                "topic": "Second test topic",
                "mode": "kid",
                "language": "English",
                "simple_explanation": "Second explanation",
                "real_life_analogy": "Second analogy",
                "step_by_step": ["A", "B", "C"],
                "summary": "Second summary",
                "action_plan": [
                    {"step": "Action A", "time": "2 min"},
                    {"step": "Action B", "time": "4 min"},
                    {"step": "Action C", "time": "6 min"}
                ]
            }
        }
        
        response = requests.post(f"{BASE_URL}/history", json=payload2, timeout=TIMEOUT)
        if response.status_code != 200:
            print("❌ POST second entry test FAILED")
            return False
        print("✅ POST second entry test PASSED")
        
        # Test 1e: GET /api/history?user_id=<uuid> -> expect 200 with items array length >= 2
        print("\n--- Test 1e: GET /api/history for user1 ---")
        response = requests.get(f"{BASE_URL}/history?user_id={user1_id}", timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code != 200:
            print("❌ GET /api/history test FAILED - expected 200")
            return False
            
        data = response.json()
        if not isinstance(data.get("items"), list) or len(data["items"]) < 2:
            print(f"❌ GET /api/history test FAILED - expected items array length >= 2, got {len(data.get('items', []))}")
            return False
            
        # Verify structure of items
        for item in data["items"]:
            required_keys = ["id", "user_id", "topic", "mode", "language", "created_at", "payload"]
            for key in required_keys:
                if key not in item:
                    print(f"❌ GET /api/history test FAILED - missing key '{key}' in item")
                    return False
        
        print("✅ GET /api/history test PASSED")
        
        # Test 1f: GET /api/history without user_id -> expect 400
        print("\n--- Test 1f: GET /api/history without user_id ---")
        response = requests.get(f"{BASE_URL}/history", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 400:
            print("❌ GET /api/history without user_id test FAILED - expected 400")
            return False
        print("✅ GET /api/history without user_id test PASSED")
        
        # Test 1g: Create second user and verify isolation
        print("\n--- Test 1g: Create second user and verify isolation ---")
        payload_user2 = {
            "user_id": user2_id,
            "payload": {
                "topic": "User 2 topic",
                "mode": "pro",
                "language": "English",
                "simple_explanation": "User 2 explanation",
                "real_life_analogy": "User 2 analogy",
                "step_by_step": ["X", "Y", "Z"],
                "summary": "User 2 summary",
                "action_plan": [{"step": "User 2 action", "time": "1 hour"}]
            }
        }
        
        response = requests.post(f"{BASE_URL}/history", json=payload_user2, timeout=TIMEOUT)
        if response.status_code != 200:
            print("❌ POST for user2 test FAILED")
            return False
            
        # Get user2's history - should have exactly 1 item
        response = requests.get(f"{BASE_URL}/history?user_id={user2_id}", timeout=10)
        if response.status_code != 200:
            print("❌ GET user2 history test FAILED")
            return False
            
        data = response.json()
        if len(data.get("items", [])) != 1:
            print(f"❌ User isolation test FAILED - user2 should have 1 item, got {len(data.get('items', []))}")
            return False
            
        # Verify user1 still has 2 items
        response = requests.get(f"{BASE_URL}/history?user_id={user1_id}", timeout=10)
        if response.status_code != 200:
            print("❌ GET user1 history verification test FAILED")
            return False
            
        data = response.json()
        if len(data.get("items", [])) != 2:
            print(f"❌ User isolation test FAILED - user1 should still have 2 items, got {len(data.get('items', []))}")
            return False
            
        print("✅ User isolation test PASSED")
        
        # Test 1h: DELETE /api/history/<id>?user_id=<uuid> (delete one)
        print("\n--- Test 1h: DELETE single entry ---")
        response = requests.delete(f"{BASE_URL}/history/{saved_entry_id}?user_id={user1_id}", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print("❌ DELETE single entry test FAILED - expected 200")
            return False
            
        # Verify count decreased by 1
        response = requests.get(f"{BASE_URL}/history?user_id={user1_id}", timeout=10)
        if response.status_code != 200:
            print("❌ GET after delete verification test FAILED")
            return False
            
        data = response.json()
        if len(data.get("items", [])) != 1:
            print(f"❌ DELETE verification test FAILED - expected 1 item after delete, got {len(data.get('items', []))}")
            return False
            
        print("✅ DELETE single entry test PASSED")
        
        # Test 1i: DELETE /api/history/<bogus>?user_id=<uuid> -> expect 404
        print("\n--- Test 1i: DELETE bogus entry ---")
        bogus_id = str(uuid.uuid4())
        response = requests.delete(f"{BASE_URL}/history/{bogus_id}?user_id={user1_id}", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 404:
            print("❌ DELETE bogus entry test FAILED - expected 404")
            return False
        print("✅ DELETE bogus entry test PASSED")
        
        # Test 1j: DELETE /api/history?user_id=<uuid> (clear all)
        print("\n--- Test 1j: DELETE all entries for user ---")
        response = requests.delete(f"{BASE_URL}/history?user_id={user1_id}", timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code != 200:
            print("❌ DELETE all entries test FAILED - expected 200")
            return False
            
        data = response.json()
        if not data.get("ok") or "deleted" not in data:
            print("❌ DELETE all entries test FAILED - missing ok or deleted field")
            return False
            
        # Verify items array is empty
        response = requests.get(f"{BASE_URL}/history?user_id={user1_id}", timeout=10)
        if response.status_code != 200:
            print("❌ GET after delete all verification test FAILED")
            return False
            
        data = response.json()
        if len(data.get("items", [])) != 0:
            print(f"❌ DELETE all verification test FAILED - expected 0 items, got {len(data.get('items', []))}")
            return False
            
        print("✅ DELETE all entries test PASSED")
        
        # Cleanup user2
        requests.delete(f"{BASE_URL}/history?user_id={user2_id}", timeout=10)
        
        print("✅ MongoDB History CRUD tests ALL PASSED")
        return True
        
    except Exception as e:
        print(f"❌ MongoDB History CRUD tests FAILED - Exception: {e}")
        return False

def test_multi_language_spanish():
    """Test multi-language support with Spanish"""
    print("\n=== Testing Multi-language Support (Spanish) ===")
    try:
        payload = {
            "topic": "How does photosynthesis work?",
            "mode": "kid",
            "language": "Spanish"
        }
        
        print(f"Sending request with payload: {json.dumps(payload, indent=2)}")
        response = requests.post(f"{BASE_URL}/explain", json=payload, timeout=TIMEOUT)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ Spanish language test FAILED - expected 200, got {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
        data = response.json()
        
        # Check that response contains Spanish content
        simple_explanation = data.get("simple_explanation", "")
        summary = data.get("summary", "")
        
        # Look for common Spanish words or accented characters
        spanish_indicators = ["es", "que", "la", "el", "de", "en", "un", "una", "con", "por", "para"]
        accented_chars = ["á", "é", "í", "ó", "ú", "ñ", "ü"]
        
        has_spanish_words = any(word in simple_explanation.lower() for word in spanish_indicators)
        has_accented_chars = any(char in simple_explanation + summary for char in accented_chars)
        
        if not (has_spanish_words or has_accented_chars):
            print(f"❌ Spanish language test FAILED - content doesn't appear to be in Spanish")
            print(f"Simple explanation: {simple_explanation[:200]}...")
            return False
            
        print("✅ Spanish language test PASSED")
        return True
        
    except Exception as e:
        print(f"❌ Spanish language test FAILED - Exception: {e}")
        return False

def test_multi_language_hindi():
    """Test multi-language support with Hindi"""
    print("\n=== Testing Multi-language Support (Hindi) ===")
    try:
        payload = {
            "topic": "What is gravity?",
            "mode": "student",
            "language": "Hindi"
        }
        
        print(f"Sending request with payload: {json.dumps(payload, indent=2)}")
        response = requests.post(f"{BASE_URL}/explain", json=payload, timeout=TIMEOUT)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ Hindi language test FAILED - expected 200, got {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
        data = response.json()
        
        # Check for Devanagari script (U+0900–U+097F)
        simple_explanation = data.get("simple_explanation", "")
        
        has_devanagari = any(0x0900 <= ord(char) <= 0x097F for char in simple_explanation)
        
        if not has_devanagari:
            print(f"❌ Hindi language test FAILED - content doesn't contain Devanagari script")
            print(f"Simple explanation: {simple_explanation[:200]}...")
            return False
            
        print("✅ Hindi language test PASSED")
        return True
        
    except Exception as e:
        print(f"❌ Hindi language test FAILED - Exception: {e}")
        return False

def test_streaming_chat():
    """Test streaming chat endpoint"""
    print("\n=== Testing Streaming Chat ===")
    try:
        payload = {
            "topic": "What is gravity?",
            "mode": "student",
            "language": "English",
            "context": "Gravity pulls things toward each other.",
            "messages": [{"role": "user", "content": "Give me one short example"}]
        }
        
        print(f"Sending request with payload: {json.dumps(payload, indent=2)}")
        response = requests.post(f"{BASE_URL}/chat/stream", json=payload, timeout=TIMEOUT, stream=True)
        print(f"Status Code: {response.status_code}")
        print(f"Content-Type: {response.headers.get('content-type', 'N/A')}")
        
        if response.status_code != 200:
            print(f"❌ Streaming chat test FAILED - expected 200, got {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
        content_type = response.headers.get('content-type', '')
        if not content_type.startswith('text/event-stream'):
            print(f"❌ Streaming chat test FAILED - expected text/event-stream, got {content_type}")
            return False
            
        # Read the streaming response
        token_count = 0
        concatenated_text = ""
        done_received = False
        
        for line in response.iter_lines(decode_unicode=True):
            if not line:
                continue
                
            if line.startswith('event: token'):
                token_count += 1
            elif line.startswith('data: ') and token_count > 0:
                try:
                    data_json = json.loads(line[6:])  # Remove 'data: ' prefix
                    if 'text' in data_json:
                        concatenated_text += data_json['text']
                except json.JSONDecodeError:
                    pass
            elif line.startswith('event: done'):
                done_received = True
                break
                
        print(f"Token events received: {token_count}")
        print(f"Concatenated text length: {len(concatenated_text)}")
        print(f"Done event received: {done_received}")
        
        if token_count < 5:
            print(f"❌ Streaming chat test FAILED - expected at least 5 token events, got {token_count}")
            return False
            
        if len(concatenated_text) == 0:
            print("❌ Streaming chat test FAILED - concatenated text is empty")
            return False
            
        if not done_received:
            print("❌ Streaming chat test FAILED - 'event: done' not received")
            return False
            
        print("✅ Streaming chat test PASSED")
        return True
        
    except Exception as e:
        print(f"❌ Streaming chat test FAILED - Exception: {e}")
        return False

def test_streaming_explain():
    """Test streaming explain endpoint"""
    print("\n=== Testing Streaming Explain ===")
    try:
        payload = {
            "topic": "Briefly explain DNS",
            "mode": "student",
            "language": "English"
        }
        
        print(f"Sending request with payload: {json.dumps(payload, indent=2)}")
        response = requests.post(f"{BASE_URL}/explain/stream", json=payload, timeout=TIMEOUT, stream=True)
        print(f"Status Code: {response.status_code}")
        print(f"Content-Type: {response.headers.get('content-type', 'N/A')}")
        
        if response.status_code != 200:
            print(f"❌ Streaming explain test FAILED - expected 200, got {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
        content_type = response.headers.get('content-type', '')
        if not content_type.startswith('text/event-stream'):
            print(f"❌ Streaming explain test FAILED - expected text/event-stream, got {content_type}")
            return False
            
        # Read the streaming response
        token_count = 0
        done_received = False
        
        for line in response.iter_lines(decode_unicode=True):
            if not line:
                continue
                
            if line.startswith('event: token'):
                token_count += 1
            elif line.startswith('event: done'):
                done_received = True
                break
                
        print(f"Token events received: {token_count}")
        print(f"Done event received: {done_received}")
        
        if token_count == 0:
            print("❌ Streaming explain test FAILED - no token events received")
            return False
            
        if not done_received:
            print("❌ Streaming explain test FAILED - 'event: done' not received")
            return False
            
        print("✅ Streaming explain test PASSED")
        return True
        
    except Exception as e:
        print(f"❌ Streaming explain test FAILED - Exception: {e}")
        return False

def test_explain_regression():
    """Re-verify basic explain endpoint still works"""
    print("\n=== Testing Explain Regression ===")
    try:
        payload = {
            "topic": "How does compound interest work?",
            "mode": "student"
        }
        
        print(f"Sending request with payload: {json.dumps(payload, indent=2)}")
        response = requests.post(f"{BASE_URL}/explain", json=payload, timeout=TIMEOUT)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ Explain regression test FAILED - expected 200, got {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
        data = response.json()
        
        # Verify 5-section JSON structure
        required_fields = [
            "topic", "mode", "generated_at", "simple_explanation", 
            "real_life_analogy", "step_by_step", "summary", "action_plan"
        ]
        
        for field in required_fields:
            if field not in data:
                print(f"❌ Explain regression test FAILED - missing field: {field}")
                return False
                
        print("✅ Explain regression test PASSED")
        return True
        
    except Exception as e:
        print(f"❌ Explain regression test FAILED - Exception: {e}")
        return False

def main():
    """Run all backend tests"""
    print("🚀 Starting BrainMate Backend API Tests")
    print(f"Testing against: {BASE_URL}")
    
    tests = [
        # Basic API tests
        test_get_root,
        test_get_health,
        test_get_nonexistent,
        
        # Basic explain tests
        test_explain_student_mode,
        test_explain_kid_mode,
        test_explain_pro_mode,
        test_explain_empty_topic,
        test_explain_long_topic,
        test_explain_missing_body,
        
        # NEW TESTS
        test_history_crud,
        test_multi_language_spanish,
        test_multi_language_hindi,
        test_streaming_chat,
        test_streaming_explain,
        test_explain_regression
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