WSL Setup Guide
Steps to run Eliza on Windows computer using WSL. AI Dev School Tutorial

Install WSL
Open PowerShell as Administrator and run:
wsl --install

Restart your computer
Launch Ubuntu from the Start menu and create your Linux username/password
Install Dependencies
Update Ubuntu packages:
sudo apt update && sudo apt upgrade -y

Install system dependencies:
sudo apt install -y \
    build-essential \
    python3 \
    python3-pip \
    git \
    curl \
    ffmpeg \
    libtool-bin \
    autoconf \
    automake \
    libopus-dev

Install Node.js via nvm:
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 23
nvm use 23


Install pnpm:
curl -fsSL https://get.pnpm.io/install.sh | sh -
source ~/.bashrc

Optional: CUDA Support
If you have an NVIDIA GPU and want CUDA support:

Install CUDA Toolkit on Windows from NVIDIA's website
WSL will automatically detect and use the Windows CUDA installation
Clone and Setup Eliza
Follow the Quickstart Guide starting from the "Installation" section.

Troubleshooting
If you encounter node-gyp errors, ensure build tools are installed:
sudo apt install -y nodejs-dev node-gyp

For audio-related issues, verify ffmpeg installation:
ffmpeg -version

For permission issues, ensure your user owns the project directory:
sudo chown -R $USER:$USER ~/path/to/eliza