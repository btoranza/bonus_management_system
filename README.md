# Bonus Management System

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![FastAPI](https://img.shields.io/badge/FastAPI-0.116-009688?logo=fastapi)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb)

A full-stack web application for managing sales performance, calculating bonuses, and visualizing business metrics.

This project simulates a real-world sales organization with different sales teams, configurable bonus rules, interactive dashboards, and realistic business data. It was built to showcase modern full-stack development practices using React, FastAPI, and MongoDB.

## Overview

Bonus Management System is a fictional enterprise application designed to support the Finance department in managing sales performance, calculating monthly bonuses, and monitoring company-wide sales metrics.

The current implementation represents the Finance workspace, providing visibility into sales activity, salespeople performance, and bonus calculations.

The platform is designed to evolve into a multi-role system supporting Finance, Sales Managers, and Sales Representatives through dedicated workspaces and permission-based access.

---

## Live Demo

| Resource | URL |
|----------|-----|
| 🌐 Application | https://bonus-management-system.vercel.app/ |
| 📘 API Documentation (Swagger) | https://bonusmanagementsystem-production.up.railway.app/docs |
---

## Preview

### Dashboard

![Dashboard](./screenshots/dashboard_light.png)
![Dashboard](./screenshots/dashboard_dark.png)

---

### Sales

![Sales](./screenshots/sales.png)
![Sales](./screenshots/new_sale.png)
![Sales](./screenshots/new_customer.png)

---

### Salespeople

![Salespeople](./screenshots/salespeople.png)

---

### Bonuses

![Bonuses](./screenshots/bonuses.png)

---

## Features

### 📊 Analytics

- Interactive dashboard
- KPIs
- Monthly trends
- Performance analytics

### 💼 Sales

- Sales management
- Sale creation with inline customer lookup and creation
- Toast notifications for user feedback
- Search
- Filtering
- Server-side pagination
- Sorting

### 👥 Salespeople

- Salespeople management

### 🧑‍🤝‍🧑 Customers

- Customer lookup with search
- Inline customer creation from the sale form

### 💰 Bonuses

- Monthly bonus calculation
- Configurable business rules

### 🎨 User Experience

- Responsive interface
- Dark mode

## Business Rules

The application simulates a sales organization composed of three independent sales teams.

Monthly sales goals are assigned individually to each salesperson. Team performance is calculated by aggregating individual sales against the combined goals of all active team members.

| Team | Monthly Goal (per Salesperson) |
|-------|-------------------------------:|
| Enterprise | $100,000 |
| Mid-Market | $50,000 |
| SMB | $20,000 |

Monthly bonuses are calculated according to:

- Goal achievement
- Sales team
- Number of new customers acquired

Each team has:

- Different monthly goals
- Different target bonuses
- Different incentives for new customers

To keep payouts balanced, new customer bonuses are capped so they cannot outweigh base performance.

---

## Tech Stack

| Frontend | Backend | Tooling |
|----------|----------|----------|
| ⚛️ React | ⚡ FastAPI | 🧹 Ruff |
| 🔷 TypeScript | 🍃 MongoDB Atlas | ✨ ESLint |
| ⚡ Vite | 🚀 Motor | 🎯 Prettier |
| 🎨 Tailwind CSS | ✅ Pydantic | |
| 🧩 shadcn/ui | | |
| 📦 TanStack Query | | |
| 📋 TanStack Table | | |
| 🛣️ React Router | | |
| 📈 Recharts | | |

---

## Architecture

```mermaid
flowchart LR

subgraph Frontend
    P["📄 Pages"]
    H["🪝 Hooks"]
    C["🧩 Components"]
    S["🌐 API Services"]
end

subgraph Backend
    A["⚡ FastAPI Routes"]
    B["🧠 Business Services"]
    D["🍃 MongoDB Atlas"]
end

P --> H
P --> C
H --> S
S --> A
A --> B
B --> D

classDef frontend fill:#F8FFFF,stroke:#2EC4B6,stroke-width:2px,color:#2B2D42;
classDef backend fill:#FAF8FF,stroke:#A78BFA,stroke-width:2px,color:#2B2D42;
classDef database fill:#F8FFF9,stroke:#37C871,stroke-width:2px,color:#2B2D42;

class P,H,C,S frontend;
class A,B backend;
class D database;

style Frontend fill:#FFFFFF,stroke:#2B2D42,stroke-width:2px;
style Backend fill:#FFFFFF,stroke:#2B2D42,stroke-width:2px;
```

---

```mermaid
sequenceDiagram
    actor User
    participant Dialog as CreateSaleDialog
    participant Form as SaleForm
    participant Customer as CustomerCombobox
    participant API as FastAPI
    participant DB as MongoDB

    rect rgb(248, 255, 255)
        User->>Dialog: Open "New Sale"
        Dialog->>Form: Display SaleForm

        User->>Customer: Search for customer
        Customer->>API: GET /customers?search=...
    end

    rect rgb(250, 248, 255)
        API->>DB: Search customers
        DB-->>API: Matching customers
        API-->>Customer: Customer list
    end

    alt Customer exists
        rect rgb(248, 255, 255)
            User->>Customer: Select customer
            Customer-->>Form: Set selected customer
        end

    else Customer does not exist
        rect rgb(248, 255, 255)
            User->>Customer: Click "+ New customer"
            Form->>Dialog: Request new customer view
            Dialog->>Dialog: Show NewCustomerForm

            User->>Dialog: Enter customer name
            Dialog->>Dialog: Validate with Zod
            User->>Dialog: Submit
        end

        rect rgb(250, 248, 255)
            Dialog->>API: POST /customers
            API->>DB: Create customer
            DB-->>API: Customer with generated ID
            API-->>Dialog: Customer
        end

        rect rgb(248, 255, 255)
            Dialog->>Dialog: Reset form & store selected customer
            Dialog->>Form: Return to SaleForm<br/>with selectedCustomer prop
            Form->>Customer: Pass selectedCustomer as value
        end
    end

    rect rgb(248, 255, 255)
        User->>Form: Complete remaining fields
        User->>Form: Submit sale
        Form->>API: POST /sales
    end

    rect rgb(250, 248, 255)
        API->>DB: Create sale
        DB-->>API: Sale created
        API->>DB: Update first_sale_date using $min
        API-->>Form: SaleResponse
    end

    rect rgb(248, 255, 255)
        Form->>Dialog: Show success toast
        Dialog->>Dialog: Close & reset
        Dialog->>API: Invalidate sales, dashboard,<br/>bonuses & customers queries
    end
```

### **New Customer Creation**

The customer creation flow is handled directly within the **New Sale** dialog, allowing users to create a customer without closing or leaving the sale form.

1. The user opens `NewCustomerForm` within the existing dialog.
2. The user enters the customer name.
3. The name is validated using Zod.
4. On submit, `useCreateCustomer()` triggers `POST /customers`.
5. The backend creates the customer and returns the generated customer ID.
6. On success:
   - The form is reset.
   - `onCreated()` is called with the customer's ID and name.
7. `CreateSaleDialog` receives the newly created customer and returns to the `SaleForm` panel.
8. `CustomerCombobox` displays the new customer as the selected value.

```mermaid
flowchart LR

    A["NewCustomerForm"] --> B["Enter customer name"]
    B --> C["Zod validation"]
    C --> D["Submit"]
    D --> E["useCreateCustomer()"]
    E --> F["POST /customers"]
    F --> G["Customer created<br/>ID generated"]
    G --> H["onSuccess"]
    H --> I["Reset form"]
    I --> J["onCreated({ value, label })"]
    J --> K["CreateSaleDialog<br/>returns to SaleForm"]
    K --> L["CustomerCombobox<br/>customer selected"]

    classDef frontend fill:#F8FFFF,stroke:#2EC4B6,stroke-width:2px,color:#2B2D42;
    classDef validation fill:#FAF8FF,stroke:#A78BFA,stroke-width:2px,color:#2B2D42;
    classDef backend fill:#F8FFF9,stroke:#37C871,stroke-width:2px,color:#2B2D42;

    class A,B,D,E,H,I,J,K,L frontend;
    class C validation;
    class F,G backend;
```

---

## Design Principles

The project follows a layered architecture that separates presentation, business logic, and data access.

### Frontend

- Feature-based components
- Reusable UI components
- Server state managed with TanStack Query
- Shared providers for application state
- Type-safe API integration
- Shared utility libraries

### Backend

- Thin API layer
- Business logic isolated in services
- Pydantic schemas for validation
- MongoDB as the persistence layer

## API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard` | Retrieve dashboard metrics |
| GET | `/sales` | List sales |
| POST | `/sales` | Create a sale |
| PATCH | `/sales/{sale_id}` | Update a sale |
| GET | `/salespeople` | List salespeople |
| GET | `/customers` | List customers |
| POST | `/customers` | Create a customer |
| GET | `/bonuses` | Calculate and list monthly bonuses |
| GET | `/docs` | Interactive OpenAPI (Swagger UI) documentation |


---

## Project Structure

```text
bonus-management-system/
│
├── backend/
│   ├── app/
│   │   ├── api/           # FastAPI route handlers
│   │   ├── database/      # MongoDB client
│   │   ├── schemas/       # Pydantic models
│   │   ├── scripts/       # Database seed
│   │   ├── services/      # Business logic
│   │   ├── config.py
│   │   └── main.py
│   │
│   └── requirements.txt
│
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/    # UI and feature components
│       ├── constants/     # Shared constants
│       ├── hooks/         # Custom React hooks
│       ├── lib/           # Utilities and formatters
│       ├── pages/         # Application pages
│       ├── providers/     # React context providers
│       ├── router/        # Application routing
│       ├── services/      # API clients
│       └── types/         # TypeScript models
│
├── screenshots/
└── README.md
```

---

## Running Locally

Clone the repository:

```bash
git clone https://github.com/btoranza/bonus_management_system.git

cd bonus-management-system
```

### Backend

```bash
cd backend

uv sync

uv run fastapi dev app/main.py
```

### Frontend

```bash
cd frontend

npm install

npm run dev
```

---

## Environment Variables

### Backend

```env
MONGODB_URI=<your-mongodb-atlas-uri>
```

### Frontend

```env
VITE_API_URL=http://localhost:8000
```

---

## Demo Data

The project includes a seed script that generates a realistic one-year dataset including:

- Salespeople
- Sales history
- Recurring customers
- New customer acquisition
- Monthly seasonality
- Team-specific performance
- Consistent salesperson profiles

The generated dataset is deterministic and designed to produce meaningful dashboards and bonus calculations.

Run:

```bash
python app/scripts/seed.py
```

---

## Highlights

This project focuses on building a realistic business application rather than a simple CRUD.

Implementation highlights include:

- Server-side pagination, filtering and sorting
- Reusable table infrastructure
- Modular bonus calculation service
- Interactive dashboard with business KPIs
- Responsive user interface
- Clean separation between presentation, business logic and data access
- Realistic demo dataset designed to produce meaningful analytics

---

## Roadmap

| Area | Feature | Short | Mid | Long |
|------|---------|:-----:|:---:|:----:|
| **Sales** | Create, edit and delete sales | ✅ | | |
| | Bulk sales import | ✅ | | |
| | CSV import/export | ✅ | | |
| **Salespeople** | Create and edit salespeople | ✅ | | |
| | Activate / deactivate salespeople | ✅ | | |
| **Bonuses** | Editable bonus rules | ✅ | | |
| | Bonus approval workflow | ✅ | | |
| | Bonus history | | ✅ | |
| **Users** | User authentication | | ✅ | |
| | Role-based access control | | ✅ | |
| **Workspaces** | Finance workspace | | ✅ | |
| | Sales Manager workspace | | ✅ | |
| | Sales Representative workspace | | ✅ | |
| **Analytics** | Team performance management | | ✅ | |
| | Personal dashboards | | ✅ | |
| **Platform** | Automated tests | | | ✅ |
| | Docker support | | | ✅ |
| | CI/CD pipeline | | | ✅ |
| | Monitoring & logging | | | ✅ |
| | Audit logs | | | ✅ |
| | Application Settings | | ✅ | |

---
