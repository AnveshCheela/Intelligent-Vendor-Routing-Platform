# Agentic AI Integration Usage

This document outlines how Generative AI (Google Gemini) is integrated into the Intelligent Vendor Routing Platform to enhance operational efficiency.

## 1. Natural Language to JSON Configuration
Instead of requiring system administrators to manually write complex JSON syntax to deploy new routing rules, we utilize Google's `gemini-2.5-flash` model as a specialized configuration generator.

### The Workflow
1. **User Prompt**: The administrator types an English prompt in the Dashboard (e.g., *"Route 80% to Stripe Identity and 20% to Jumio"*).
2. **System Prompt Injection**: The Node.js backend intercepts this and wraps it in a strict "System Prompt". This prompt forces the AI into a rigid persona that *must* output valid JSON conforming exactly to the application's Routing Schema, and forbids conversational filler.
3. **Execution**: The backend calls the `generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent` endpoint using the Google AI SDK.
4. **Validation & Deployment**: The returned string is parsed using `JSON.parse()`. If valid, it is presented to the user to instantly update the active routing strategy.

### Prompt Engineering
We utilize structured prompt engineering to guarantee deterministic output. We explicitly provide the schema interface (e.g. `strategy: 'weighted'`, `weights: { Vendor: % }`) so the AI knows exactly what keys to map the English numbers to.

## 2. Graceful Degradation & Strict Mode
To ensure enterprise stability, the AI integration is strictly decoupled from the core routing path.
If the Gemini API key is missing, expired, or rate-limited (e.g., HTTP 400 or 429), the `aiController` catches the exception and falls back to a deterministic `getMockConfig()` function. This prevents a third-party AI failure from taking down the routing dashboard.

### Strict Agentic AI Mode
Administrators can enable `strictAgenticAiMode` via the Global Settings UI. When enabled, the system enforces rigid safety rails: it completely disables the `getMockConfig()` fallback. If an API key is missing or the AI fails, the system deliberately throws a hard error rather than allowing a mock configuration to slip into a production environment undetected.

## Future Possibilities
While the current integration focuses on configuration generation, the framework is designed to support:
- **AI-Driven Anomaly Detection**: Having a scheduled background worker feed the last 24 hours of latency logs into the LLM to identify sub-optimal routing patterns.
- **Predictive Scaling**: Asking the LLM to analyze traffic distribution and predict cost overruns before they occur.
