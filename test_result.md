#====================================================================================================
# START - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================

# THIS SECTION CONTAINS CRITICAL TESTING INSTRUCTIONS FOR BOTH AGENTS
# BOTH MAIN_AGENT AND TESTING_AGENT MUST PRESERVE THIS ENTIRE BLOCK

# Communication Protocol:
# If the `testing_agent` is available, main agent should delegate all testing tasks to it.
#
# You have access to a file called `test_result.md`. This file contains the complete testing state
# and history, and is the primary means of communication between main and the testing agent.
#
# Main and testing agents must follow this exact format to maintain testing data. 
# The testing data must be entered in yaml format Below is the data structure:
# 
## user_problem_statement: {problem_statement}
## backend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.py"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## frontend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.js"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## metadata:
##   created_by: "main_agent"
##   version: "1.0"
##   test_sequence: 0
##   run_ui: false
##
## test_plan:
##   current_focus:
##     - "Task name 1"
##     - "Task name 2"
##   stuck_tasks:
##     - "Task name with persistent issues"
##   test_all: false
##   test_priority: "high_first"  # or "sequential" or "stuck_first"
##
## agent_communication:
##     -agent: "main"  # or "testing" or "user"
##     -message: "Communication message between agents"

# Protocol Guidelines for Main agent
#
# 1. Update Test Result File Before Testing:
#    - Main agent must always update the `test_result.md` file before calling the testing agent
#    - Add implementation details to the status_history
#    - Set `needs_retesting` to true for tasks that need testing
#    - Update the `test_plan` section to guide testing priorities
#    - Add a message to `agent_communication` explaining what you've done
#
# 2. Incorporate User Feedback:
#    - When a user provides feedback that something is or isn't working, add this information to the relevant task's status_history
#    - Update the working status based on user feedback
#    - If a user reports an issue with a task that was marked as working, increment the stuck_count
#    - Whenever user reports issue in the app, if we have testing agent and task_result.md file so find the appropriate task for that and append in status_history of that task to contain the user concern and problem as well 
#
# 3. Track Stuck Tasks:
#    - Monitor which tasks have high stuck_count values or where you are fixing same issue again and again, analyze that when you read task_result.md
#    - For persistent issues, use websearch tool to find solutions
#    - Pay special attention to tasks in the stuck_tasks list
#    - When you fix an issue with a stuck task, don't reset the stuck_count until the testing agent confirms it's working
#
# 4. Provide Context to Testing Agent:
#    - When calling the testing agent, provide clear instructions about:
#      - Which tasks need testing (reference the test_plan)
#      - Any authentication details or configuration needed
#      - Specific test scenarios to focus on
#      - Any known issues or edge cases to verify
#
# 5. Call the testing agent with specific instructions referring to test_result.md
#
# IMPORTANT: Main agent must ALWAYS update test_result.md BEFORE calling the testing agent, as it relies on this file to understand what to test next.

#====================================================================================================
# END - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================



#====================================================================================================
# Testing Data - Main Agent and testing sub agent both should log testing data below this section
#====================================================================================================

