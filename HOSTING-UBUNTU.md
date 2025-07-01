# Hosting Vidyut HRMS on Ubuntu 24.04 LTS

This document outlines the steps to host the Vidyut HRMS application on an Ubuntu 24.04 LTS server.

## Prerequisites

*   A server running Ubuntu 24.04 LTS.
*   `sudo` privileges on the server.
*   Domain name configured to point to your server's IP address (optional, but recommended for production).
*   Basic understanding of Linux command line.

## 1. Update and Upgrade System

First, update your package lists and upgrade all installed packages to their latest versions:

```bash
sudo apt update
sudo apt upgrade -y
```

## 2. Install Node.js and npm (for Backend)

The backend is a Node.js application. We recommend using `nvm` (Node Version Manager) to install Node.js.

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc # or ~/.zshrc if you use zsh
nvm install --lts
nvm use --lts
node -v
npm -v
```

## 3. Install MongoDB (for Backend Database)

The backend uses MongoDB as its database.

```bash
sudo apt install gnupg curl -y
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
   sudo gpg -o /usr/share/keyrings/mongodb-archive-keyring.gpg \
   --dearmor
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-archive-keyring.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt update
sudo apt install -y mongodb-org
```

Start and enable MongoDB:

```bash
sudo systemctl start mongod
sudo systemctl enable mongod
sudo systemctl status mongod
```

## 4. Install Nginx (for Frontend and Reverse Proxy)

Nginx will serve the frontend and act as a reverse proxy for the backend API.

```bash
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
sudo ufw allow 'Nginx Full'
```

## 5. Clone the Application Repository

Clone your project from GitHub. Replace `your_username` with your actual GitHub username.

```bash
sudo apt install git -y
cd /var/www/
sudo git clone https://github.com/pakkiraja/vidyut-hrms.git
sudo chown -R $USER:$USER /var/www/vidyut-hrms
```

## 6. Configure Backend

```bash
cd /var/www/vidyut-hrms/backend
npm install
```

Create a `.env` file in the `backend` directory with your environment variables (e.g., `MONGO_URI`, `JWT_SECRET`, `PORT`).

```bash
cp .env.example .env # If you have an example file
# Edit .env with your actual values
nano .env
```

## 7. Configure Frontend

```bash
cd /var/www/vidyut-hrms/frontend
npm install
npm run build
```

This will create a `build` directory containing the static files for your frontend.

## 8. Configure Nginx for Frontend and Backend

Create an Nginx server block configuration file:

```bash
sudo nano /etc/nginx/sites-available/vidyut-hrms
```

Add the following content to the file. Replace `your_domain.com` with your actual domain name.

```nginx
server {
    listen 80;
    server_name your_domain.com www.your_domain.com;

    root /var/www/vidyut-hrms/frontend/build;
    index index.html index.htm;

    location / {
        try_files $uri $uri/ =404;
    }

    location /api/ {
        proxy_pass http://localhost:5000; # Assuming backend runs on port 5000
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Create a symbolic link to enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/vidyut-hrms /etc/nginx/sites-enabled/
```

Test Nginx configuration and restart:

```bash
sudo nginx -t
sudo systemctl restart nginx
```

## 9. Install PM2 (Process Manager for Node.js)

PM2 will keep your backend application running continuously and restart it on crashes.

```bash
sudo npm install -g pm2
```

Start your backend application with PM2:

```bash
cd /var/www/vidyut-hrms/backend
pm2 start index.js --name "vidyut-hrms-backend"
pm2 save
pm2 startup
```

Follow the instructions provided by `pm2 startup` to set up PM2 to start on boot.

## 10. Secure with SSL/TLS (Certbot) - Optional but Recommended

For production, it's highly recommended to secure your application with SSL/TLS using Certbot.

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your_domain.com -d www.your_domain.com
```

Follow the prompts to complete the SSL certificate installation.

## Troubleshooting

*   **Check Nginx logs:** `sudo tail -f /var/log/nginx/error.log`
*   **Check PM2 logs:** `pm2 logs vidyut-hrms-backend`
*   **Check MongoDB status:** `sudo systemctl status mongod`
*   **Firewall:** Ensure ports 80 and 443 are open (`sudo ufw status`).