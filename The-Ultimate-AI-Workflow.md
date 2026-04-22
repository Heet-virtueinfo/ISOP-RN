# ⚡ The Ultimate AI Developer Workflow: Web to Local IDE

This manual defines the two-phase system for writing software with AI. It leverages **Web LLMs** (Claude/Gemini) for high-level architecture because of their massive context windows, and **Agentic IDEs** (Antigravity) for surgical, day-to-day coding directly in your file system.

The core philosophy of this workflow is **Persona Constraint**: forcing the AI out of its default "helpful chatbot" mode and into a strict, highly constrained "Senior Tech Lead" execution mode.

---

## Phase 1: The Macro Web Workspace (Architecture)

Web interfaces are best for designing new systems or deep debugging, but they suffer from "context drift" if you don't constrain them.

### Step 1: Codebase Packing (Repomix)

Before asking the AI to architect a feature, you must give it the exact state of your code.

1. Open your project terminal.
2. Run `npx repomix`.
3. This generates a single `repomix.xml` file containing your entire file structure and code safely packed for an LLM.

### Step 2: Web Project Configuration

1. Create a **Project** (Claude) or **Gem** (Gemini).
2. **Knowledge Base:** Upload the `repomix.xml` file.
3. **Custom Instructions:** Paste a "Command Dictionary" to force the AI to respond to specific triggers.

### Step 3: The Command Dictionary

Add these to your web instructions. When you type one of these slash commands, the AI drops its persona and obeys strictly:

* **/debug:** Trace the provided code line-by-line. Identify the exact line causing the issue. Explain the root cause in one sentence, then provide the corrected code.
* **ARCHITECT:** Do not write application code. Design the full system structure based on the uploaded XML map. Output a Markdown document containing folder structure, data models, and core API endpoints.
* **REFACTOR:** Clean up the provided code using DRY/SOLID principles. Break massive functions into smaller helpers. Do not change business logic.
* **/optimize:** Profile the code for performance bottlenecks. Suggest the most performant alternative and provide the code block.

---

## Phase 2: The Micro Local IDE (Antigravity)

Once the architecture is planned on the web, move to the IDE. The IDE agent reads your local file system and is controlled via the `.agents` directory structure.

### 1. Global Rules (`~/.agents/rules/global-standards.md`)

This file lives on your computer's root drive. It dictates your permanent developer identity across *every* project you ever open.

* **Location (Mac/Linux):** `~/.agents/rules/`
* **Location (Windows):** `C:\Users\YourName\.agents\rules\`
* **Purpose:** Enforce token efficiency, zero-fluff communication, and global formatting rules (e.g., "Always use strict TypeScript").

### 2. Workspace Rules (`./.agents/rules/`)

These rules live inside your specific project folder.

* **Location:** `YourProject/.agents/rules/rn-expert.md`
* **Purpose:** Dictates the specific tech stack for the current repository.
* **Example:** "For this workspace, strictly use React Native functional components, Hooks, and react-native-reanimated for animations."

### 3. Active Skills (`./.agents/skills/`)

Skills are "Active Playbooks." The agent ignores them until you explicitly call them, which prevents context window bloat and saves API tokens.

* **Location:** `YourProject/.agents/skills/api-auditor/SKILL.md`
* **Execution:** Type `/api-auditor` in the chat panel to force the agent to load that specific set of instructions for the current task.

---

## Phase 3: Token Optimization & Communication Standards

To prevent the AI from burning API credits and hallucinating, your Global Rules must enforce these execution constraints:

### Zero-Fluff Communication

* **The Silence Rule:** Ban conversational filler ("Certainly!", "I'd be happy to help", "Great question").
* **Code First:** The AI must lead with the exact solution or code block. Explanations go *after* the code.
* **No Repetition:** The AI must never repeat your prompt or requirements back to you.

### Efficient Code Generation

* **Surgical Edits:** When modifying existing files, the AI must output *only the changed logic blocks*, not re-print the entire 500-line file.
* **No Placeholders:** The provided snippets must be syntactically complete. Banned: `// ... rest of the logic`.
* **Read Before Writing:** The AI must autonomously use internal tools (like `@workspace`) to read a file's current state before proposing code diffs.
* **Plan First:** For cross-stack features, the AI must output a bulleted execution plan and wait for explicit approval before writing code.

---

## Phase 4: Diagnostics & Verification

Always test your environment when setting up a new machine or rule file to ensure the IDE router is reading your folders correctly.

1. **The Silence Test:** Ask a simple coding question. If the agent replies with "Hello!" instead of immediate code, your global rules are failing.
2. **The Tracer Emoji:** Add `CRITICAL RULE: Start every response with 🛑` to your global file. If the emoji appears, your rules are active.
3. **The Ping Test:** Create a skill at `.agents/skills/ping/SKILL.md` that forces the AI to reply "PONG." Type `/ping` in the chat. If it answers "PONG," your local folder routing is flawless.
