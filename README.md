Prompt Logger (artifacts/prompt-logger)
A React + Vite web app for saving and browsing AI conversation history (prompts and responses).

Features:

Dashboard with stats (total sessions, messages, averages) and recent activity
Session list with search and tag filtering
Session detail with chat-style conversation view (user vs assistant messages)
Add new message pairs inline
Create/edit/delete sessions
Delete individual messages
Tag-based organization
Pages: / (Dashboard), /sessions (list), /sessions/:id (detail), /sessions/new (create)

API Server (artifacts/api-server)
Express 5 backend serving the REST API.

Routes:

GET/POST /api/sessions — list/create sessions
GET/PATCH/DELETE /api/sessions/:id — session CRUD
GET/POST /api/sessions/:id/messages — list/add messages
DELETE /api/messages/:id — delete a message
GET /api/stats/summary — overall stats
GET /api/stats/recent — recent sessions
Database Schema
sessions
id (serial PK), title, description (nullable), tags (nullable), message_count, created_at, updated_at
messages
id (serial PK), session_id (FK), role (user|assistant), content, created_at
