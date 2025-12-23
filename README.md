<p align="center">
  <a href="https://learnhouse.app">
    <img src=".github/images/readme.png" height="300">
  </a>
</p>

LearnHouse is an open source platform that makes it easy for anyone to provide world-class educational content and it offers a variety of content types : Dynamic Pages, Videos, Documents & more..

## Progress

🚧 LearnHouse is still on development (beta), as we reach stability we will release a stable version and add more features.

## Roadmap

We prioritize issues depending on the most requested features from our users, please help us prioritize issues by commenting on them and sharing your thoughts 

[🚢 LearnHouse General Roadmap](https://www.learnhouse.app/roadmap)

## Overview

![image](https://docs.learnhouse.app/img/pages/features.png)

- 📄✨Dynamic notion-like Blocks-based Courses & editor
- 🏎️ Easy to use
- 👥 Multi-Organization
- 📹 Supports Uploadable Videos and external videos like YouTube
- 📄 Supports documents like PDF
- 👨‍🎓 Users & Groups Management
- 🙋 Quizzes
- 🍱 Course Collections
- 👟 Course Progress
- 🛜 Course Updates
- 💬 Discussions
- ✨ LearnHouse AI : The Teachers and Students copilot
- 👪 Multiplayer Course edition
- More to come

## Community

Please visit our [Discord](https://discord.gg/CMyZjjYZ6x) community 👋

## Contributing

Thank you for you interest 💖, here is how you can help :

- [Getting Started](/CONTRIBUTING.md)
- [Developers Quick start](https://docs.learnhouse.app/setup-dev-environment)
- [Submit a bug report](https://github.com/learnhouse/learnhouse/issues/new?assignees=&labels=bug%2Ctriage&projects=&template=bug.yml&title=%5BBug%5D%3A+)
- [Check good first issues & Help Wanted](https://github.com/learnhouse/learnhouse/issues?q=is%3Aopen+is%3Aissue+label%3A%22good+first+issue%22+label%3A%22help+wanted%22)
- Spread the word and share the project with your friends

## Documentation

- [Overview](https://docs.learnhouse.app)
- [Developers](https://docs.learnhouse.app/setup-dev-environment)

## Get started 

### Get a local ready copy of LearnHouse

TLDR: Run `docker-compose up -d` and inspect the logs, should be ready to go in less than 2 mins

- [Self Hosting](https://docs.learnhouse.app/self-hosting/hosting-guide)

### Set-up a Development Environment 

- [Detailed Guide](https://docs.learnhouse.app/setup-dev-environment)

## Tech

LearnHouse uses a number of open source projects to work properly:

- **Next.js** (14 with the App Directory) - The React Framework
- **TailwindCSS** - Styling
- **Radix UI** - Accessible UI Components
- **Tiptap** - An editor framework and headless wrapper around ProseMirror
- **FastAPI** - A high performance, async API framework for Python
- **YJS** - Shared data types for building collaborative software
- **PostgreSQL** - SQL Database
- **Redis** - In-Memory Database
- **React** - duh

## LearnHouse University

<a href="https://university.learnhouse.io">
<img width="208" alt="lh_univ" src="https://github.com/learnhouse/learnhouse/assets/29493708/72a892cd-7c5a-4437-9130-ff1682a10b24">
</a>

Learn about LearnHouse and how to use it, using LearnHouse


## A word

Learnhouse is made with 💜, from the UI to the features it is carefully designed to make students and teachers lives easier and make education software more enjoyable.

Thank you and have fun using/developing/testing LearnHouse !



### Mac OS locally hosted guide:

You need all the prerequisites from [here](https://docs.learnhouse.app/setup-dev-environment#init-the-frontend), except for Docker.

```bash
# Clone the repository
git clone https://github.com/learnhouse/learnhouse
cd learnhouse

# Check https://github.com/learnhouse/community-edition/blob/main/docker-compose.yml for versions. 
# Below is correct at time of writing: 12/2025

# If not already installed
brew install postgresql@16
brew install redis
brew services start postgresql@16
brew services start redis
echo 'export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# Create the database if not already created
createdb learnhouse
psql

# Run these from the psql prompt:
# This is only for local dev, not production.
CREATE ROLE learnhouse LOGIN;
ALTER USER learnhouse WITH SUPERUSER;

# Navigate to the API directory
cd ./apps/api
uv sync
uv run app.py
# Confirm you see swagger docs at 
# http://localhost:1338/docs

# To bootstrap the database:
# uv run cli.py install
# Complete the prompts for the database installation
```

### Frontend

Open a new terminal tab and navigate to the frontend directory:

```bash
# Navigate to the frontend directory
cd ./apps/web
pnpm i
cp env.example.web .env
# Edit ./apps/web/.env file, change secret key, etc
pnpm run dev

# visit http://localhost:3000/

# To login:
# un: admin@school.dev
# pw: [pw set in LEARNHOUSE_INITIAL_ADMIN_PASSWORD]

```

Local AI:

```bash
brew install llama.cpp
llama-server --hf-repo enacimie/LFM2-350M-Q4_K_M-GGUF --hf-file lfm2-350m-q4_k_m.gguf

# See here for other recommended models: https://huggingface.co/spaces/ngxson/wllama
# Basic web UI can be accessed via browser: http://localhost:8080
# Chat completion endpoint: http://localhost:8080/v1/chat/completions

# Edit apps/api/src/services/ai/base.py and change:
# 18: base_url = "http://localhost:8080/v1"
# 67: openai_model_name = "LFM2-350M-Q4_K_M-GGUF"


```