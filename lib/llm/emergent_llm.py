#!/usr/bin/env python3
"""Bridge script: called by the Next.js API route to invoke the Emergent LLM.

Reads JSON from stdin with { topic, mode, system_prompt, user_prompt, model, provider, session_id }
Writes JSON result to stdout: { content: "..." } or { error: "..." }
"""
import asyncio
import json
import os
import sys
import uuid


async def run():
    try:
        raw = sys.stdin.read()
        req = json.loads(raw) if raw else {}

        system_prompt = req.get("system_prompt", "You are a helpful assistant.")
        user_prompt = req.get("user_prompt", "")
        provider = req.get("provider", "openai")
        model = req.get("model", "gpt-4o-mini")
        session_id = req.get("session_id") or f"brainmate-{uuid.uuid4().hex[:10]}"

        api_key = os.environ.get("EMERGENT_LLM_KEY")
        if not api_key:
            print(json.dumps({"error": "EMERGENT_LLM_KEY not set in environment"}))
            return

        # Lazy import so missing deps surface clearly
        from emergentintegrations.llm.chat import LlmChat, UserMessage

        chat = LlmChat(
            api_key=api_key,
            session_id=session_id,
            system_message=system_prompt,
        ).with_model(provider, model)

        msg = UserMessage(text=user_prompt)
        response = await chat.send_message(msg)

        # response is expected to be a string (the model's reply)
        if not isinstance(response, str):
            response = str(response)

        print(json.dumps({"content": response}))
    except Exception as e:  # pragma: no cover
        print(json.dumps({"error": f"{type(e).__name__}: {e}"}))


if __name__ == "__main__":
    asyncio.run(run())
