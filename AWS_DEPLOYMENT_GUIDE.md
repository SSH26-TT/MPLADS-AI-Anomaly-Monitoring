# AWS Deployment Guide for MPLADS AI Monitor

This guide walks you through deploying the **MPLADS AI Monitor** onto AWS Cloud.

---

## 🚀 Option 1: AWS EC2 with Docker Compose (Recommended & Easiest)

This approach deploys both Frontend and Backend on a single AWS EC2 virtual machine (Free-tier eligible, ~$0-$5/month).

### Step 1: Launch an AWS EC2 Instance
1. Log in to your [AWS Management Console](https://console.aws.amazon.com/ec2/).
2. Click **Launch Instances**:
   * **Name**: `mplads-ai-monitor`
   * **AMI**: `Ubuntu Server 22.04 LTS` (or 24.04 LTS, 64-bit x86)
   * **Instance Type**: `t3.small` (Recommended) or `t2.micro` (Free Tier)
   * **Key pair**: Select or create a `.pem` key pair to SSH.
   * **Network settings / Security Group**:
     * Allow **SSH** (Port 22) from your IP.
     * Allow **HTTP** (Port 80) from anywhere (`0.0.0.0/0`).
     * Allow **HTTPS** (Port 443) from anywhere (`0.0.0.0/0`).
     * *(Optional)* Allow Custom TCP (Port 8000) if you want direct API access.
   * **Storage**: 20 GB gp3 SSD.
3. Click **Launch Instance**.

---

### Step 2: Connect & Install Docker on EC2
1. Open your terminal and SSH into your EC2 instance:
   ```bash
   ssh -i /path/to/your-key.pem ubuntu@<YOUR-EC2-PUBLIC-IP>
   ```

2. Update packages and install Docker & Docker Compose:
   ```bash
   sudo apt update && sudo apt upgrade -y
   sudo apt install -y docker.io docker-compose-v2 git
   sudo usermod -aG docker ubuntu
   newgrp docker
   ```

---

### Step 3: Clone Repository & Launch Containers
1. Clone the repository:
   ```bash
   git clone https://github.com/Sankhyaan/MPLADS-AI-Anomaly-Monitoring.git
   cd MPLADS-AI-Anomaly-Monitoring
   ```

2. Build and start the containers with Docker Compose:
   ```bash
   docker compose up -d --build
   ```

3. Verify running services:
   ```bash
   docker compose ps
   ```

4. **Access the Application**:
   * Open your browser and navigate to: `http://<YOUR-EC2-PUBLIC-IP>`
   * Access API docs at: `http://<YOUR-EC2-PUBLIC-IP>/docs`

---

### Step 4: (Optional) Set Up Domain & Free SSL Certificate (HTTPS)
If you have a domain name pointed to your EC2 Public IP:

1. Install Certbot on EC2:
   ```bash
   sudo apt install -y certbot python3-certbot-nginx
   ```
2. Run Certbot to generate and auto-configure SSL:
   ```bash
   sudo certbot --nginx -d yourdomain.gov.in
   ```

---

## ☁️ Option 2: AWS App Runner (Backend) + AWS Amplify / S3 (Frontend)

For serverless auto-scaling without managing virtual machines:

### Backend on AWS App Runner:
1. Push the `Backend` container image to **Amazon ECR** (Elastic Container Registry) or connect your GitHub repository directly.
2. Go to **AWS App Runner Console** -> **Create Service**.
3. Source: **Source code repository** -> Select `Sankhyaan/MPLADS-AI-Anomaly-Monitoring`.
4. Runtime: `Python 3`
   * Build command: `pip install -r Backend/requirements.txt`
   * Start command: `uvicorn Backend.app.main:app --host 0.0.0.0 --port 8000`
5. Port: `8000`
6. Click **Deploy**. AWS will provide an HTTPS endpoint (e.g. `https://xyz.awsapprunner.com`).

### Frontend on AWS Amplify:
1. Go to **AWS Amplify Console** -> **Host web app**.
2. Connect your GitHub repository: `MPLADS-AI-Anomaly-Monitoring`.
3. Set base directory to `Frontend`.
4. Add Environment Variable:
   * `VITE_API_URL` = `https://xyz.awsapprunner.com`
5. Build settings:
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm ci
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: dist
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
   ```
6. Click **Save and Deploy**.

---

## 🛠️ Summary Comparison

| Deployment Method | Setup Time | Estimated Monthly Cost | Maintenance |
| :--- | :--- | :--- | :--- |
| **AWS EC2 (Docker Compose)** | **~5 minutes** | **$0 (Free Tier) to ~$7/mo** | Low (Single VM) |
| **AWS App Runner + Amplify** | ~10 minutes | ~$5 - $15/mo | Zero (Serverless) |
| **AWS ECS Fargate + ALB** | ~25 minutes | ~$25 - $40/mo | Enterprise HA |
