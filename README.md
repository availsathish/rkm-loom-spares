# RKM Loom Spares POS

A comprehensive Point of Sale (POS) and Inventory Management System built for RKM Loom Spares.

## Features

- **Dashboard**: Real-time sales stats, low stock alerts, and growth metrics.
- **POS (Point of Sale)**: Fast billing interface with barcode support.
- **Inventory Management**: Track products, stock levels, and categories.
- **Customer Ledger**: Manage customer accounts, balances, and payment history.
- **Billing**: Create, view, edit, and delete bills.
- **Payments**: Record incoming payments (Cash, UPI, Bank) and update customer balances.
- **Sales Return**: Handle product returns and refunds.
- **Reports**: Detailed sales, stock, and ledger reports.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: SQLite (via Prisma ORM)
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI
- **Authentication**: JWT-based auth

## Getting Started

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Setup Database**:
    ```bash
    npx prisma migrate dev
    ```

3.  **Run Development Server**:
    ```bash
    npm run dev
    ```

4.  **Build for Production**:
    ```bash
    npm run build
    npm start
    ```

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions using Docker or Node.js.
