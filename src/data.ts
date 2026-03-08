export const EVAL_SET = [
  { id: 1, question: "What is the pricing model?",                  keywords: ["price","pricing","cost","plan","free","paid","subscription","tier"] },
  { id: 2, question: "How do I get started?",                       keywords: ["start","begin","install","setup","sign up","create","first step"] },
  { id: 3, question: "What authentication methods are supported?",  keywords: ["auth","login","oauth","sso","password","token","jwt","api key"] },
  { id: 4, question: "What are the system requirements?",           keywords: ["require","system","os","browser","version","minimum","support"] },
  { id: 5, question: "How is data stored or retained?",             keywords: ["data","store","retain","privacy","gdpr","delete","persist","database"] },
];

export const SAMPLE_DOC = `# SwarmForge AI — Product Documentation

> The browser-based 5-agent coding swarm. Build, refactor, and deploy without leaving your browser.

## Overview
SwarmForge AI is a browser-based coding assistant powered by a 5-agent swarm (Architect, Engineer, Designer, Creative, Tester). It helps developers build, refactor, and deploy web applications entirely from the browser.

## Pricing
SwarmForge AI offers three tiers:
- **Free**: Up to 20 AI requests/day, 3 projects, basic agent (Engineer only)
- **Pro** ($19/month): Unlimited requests, full 5-agent swarm, GitHub sync, Vercel deploy
- **Team** ($49/month): Everything in Pro plus shared workspaces, priority support, and usage analytics

## Getting Started
1. Open SwarmForge AI in Chrome, Edge, or Arc
2. Click "New Project" to create your first project
3. Select a framework (HTML+Tailwind, React, Next.js)
4. Type a request in the AI Chat tab — e.g. "Build a landing page with dark mode"
5. The agent swarm responds with code you can preview instantly
6. Click "Apply Changes" to update your files, then "Deploy" to go live

## Authentication
SwarmForge AI uses GitHub OAuth for login. You can also use API key authentication for CI/CD integrations. SSO is available on Team plans. JWT tokens are issued per session with a 24-hour expiry. Password-based login is not supported.

## System Requirements
- Browser: Chrome 110+, Edge 110+, Firefox 115+, Safari 16+
- Node.js 18+ (for local dev server features)
- Minimum 4GB RAM recommended for WebLLM offline mode
- Supported OS: Windows 10+, macOS 12+, Ubuntu 22+

## Data & Privacy
All project files are stored locally in your browser's IndexedDB by default. No code leaves your machine unless you explicitly deploy or enable GitHub sync. SwarmForge is GDPR compliant. You can delete all stored data from Settings > Privacy > Clear All Data. Data is retained until you clear it — there is no automatic expiry on the Free plan.

## Features
- **5-Agent Swarm**: Architect plans, Engineer codes, Designer styles, Creative innovates, Tester verifies
- **Live Preview**: Instant iframe preview with hot reload
- **Refactor Panel**: AI-powered code refactoring with diff view
- **Terminal**: Built-in browser terminal with npm/git commands
- **Export**: Download full project as ZIP or text bundle
- **Deploy**: One-click Vercel deployment with live URL
- **GitHub Sync**: Push/pull from any GitHub repository

## API Reference
The SwarmForge REST API (available on Pro+) exposes endpoints at \`https://api.swarmforge.ai/v1\`.
- \`POST /completions\` — send a prompt to the swarm
- \`GET /projects\` — list your projects
- \`POST /deploy\` — trigger a deployment
Authentication uses Bearer token from your API key settings.`;
