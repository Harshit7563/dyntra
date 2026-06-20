# Dyntra — Pure Silk Sarees E-Commerce

A luxury silk saree e-commerce website inspired by premium Indian silk retailers. Built with **React**, **Node.js**, and **PostgreSQL**.

## Features

- Hero carousel with luxury silk collections
- Product catalog with category, price, and search filters
- Product detail pages with cart & wishlist
- Shopping cart with free shipping threshold
- Customer testimonials
- Newsletter subscription
- Shop by occasion & price range
- Responsive design with maroon/gold luxury theme

## Tech Stack

| Layer    | Technology              |
|----------|-------------------------|
| Frontend | React 19, Vite, Tailwind CSS 4, React Router |
| Backend  | Node.js, Express        |
| Database | PostgreSQL 16           |

## Quick Start

### 1. Start PostgreSQL

```bash
docker compose up -d
```

### 2. Backend

```bash
cd backend
npm install
npm run seed    # Seed database with sample products
npm run dev     # Starts API on http://localhost:5001
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev     # Starts app on http://localhost:3000
```

Open **http://localhost:3000** in your browser.

## Environment

Backend `.env` (already configured for Docker):

```
PORT=5001
DATABASE_URL=postgresql://dyntra:dyntra123@localhost:5432/dyntra
```

## API Endpoints

| Method | Endpoint              | Description          |
|--------|-----------------------|----------------------|
| GET    | `/api/health`         | Health check         |
| GET    | `/api/products`       | List products        |
| GET    | `/api/products/:slug` | Product detail       |
| GET    | `/api/categories`     | List categories      |
| GET    | `/api/testimonials`   | Customer reviews     |
| GET    | `/api/hero`           | Hero carousel slides |
| POST   | `/api/newsletter`     | Subscribe email      |
| POST   | `/api/orders`         | Place checkout order |
| GET    | `/api/orders/:id`     | Get order details    |

## Project Structure

```
Dyntra/
├── backend/          # Express API + PostgreSQL
├── frontend/         # React SPA
├── docker-compose.yml
└── README.md
```
