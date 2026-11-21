# BidSphere — Online Auction & Bidding Platform

BidSphere is a full-stack, enterprise-grade Online Auction & Bidding web application designed as a realistic startup-quality platform. It allows users to register, discover curated auction listings, place bids following strict economic and anti-sniping rules, create their own auction lots, and monitor real-time standings and concluded results.

---

## 🏛️ System Architecture

- **Backend**: Spring Boot 3.3.4 (Java 21 LTS), Spring Data JPA, Spring Security (Stateless JWT), Hibernate 6, OpenAPI 3.0 / Swagger UI.
- **Frontend**: React 18, Vite 6, React Router DOM v6, Axios, Lucide React Icons, Custom Modular Design System (Vanilla CSS with strict design tokens).
- **Database**: MySQL 8.0+ (with automated Hibernate schema generation & H2 in-memory test runner).
- **Authentication**: Stateless Bearer JWT tokens with BCrypt password encryption and Role-Based Access Control (`USER`, `ADMIN`).

---

## 📂 Project Directory Structure

```
BidSphere/
├── backend/
│   ├── mvnw / mvnw.cmd              # Embedded Maven 3.9.6 wrapper
│   ├── pom.xml                      # Maven project configuration & dependencies
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/bidsphere/
│   │   │   │   ├── BidSphereApplication.java
│   │   │   │   ├── config/          # Security, OpenAPI, DataSeeder
│   │   │   │   ├── controller/      # REST API Controllers (Auth, Auction, User, Admin, Category)
│   │   │   │   ├── dto/             # Request & Response DTOs
│   │   │   │   ├── entity/          # JPA Entities (User, Category, Product, Auction, Bid, AuctionResult)
│   │   │   │   ├── enums/           # UserRole, AuctionStatus
│   │   │   │   ├── exception/       # GlobalExceptionHandler & custom exceptions
│   │   │   │   ├── repository/      # Spring Data JPA Repositories
│   │   │   │   ├── security/        # JWT Token Provider, Auth Filters, UserDetailsService
│   │   │   │   └── service/         # Business Logic & Scheduled Lifecycle Daemon
│   │   │   └── resources/
│   │   │       ├── application.properties
│   │   │       └── application-example.properties
│   │   └── test/                    # Comprehensive JUnit 5 & Mockito test suite
│   │       └── java/com/bidsphere/service/
│   │           ├── AuthServiceTest.java
│   │           └── BidServiceTest.java
├── frontend/
│   ├── index.html                   # HTML5 shell with Google Fonts & SEO tags
│   ├── package.json                 # React, Vite, Axios, Lucide dependencies
│   ├── vite.config.js
│   ├── src/
│   │   ├── api/                     # Axios instance & typed API service client
│   │   ├── components/              # Shared UI components (Navbar, Footer, AuctionCard, RouteGuards)
│   │   ├── context/                 # AuthContext (JWT session), ToastContext
│   │   ├── pages/
│   │   │   ├── Landing/             # Editorial Homepage with Hero, Featured Lots & Categories
│   │   │   ├── Auth/                # Login & Registration Pages
│   │   │   ├── Auctions/            # AuctionListing, AuctionDetail, CreateAuction
│   │   │   ├── Dashboard/           # Buyer/Seller User Dashboard (My Bids, My Listings, Profile)
│   │   │   ├── Admin/               # Administration & Moderation Panel
│   │   │   └── NotFound/            # 404 Error Handler
│   │   ├── utils/                   # Helpers for currency, dates, relative time, error handling
│   │   ├── index.css                # Global Design System tokens & utilities
│   │   └── App.jsx                  # Main router & page assembler
└── database/
    ├── schema.sql                   # MySQL 8.0 DDL database schema
    └── seed.sql                     # Initial sample data & test accounts
```

---

## 🚀 Quick Start Guide

### 1. Database Setup (MySQL)

1. Ensure MySQL 8.0+ is running locally on port `3306`.
2. Open MySQL CLI or MySQL Workbench and run:
   ```sql
   source /path/to/BidSphere/database/schema.sql;
   source /path/to/BidSphere/database/seed.sql;
   ```
   *(Alternatively, the Spring Boot backend will automatically create all tables and seed sample data on first boot via `spring.jpa.hibernate.ddl-auto=update` and `DataSeeder.java`).*

3. Default environment variables in `backend/src/main/resources/application.properties`:
   - `DB_URL`: `jdbc:mysql://localhost:3306/bidsphere`
   - `DB_USERNAME`: `root`
   - `DB_PASSWORD`: *(empty or your MySQL root password)*

---

### 2. Backend Setup & Run

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Build and run unit tests:
   ```bash
   mvnw.cmd test          # Windows
   ./mvnw test            # macOS / Linux
   ```
3. Start the Spring Boot application:
   ```bash
   mvnw.cmd spring-boot:run     # Windows
   ./mvnw spring-boot:run       # macOS / Linux
   ```
4. The backend starts at: **`http://localhost:8080`**
5. **Interactive Swagger/OpenAPI API Docs**:
   - `http://localhost:8080/swagger-ui.html`

---

### 3. Frontend Setup & Run

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Access the web app in your browser at: **`http://localhost:5173`**

---

## 🔑 Pre-Configured Test Accounts

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@bidsphere.com` | `Admin@1234` | Full moderation, user toggle, system metrics |
| **Seller** | `seller@bidsphere.com` | `Seller@1234` | Auction listing, cancel without bids, buyer bidding |
| **Buyer** | `buyer@bidsphere.com` | `Buyer@1234` | Browse, place bids, dashboard bid tracking |

*(You can also register a brand-new user at `/register`).*

---

## 🛡️ Key Business Logic & Validation Rules

1. **Self-Bidding Guard**: Sellers cannot place bids on their own auction listings (`400 Bad Request`).
2. **Bid Increment Validation**: A new bid must strictly equal or exceed `max(startingPrice, currentHighestBid + minimumBidIncrement)`.
3. **Auction Lifecycle**:
   - `UPCOMING / SCHEDULED`: Visible but not accepting bids until start time.
   - `ACTIVE`: Accepting validated bids.
   - `ENDED`: No new bids accepted; winner determined and recorded in `auction_results`.
   - `CANCELLED`: Sellers can cancel active auctions only if 0 bids have been placed. Admins can cancel any auction for moderation.
4. **Lifecycle Scheduler**: Background service ticks every 60 seconds to automatically transition auctions whose `end_time` has elapsed and resolve winners.
5. **Security & Route Protection**:
   - Sensitive endpoints require valid JWT in `Authorization: Bearer <token>`.
   - Admin routes (`/admin`) are restricted to users with `ROLE_ADMIN`.
   - Guests are redirected to login with return state preserved.
