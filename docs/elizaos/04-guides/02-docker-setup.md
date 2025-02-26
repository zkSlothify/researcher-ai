Eliza Docker Setup Guide
This guide provides instructions for installing and running the Eliza chatbot using either Docker or direct installation on a server.

Prerequisites
A Linux-based server (Ubuntu/Debian recommended)
Git installed
Docker (optional, for containerized deployment)
Install NVM:

curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
source ~/.bashrc
nvm install v23.3.0


Install Build Essentials (Optional):

apt install -y build-essential

Install PNPM:

curl -fsSL https://get.pnpm.io/install.sh | sh -
source /root/.bashrc

Docker Installation
Install Docker:

# Add Docker's official GPG key
sudo apt-get update
sudo apt-get install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# Add Docker repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker packages
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin


Clone the Repository:

git clone https://github.com/YOUR_USERNAME/eliza.git
cd eliza

Configure Environment:

cp .env.example .env

Fix Unix Script Issues (if needed):

apt install dos2unix
dos2unix ./scripts/*

Run with Docker:

pnpm docker

Docker Management Commands
Check running containers:

docker ps

Remove Eliza container:

docker rm /eliza

Restart with a different character:

pnpm start --character="characters/YOUR_CHARACTER.character.json"

Customization
Modify the .env file to customize your bot's settings
Character files are located in the characters/ directory
Create new character files by copying and modifying existing ones
Troubleshooting
If Docker container fails to start, check logs:

docker logs eliza

For permission issues, ensure proper file ownership and permissions

For script formatting issues, run dos2unix on problematic files

Remove All Docker Images

Run the following command to delete all images:
docker rmi -f $(docker images -aq)

Remove All Build Cache
To clear the build cache entirely, use:
docker builder prune -a -f

Verify Cleanup
Check Docker disk usage again to ensure everything is removed:
docker system df

License
This project is licensed under the MIT License - see the LICENSE file for details.