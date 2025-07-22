# meAI – Your AI-Powered Personal Assistant

meAI is a modern, AI-powered personal assistant web app. It features real-time chat, Google authentication, and seamless integration with external toolkits (like Google, Notion, Gmail, and more) to help you manage your digital life—all in a beautiful, responsive interface.

**Backend Repository:** [meAI Frontend](https://github.com/2k4sm/meai-be)


---

## Features
- Real-time AI chat with streaming responses
- Google OAuth authentication
- Conversation management (create, select, delete, rename)
- Toolkit integration: Connect external tools (Google, Notion, Gmail, etc.) via OAuth
- Modern, responsive UI built with TailwindCSS

---

## Technologies Used
- React + TypeScript + Vite – Fast, modern frontend stack
- TailwindCSS – Utility-first CSS framework for all styling
- Zustand – Lightweight state management
- Socket.IO – Real-time communication for chat streaming
- Google OAuth – Secure authentication
- Toolkit Integrations – OAuth-based connections to external services

---

## Quick Start

### Prerequisites
- Node.js (v16+ recommended)
- npm

### Installation
```bash
npm install
```

### Environment Setup
Create a `.env` file or set Vite environment variables as needed:
```
VITE_API_BASE_URL=http://localhost:8000
```

### Running Locally
```bash
npm run dev
```

### Building for Production
```bash
npm run build
```

---

## Component Structure

- App: Handles authentication and routes to either Login or MainLayout.
- Login: Google OAuth login button and branding.
- MainLayout: Main app shell with Sidebar and ChatWindow.
  - Sidebar: Conversation list, create/delete/select conversation, user info, logout.
  - ChatWindow: Displays messages for the selected conversation, handles streaming, and message sending.
    - MessageItem: Renders individual chat messages.
    - InputForm: Message input box, toolkit selection/authorization.
      - ToolkitList: Shows available toolkits and their connection status.

---

## Real-Time Messaging with Socket.IO
- Socket.IO client is initialized in `src/api/socket.ts`.
- Used for real-time streaming of messages in conversations.
- Handles joining/leaving conversation rooms, sending messages, and receiving updates.

---

## Authentication
- Google OAuth login via a button in the Login component.
- Redirects to backend `/auth/google` for authentication.
- User info is fetched from `/auth/me` and stored in Zustand state.

---

## Toolkit Integrations
- Toolkits (Google, Notion, Gmail, etc.) are fetched from the backend and displayed in the UI.
- Users can connect toolkits via OAuth popups.
- Toolkit connection status is shown, and toolkits can be authorized for use in chat.
- Toolkit logic is managed in `src/components/ToolkitList.tsx` and `src/stores/useToolsStore.ts`.


