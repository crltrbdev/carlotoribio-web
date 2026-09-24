Every enterprise AI pitch I've sat through in the last two years follows the same arc. The demo is magical. The pilot is promising. The production rollout is a quiet, expensive lesson in the difference between a model that works and a product that works.

The chatbot on this site is my small version of that lesson. It answers questions about my career using an LLM, and the interesting parts of building it had almost nothing to do with the model.

## The model is the easy part

Picking a model in 2026 is a solved problem. Pick a frontier model for quality or a small one for latency and cost. Fine-tune if you genuinely need to — you probably don't. The hard questions are the ones nobody demos:

- **What does the feature do when it's wrong?** Confidence is not accuracy. My chatbot can only answer questions about my resume, so hallucination risk is bounded. A claims-processing assistant at a health insurer does not have that luxury.
- **Who pays for the tokens?** A feature that costs $0.04 per question and answers five questions per visitor is a rounding error. The same per-call cost at enterprise scale is a line item.
- **What happens on request one million?** Rate limits, retries, degraded-mode behavior. AI features fail differently than deterministic code — they fail *fluently*.

## Boring is the moat

The production AI systems I respect most are aggressively unglamorous underneath. A narrow scope. A retrieval layer with actual evals run against it, not vibes. Guardrails that are code, not prompts — because a prompt that says "don't discuss competitor pricing" is a suggestion, and a filter that strips the topic is a control.

> If your AI feature's safety strategy is a longer system prompt, you don't have a safety strategy. You have a hope.

This is why I say AI is a feature, not a product. The product is the workflow, the data, the permissions model, the audit trail. The model is a component — an unusually capable, unusually weird component — but a component. You wouldn't ship a product that was "a database." Don't ship one that's "an LLM."

## What I'd tell a team starting today

1. Scope the feature so a wrong answer is annoying, not dangerous.
2. Write evals before you write prompts. Twenty example questions and expected answers will teach you more than a week of prompt tweaking.
3. Put a cost ceiling in code on day one.
4. Design the fallback. "I'm not sure" is a feature too.

The demo will still be magical. That's fine — magic is for demos. Reliability is for products.
