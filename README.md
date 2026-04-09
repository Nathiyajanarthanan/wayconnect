# WayConnectX Platform

A LinkedIn-style platform that WayConnectXs companies with freelance talent for project-based work.

## Features

### User Types
- **Students** - Create profiles, WayConnectX with others, apply to projects, submit solutions
- **Employees** - Create profiles, network, work on freelance projects
- **Companies** - Post projects, review solutions, pay contributors

### Core Functionality
- Social networking (WayConnectX, chat, feed)
- Project posting and collaboration
- Payment system for projects
- Real-time messaging
- Rating and review system

## Tech Stack
- **Frontend**: React, Tailwind CSS
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Authentication**: JWT
- **Payments**: Stripe
- **Real-time**: Socket.io

## Getting Started

1. Install dependencies:
```bash
npm run install-all
```

2. Set up environment variables (see .env.example files)

3. Start development servers:
```bash
npm run dev
```

## Project Structure
```
├── client/          # React frontend
├── server/          # Node.js backend
├── shared/          # Shared utilities
└── docs/           # Documentation
```