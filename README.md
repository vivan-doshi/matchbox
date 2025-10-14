# Matchbox 🔥

App for MOR 531 - Students can meet other like-minded people who want to work on projects

## Tech Stack

### Frontend (Web)
- Next.js 14+ with TypeScript
- Tailwind CSS
- Shadcn/ui components
- React Hook Form + Zod validation

### Backend
- Node.js + Express + TypeScript
- MongoDB + Mongoose
- JWT Authentication
- bcrypt for password hashing

### Future Mobile
- React Native with Expo (iOS)

## Project Structure

```
matchbox/
├── client/          # Next.js frontend
├── server/          # Express backend
└── mobile/          # React Native (coming soon)
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <your-repo-url>
cd matchbox
```

2. Install dependencies for all workspaces
```bash
npm run install:all
```

3. Set up environment variables
- Copy `.env.example` to `.env` in both client and server directories
- Fill in your configuration values

4. Run the development servers
```bash
npm run dev
```

This will start:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## Development

- `npm run dev` - Run both client and server
- `npm run dev:client` - Run only frontend
- `npm run dev:server` - Run only backend

## Features (Planned)

- [ ] User authentication (signup/login)
- [ ] Student profile creation
- [ ] Project interests and skills tagging
- [ ] Matching algorithm
- [ ] Chat/messaging system
- [ ] Project collaboration tools

## Contributing

This is a course project for MOR 531.

## License

MIT