user_problem_statement: |
  Build "BrainMate" — a full-stack Next.js AI clarity/learning assistant.
  - Input: topic + mode (kid/student/pro)
  - Backend calls LLM and returns structured JSON: simple_explanation, real_life_analogy,
    step_by_step (array), summary, action_plan (array of {step, time}).
  - Uses Emergent Universal LLM key (provider=openai, model=gpt-4o-mini) via a
    Python bridge (emergentintegrations) spawned from the Next.js API route.
  - Premium, minimal UI (white cards, indigo accent #4F46E5, Inter font).
  - History stored in localStorage (frontend-only), copy + Web Share API.

backend:
  - task: "POST /api/explain returns structured JSON explanation"
    implemented: true
    working: true
    file: "app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "Manually verified with curl for topic 'How does compound interest work?' in student mode. Response contained all 5 required fields with correct types. Uses Python bridge /app/lib/llm/emergent_llm.py invoking emergentintegrations LlmChat with provider=openai, model=gpt-4o-mini, EMERGENT_LLM_KEY from .env."
      - working: true
        agent: "testing"
        comment: "Comprehensive automated testing completed. Tested all 3 modes (kid/student/pro) with different topics. All responses return correct JSON structure with required fields: topic, mode, generated_at, simple_explanation, real_life_analogy, step_by_step (array >=3), summary, action_plan (array of {step, time} >=3). LLM integration working perfectly via Python bridge."
  - task: "GET /api health check"
    implemented: true
    working: true
    file: "app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "low"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "GET /api and /api/health return {ok:true}."
      - working: true
        agent: "testing"
        comment: "Automated testing confirmed: GET /api returns {ok:true, service:'BrainMate API', time:ISO_timestamp} with 200 status. GET /api/health returns identical response with 200 status."
  - task: "Validation: empty topic -> 400, topic >500 chars -> 400, unknown route -> 404"
    implemented: true
    working: true
    file: "app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "medium"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Implemented but needs automated verification."
      - working: true
        agent: "testing"
        comment: "All validation tests passed: Empty topic returns 400 with 'topic is required' error. Topic >500 chars returns 400 with 'topic too long' error. Unknown routes return 404 with 'Not found' error. Missing request body returns 500 with JSON parse error (expected behavior)."
  - task: "Modes (kid/student/pro) produce different depth/tone"
    implemented: true
    working: true
    file: "app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "medium"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Mode instruction is appended to user prompt. Verify response JSON shape is preserved across all three modes and explanation tone differs."
      - working: true
        agent: "testing"
        comment: "Mode differentiation verified: Tested same topic 'How does gravity work?' across all 3 modes. Each mode produces distinctly different explanations with appropriate complexity levels. Kid mode uses simple language, student mode is educational, pro mode is technical. JSON structure preserved across all modes."

frontend:
  - task: "BrainMate UI — input, mode selector, results cards, history sidebar, copy+share"
    implemented: true
    working: "NA"
    file: "app/page.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Built premium minimal UI matching spec. Not tested automatically yet — waiting for user approval before invoking frontend testing agent."

metadata:
  created_by: "main_agent"
  version: "1.0"
  test_sequence: 1
  run_ui: false

test_plan:
  current_focus: []
  stuck_tasks: []
  test_all: false
  test_priority: "high_first"

agent_communication:
  - agent: "main"
    message: |
      MVP built end-to-end. Backend is /api/explain (POST). It shells out to
      /app/lib/llm/emergent_llm.py which uses emergentintegrations LlmChat
      (provider=openai, model=gpt-4o-mini) with EMERGENT_LLM_KEY from /app/.env.
      Please test:
        1. POST /api/explain with a real topic in each mode; verify JSON has
           keys: simple_explanation (str), real_life_analogy (str),
           step_by_step (array of strings, len >=3), summary (str),
           action_plan (array of {step, time}, len >=3).
        2. POST /api/explain with empty topic -> expect 400.
        3. POST /api/explain with topic of 600 chars -> expect 400.
        4. GET /api -> expect {ok:true}.
        5. Unknown route GET /api/foo -> expect 404.
      The python bridge path is absolute; python3 is /root/.venv/bin/python3.
      Do NOT test frontend.
  - agent: "testing"
    message: |
      ✅ BACKEND TESTING COMPLETE - ALL TESTS PASSED (9/9)
      
      Comprehensive testing completed for all backend functionality:
      
      1. ✅ GET /api -> Returns 200 with {ok:true, service:'BrainMate API', time:timestamp}
      2. ✅ GET /api/health -> Returns 200 with {ok:true, service:'BrainMate API', time:timestamp}  
      3. ✅ GET /api/nonexistent -> Returns 404 with error message
      4. ✅ POST /api/explain (student mode) -> Returns 200 with complete JSON structure
      5. ✅ POST /api/explain (kid mode) -> Returns 200 with complete JSON structure
      6. ✅ POST /api/explain (pro mode) -> Returns 200 with complete JSON structure
      7. ✅ POST /api/explain (empty topic) -> Returns 400 with error message
      8. ✅ POST /api/explain (600+ char topic) -> Returns 400 with error message
      9. ✅ POST /api/explain (missing body) -> Returns 500 with JSON parse error
      
      Additional verification:
      - ✅ Mode differentiation confirmed: Each mode produces distinctly different explanations
      - ✅ JSON structure validation: All responses contain required fields with correct types
      - ✅ LLM integration working: Python bridge successfully calls emergentintegrations
      - ✅ Error handling working: Proper validation and error responses
      
      All backend tasks marked as working=true and needs_retesting=false.
      Backend is production-ready.
