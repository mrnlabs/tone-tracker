# Activation Monitor

## Professional Activation Monitoring and Management System

Activation Monitor is a comprehensive Vue 3 application designed for managing and monitoring business activations, promotions, and field marketing campaigns.

## Features

- **Activation Management**: Create, track, and manage marketing activations
- **Team Coordination**: Assign promoters and manage field teams
- **Real-time Monitoring**: Track activation progress and performance
- **Inventory Management**: Monitor stock levels and product distribution
- **Reporting & Analytics**: Generate comprehensive reports and insights
- **Role-based Access Control**: Secure multi-user system with defined permissions
- **Mobile Responsive**: Works seamlessly on all devices

## Tech Stack

- **Frontend**: Vue 3 + Vite
- **UI Components**: PrimeVue 4.0
- **State Management**: Pinia
- **Routing**: Vue Router
- **Styling**: SCSS + CSS Variables
- **HTTP Client**: Axios
- **Charts**: Chart.js with vue-chartjs
- **Maps**: Google Maps integration

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn
- Backend API running on localhost:8080

### Installation

1. Clone the repository:
```bash
git clone https://github.com/mrnlabs/activation-monitor.git
cd activation-monitor
```

2. Install dependencies:
```bash
npm install
```

3. Copy environment variables:
```bash
cp .env.example .env
```

4. Configure your `.env` file with appropriate values

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Lint and fix code
- `npm run format` - Format code with Prettier
- `npm run test` - Run tests

## User Roles

- **Admin**: Full system access
- **Activation Manager**: Manage activations and teams
- **Warehouse Manager**: Handle inventory and stock
- **Promoter**: Field staff access
- **Client**: View-only access to their activations

## Security Features

- XSS protection with DOMPurify
- Content Security Policy headers
- Secure token storage
- Production-safe logging
- Environment variable protection

## Contributing

Please read our contributing guidelines before submitting PRs.

## License

Private and confidential - All rights reserved

## Support

For support, email support@activationmonitor.com