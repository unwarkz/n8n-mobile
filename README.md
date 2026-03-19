# n8n Mobile Dashboard

A mobile-friendly, responsive web dashboard for managing your self-hosted [n8n](https://n8n.io/) instances. Built with React, Tailwind CSS, and Vite.

## Features

- **Multi-Instance Management:** Connect and switch between multiple self-hosted n8n instances.
- **Workflows:** View, enable/disable, and edit workflows directly from your mobile device.
- **Executions:** Monitor recent workflow executions, statuses, and running times.
- **Credentials:** View and update your n8n credentials.
- **Mock API Mode:** Includes a built-in test instance (`https://mock.n8n.local`) to safely test the UI without connecting to a real server.
- **Diagnostics:** Built-in network logs and mixed-content detection to help troubleshoot connection issues.

---

## 🚀 Deployment via Portainer (Repository Mode)

This project includes everything needed to be deployed directly from a Git repository using Portainer's "Stack" feature.

### Prerequisites

1. A running instance of Portainer.
2. This repository hosted on GitHub, GitLab, or another accessible Git server.

### Steps to Deploy

1. Open your **Portainer** dashboard.
2. Navigate to your environment and click on **Stacks** in the left sidebar.
3. Click **+ Add stack**.
4. Give your stack a name (e.g., `n8n-mobile`).
5. Under **Build method**, select **Repository**.
6. Enter the **Repository URL** for this project.
7. (Optional) Specify the branch if it's not `main` or `master`.
8. Ensure the **Compose path** is set to `docker-compose.yml`.
9. Click **Deploy the stack**.

Portainer will automatically clone the repository, build the Docker image using the provided `Dockerfile`, and start the container. The app will be accessible on port `8010` (e.g., `http://your-server-ip:8010`). You can change this port in the `docker-compose.yml` file if needed.

---

## 🔒 Security Notes

- **API Key Storage:** Your n8n API keys are stored locally in your browser's `localStorage`. They are never sent to any third-party servers, only directly to your configured n8n instances. Ensure you are using a secure, trusted device.
- **Security Headers:** The included Nginx configuration implements strict security headers (X-Frame-Options, X-Content-Type-Options, CSP, etc.) to protect against common web vulnerabilities like XSS and clickjacking.
- **HTTPS Recommended:** It is highly recommended to serve this dashboard over HTTPS (e.g., using a reverse proxy like Nginx Proxy Manager, Traefik, or Cloudflare Tunnels) to encrypt traffic between your browser and the dashboard, especially when transmitting API keys.

---

## ⚠️ Important: n8n CORS Configuration

Because this dashboard runs as a separate web application, your n8n instance **must** be configured to accept Cross-Origin Resource Sharing (CORS) requests from the domain where you host this dashboard.

If you do not configure CORS, you will see a "Network Error" or "Fetch failed" message in the app.

### How to configure CORS in n8n

Add the following environment variable to your **n8n** deployment (e.g., in your n8n `docker-compose.yml`):

```env
N8N_CORS_ALLOWED_ORIGINS=https://your-n8n-mobile-domain.com
```

*(You can provide a comma-separated list if you have multiple domains, e.g., `https://domain1.com,https://domain2.com`)*

### Mixed Content Warning (HTTP vs HTTPS)

If you host this dashboard on **HTTPS**, your n8n instance **MUST ALSO** be hosted on **HTTPS**. Modern browsers block requests from HTTPS sites to HTTP sites (Mixed Content). If you encounter this, the app's built-in Logs screen will display a diagnostic warning.

---

## 🛠 Local Development

To run this project locally for development:

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open `http://localhost:3000` in your browser.

## Tech Stack

- **Framework:** React 18
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **State Management:** Zustand (with persistence)
- **Routing:** React Router DOM
- **Flow Editor:** React Flow (`@xyflow/react`)
