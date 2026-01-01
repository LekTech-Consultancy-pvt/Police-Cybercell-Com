# Police Cybercell Portal

A comprehensive portal designed to streamline communication and request management between Police Departments, Cyber Cells, and Internet Service Providers (ISPs).

## Overview

The Police Cybercell Portal facilitates the secure and efficient tracking of cybercrime-related requests. It provides a role-based system where:
- **Police Officers** can initiate requests for subscriber details or call records.
- **Cyber Cell** acts as an intermediary to review, approve, and forward requests to ISPs.
- **ISPs** receive requests and provide the necessary data securely.

## Features

- **Role-Based Access Control**: Secure login for Police, Cyber Cell, and ISP users.
- **Request Management**:
  - Create, view, and track status of requests.
  - Workflow: Police -> Cyber Cell -> ISP -> Cyber Cell -> Police.
- **Dashboards**: Dedicated dashboards for each role with relevant metrics and actions.
- **Real-time Updates**: (Planned/Implied) Status updates as requests move through the workflow.

## Tech Stack

- **Frontend**: React (v19), TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS (v4)
- **Icons**: Lucide React
- **Backend/Database**: Supabase (Auth & Database)
- **UI Components**: Radix UI primitives

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm (comes with Node.js)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd police-cybercell-com
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Setup:**
    Create a `.env` file in the root directory and add your Supabase credentials:
    ```env
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_KEY=your_supabase_anon_key
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173`.

## Usage

### Login
Use the login screen to access the portal. You will need credentials corresponding to one of the three roles:
- **Police**: To initiate requests.
- **Cyber**: To manage and forward requests.
- **ISP**: To fulfill requests.

### Police Dashboard
- **New Request**: Submit a new query for a phone number.
- **My Requests**: View the status of submitted requests.

### Cyber Dashboard
- **Pending Requests**: Review requests from Police stations.
- **Forward to ISP**: Approve requests and send them to the relevant ISP.

### ISP Dashboard
- **Incoming Requests**: View requests forwarded by the Cyber Cell.
- **Update Status**: Provide the requested information and mark requests as completed.

## Project Structure

```
src/
├── components/        # React components for Dashboards and Forms
│   ├── LoginForm.tsx
│   ├── PoliceDashboard.tsx
│   ├── CyberDashboard.tsx
│   └── ISPDashboard.tsx
├── App.tsx            # Main application component & Routing logic
├── main.tsx           # Entry point
└── supabaseClient.ts  # Supabase client configuration
```

## License

[License Name]
