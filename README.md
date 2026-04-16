# 📝 Prompt Logger

> A full-stack AI conversation history manager built with React + Vite + Express.
> Save, organize, search, and track all your AI prompts & responses in one place.
---

## ✨ Features
- 📊 **Dashboard**: Overview stats (total sessions, messages, averages) + recent activity feed
- 🔍 **Session Management**: Searchable list with tag filtering, full CRUD operations
- 💬 **Chat-Style View**: Clean conversation display with user/assistant message separation
- 🏷️ **Tag-Based Organization**: Organize sessions with custom tags for easy retrieval
- ➕ **Inline Editing**: Add/delete individual messages directly in the session view

## 🧱 Blockchain Ledger Mode (New)
Prompt Log now supports an optional **decentralized, immutable ledger mode** for AI conversations.

### What it does:
- Hashes every message and stores it on a cryptographic ledger
- Prevents tampering, deletion, or modification of historical records
- Provides proof of authenticity for prompts and AI responses
- Optional: Sync hash to public/private blockchain for full decentralization

### Use cases:
- Legal & compliance records
- Audit trails for AI outputs
- Intellectual property proof
- Tamper-proof chat logs
  
## 🛠️ Tech Stack
| Layer       | Tech Used               |
|-------------|-------------------------|
| Frontend    | React + Vite            |
| Backend     | Express 5 (Node.js)     |
| Database    | SQL (with `sessions`/`messages` schema) |

## 🚀 Quick Start
### 1. Clone & Install
```bash
git clone https://github.com/your-username/prompt-logger.git
cd prompt-logger
```
### 2. Start the API Server
```bash
cd artifacts/api-server
npm install
npm run dev
```
### 3. Start the Frontend
```bash
cd ../prompt-logger
npm install
npm run dev
```


☕ Support the Project
If you find Prompt Logger useful, consider buying me a coffee!
<div align="center">
<a href="https://www.paypal.com/ncp/payment/VNU63WLWPRB3Y" target="_blank">
<img src="Prompt Logger-qrcode.png" alt="PayPal Donation QR Code" width="200">
</a>
<br>
<a href="https://www.paypal.com/ncp/payment/VNU63WLWPRB3Y" target="_blank">
PayPal: VNU63WLWPRB3Y
</a>
</div>





📜 License
MIT © 2026 Sheldon Yang
