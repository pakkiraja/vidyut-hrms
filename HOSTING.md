# Hosting Vidyut Attendance Application on CentOS 9

This guide outlines the steps to deploy the Vidyut Attendance Application (Node.js backend and React frontend) on a CentOS 9 server.

## Prerequisites

*   A CentOS 9 server with root or sudo privileges.
*   Basic understanding of Linux command line.

## 1. Server Setup

### 1.1 Update System Packages

```bash
sudo dnf update -y
```

### 1.2 Install Node.js and npm

It's recommended to use Node Version Manager (NVM) for easier management of Node.js versions.

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc # or ~/.zshrc depending on your shell
nvm install --lts # Install the latest LTS version
nvm use --lts
npm install -g npm@latest # Update npm to the latest version
```

### 1.3 Install PostgreSQL

```bash
sudo dnf install postgresql-server postgresql-contrib -y
sudo /usr/bin/postgresql-setup --initdb
sudo systemctl enable postgresql
sudo systemctl start postgresql
```

### 1.4 Install Nginx

```bash
sudo dnf install nginx -y
sudo systemctl enable nginx
sudo systemctl start nginx
```

### 1.5 Install PM2 (Process Manager for Node.js)

PM2 will keep your Node.js application running in the background and restart it on crashes.

```bash
sudo npm install -g pm2
```

### 1.6 Configure Firewall (Firewalld)

Allow necessary ports (HTTP, HTTPS, PostgreSQL).

```bash
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --permanent --add-port=5432/tcp # PostgreSQL default port
sudo firewall-cmd --reload
```

## 2. Database Setup (PostgreSQL)

### 2.1 Switch to PostgreSQL User and Access psql

```bash
sudo -i -u postgres
psql
```

### 2.2 Create Database and User

Replace `your_database_name`, `your_username`, and `your_password` with strong, unique credentials.

```sql
CREATE DATABASE your_database_name;
CREATE USER your_username WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE your_database_name TO your_username;
\q
exit
```

### 2.3 Configure PostgreSQL for Remote Access (Optional, if DB is on a different server or needs external access)

Edit `pg_hba.conf` and `postgresql.conf`.

```bash
sudo vi /var/lib/pgsql/data/pg_hba.conf
```

Add the following line at the end to allow connections from your application server (replace `your_app_server_ip` with the actual IP or `0.0.0.0/0` for all IPs, which is less secure):

```
host    your_database_name    your_username    your_app_server_ip/32    md5
```

```bash
sudo vi /var/lib/pgsql/data/postgresql.conf
```

Uncomment and set `listen_addresses` to `'*'` to listen on all network interfaces:

```
listen_addresses = '*'
```

Restart PostgreSQL for changes to take effect:

```bash
sudo systemctl restart postgresql
```

## 3. Backend Deployment

### 3.1 Clone the Repository

Navigate to a suitable directory (e.g., `/var/www/`) and clone your application repository.

```bash
sudo mkdir -p /var/www/vidyut-app
sudo chown -R $USER:$USER /var/www/vidyut-app
cd /var/www/vidyut-app
# Assuming your backend is in a 'backend' subdirectory within the cloned repo
# If your repo contains both frontend and backend, clone the whole repo:
git clone <your_repository_url> .
cd backend
```

### 3.2 Install Backend Dependencies

```bash
npm install
```

### 3.3 Configure Environment Variables

Create a `.env` file in the `backend` directory with your database credentials and other configurations.

```bash
vi .env
```

Example `.env` content:

```
PORT=5000
NODE_ENV=production
DB_NAME=your_database_name
DB_USER=your_username
DB_PASSWORD=your_password
DB_HOST=localhost # Or the IP of your PostgreSQL server
JWT_SECRET=your_jwt_secret_key # Generate a strong, random key
FIREBASE_SERVICE_ACCOUNT_PATH=/path/to/your/firebase-service-account.json # If using Firebase
```

### 3.4 Run Database Migrations/Sync

Ensure your `backend/index.js` or a similar file handles database synchronization or migrations. If you have a specific migration script, run it.

```bash
# Example if your index.js handles sync on startup
node index.js
# Or if you have a specific migration command, e.g., using Sequelize CLI
# npx sequelize db:migrate
```

### 3.5 Start Backend with PM2

```bash
pm2 start index.js --name vidyut-backend
pm2 save # Save the process list to be restored on reboot
pm2 startup # Generate and configure startup script for PM2
```

## 4. Frontend Deployment

### 4.1 Build the Frontend Application

Navigate to the `frontend` directory and build the React application.

```bash
cd /var/www/vidyut-app/frontend # Adjust path if necessary
npm install
npm run build
```

This will create a `build` directory containing the static files for your React application.

### 4.2 Configure Nginx to Serve Frontend and Proxy Backend

Create an Nginx configuration file for your application.

```bash
sudo vi /etc/nginx/conf.d/vidyut-app.conf
```

Add the following content (replace `your_domain.com` with your actual domain or server IP):

```nginx
server {
    listen 80;
    server_name your_domain.com; # Replace with your domain or server IP

    location / {
        root /var/www/vidyut-app/frontend/build; # Path to your frontend build directory
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }

    location /api/ { # Adjust this path to match your backend API routes
        proxy_pass http://localhost:5000; # Port where your Node.js backend is running
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Optional: Add SSL/TLS configuration here if you have an SSL certificate
    # listen 443 ssl;
    # ssl_certificate /etc/nginx/ssl/your_domain.crt;
    # ssl_certificate_key /etc/nginx/ssl/your_domain.key;
}
```

### 4.3 Test Nginx Configuration and Restart

```bash
sudo nginx -t
sudo systemctl restart nginx
```

## 5. Accessing the Application

Once all steps are completed, you should be able to access your application by navigating to `http://your_domain.com` or `http://your_server_ip` in your web browser.

## Troubleshooting

*   **Check Logs:**
    *   Backend: `pm2 logs vidyut-backend`
    *   Nginx: `sudo journalctl -u nginx` or check `/var/log/nginx/error.log`
    *   PostgreSQL: `sudo journalctl -u postgresql`
*   **Firewall:** Ensure ports are open.
*   **Environment Variables:** Double-check your `.env` file for correct values.
*   **Paths:** Verify all file paths in Nginx configuration and PM2 commands.