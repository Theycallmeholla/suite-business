### Claude Code Best-Practices Cheat Sheet

---

#### 1  Set-up & Configuration

• **Seed the repo with `CLAUDE.md` files** at project-root, sub-folders, or `~/.claude/` to preload commands, style rules, and env notes every time Claude starts. Keep them concise and revisit them as your team learns what works. ([anthropic.com][1])
• **Curate an allow-list** of tools and commands (file edits, `git commit:*`, MCP calls, etc.) with `/permissions`, the `--allowedTools` flag, or by editing `.claude/settings.json`. Start conservative and widen only when you trust a tool. ([anthropic.com][1], [anthropic.com][1])
• **Install the `gh` CLI** so Claude can open PRs, label issues, and read review comments seamlessly. ([anthropic.com][1])

---

#### 2  Give Claude More Toys

• **Expose custom bash utilities**—show help text once and document them in `CLAUDE.md`.
• **Plug in MCP or REST servers** (e.g., Puppeteer for screenshots, Sentry for logs) via a checked-in `.mcp.json` so every engineer gets the same toolkit. ([anthropic.com][1])
• **Save reusable prompt templates** as Markdown files in `.claude/commands/`; they surface as handy `/slash-commands` and can accept `$ARGUMENTS`. ([anthropic.com][1])

---

#### 3  Proven Workflows (pick what fits)

| Pattern                            | How it flows                                                                               | When to use                                                   |
| ---------------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------- |
| **Explore → Plan → Code → Commit** | Tell Claude *not* to code yet, let it “think harder,” produce a plan, then implement & PR. | Anything non-trivial. ([anthropic.com][1])                    |
| **TDD Loop**                       | Ask Claude to write failing tests first, commit them, then iterate until tests pass.       | Back-end changes, bug-fixes. ([anthropic.com][1])             |
| **Screenshot-driven UI**           | Provide a mock, let Claude code, auto-screenshot, iterate until pixel-perfect.             | Front-end polish. ([anthropic.com][1])                        |
| **Safe YOLO**                      | `claude --dangerously-skip-permissions` inside a disposable container.                     | Mass lint-fixes, boilerplate generation. ([anthropic.com][1]) |

Other power moves: “codebase Q\&A” for onboarding, full git history searches, auto-writing commit messages, and interactive PR clean-ups. ([anthropic.com][1])

---

#### 4  Interaction & Context Tips

* **Be painfully specific.** “Write a test for logged-out edge case” beats “add tests.” ([anthropic.com][1])
* **Feed it rich context**: paste images, drag URLs, list exact files, or pipe logs (`cat errors.log | claude`).
* **Course-correct early**: hit *Esc* to interrupt, double-Esc to edit history, or ask Claude to undo. ([anthropic.com][1])
* **/clear often** to keep the context window fresh, and use checklists/scratchpads for multi-step migrations. ([anthropic.com][1])

---

#### 5  Automation & Scaling

* **Headless mode (`claude -p "..."`)** lets you run subjective linting, issue triage, or migrations in CI; add `--output-format stream-json` for structured results. ([anthropic.com][1])
* **Multi-Claude workflows**: run separate terminals/worktrees so one instance codes while another reviews or tests—parallel work, fewer context collisions. ([anthropic.com][1])

---

#### 6  Safety Checklist

✓ Keep the default permissions tight; widen slowly.
✓ Run YOLO mode only inside an isolated container with no prod creds.
✓ Review Claude’s suggested commands before auto-approving in critical repos. ([anthropic.com][1])

---

#### 7  Quick Reference (memorize these)

* `/permissions` – add/remove tools or domains.
* `/clear` – wipe conversation context.
* `think hard / think harder / ultrathink` – grant larger reasoning budgets.
* `Esc` – interrupt; `Esc Esc` – edit last prompt.
* `claude -p "<prompt>" --allowedTools Edit` – non-interactive run.

---

**Bottom line:** Document your environment, grant only the tools you trust, ask clear pointed questions, iterate in tight loops, and scale out with headless or multi-Claude setups when the task warrants it. Follow those habits and Claude Code becomes a force multiplier instead of just another chat window.

[1]: https://www.anthropic.com/engineering/claude-code-best-practices "Claude Code Best Practices \ Anthropic"
