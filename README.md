# SmartCareConnect 🏥
when ordering item do validtion that much ite mexist in stock , add stoke validationa d reduction when order hapens , if item is less thans it orderd show erro the numerb of  item cout he can order not more than becuse it will be 0 liektat 


SmartCareConnect is a high-fidelity hospital logistics and medical order management system designed to streamline the workflow between doctors, managers, and delivery personnel. Built with a modern "Glassmorphism" aesthetic, it provides a premium, real-time experience for hospital staff.

## 🚀 Key Features

### 👨‍⚕️ Medical Workflow
*   **Junior Doctor Portal:** Create medical orders and track their status in real-time. Full history management and pending request tracking.
*   **Senior Doctor Oversight:** A dedicated "Approve Orders" queue to authorize junior doctors' requests. Includes a comprehensive team history view for auditing.
*   **Authorization Chain:** Strict multi-stage approval process ensuring medical prescriptions are verified before being sent to logistics.

### 🚚 Logistics & Delivery
*   **Manager Dashboard:** Unified command center for assigning drivers to paid orders.
*   **Real-time Driver Assignment:** Two-step selection and assignment process to prevent logistical errors.
*   **Driver App:** Dedicated mobile-responsive interface for delivery personnel to start trips, track routes, and confirm deliveries.
*   **Final Closure:** Managers have the definitive "Top Approve" power to officially close and archive orders once delivered.

### 💳 Payments & Security
*   **Razorpay Integration:** Seamless payment flow for medical orders with real-time status updates.
*   **Automated Refunds:** Integrated cancellation logic that automatically marks paid orders as "Refunded" upon cancellation.
*   **Secure Access:** Role-based access control (RBAC) and JWT-based authentication.
*   **Privacy Features:** Password visibility toggles (eye buttons) across all forms for improved user experience and security.

### 📊 Advanced Analytics
*   **Performance Insights:** Interactive multi-metric charts for Managers tracking Orders vs. Revenue.
*   **Dynamic Controls:** Built-in "Brush" and "Zoom" functionality to analyze data from 2025 onwards.
*   **Dual-Axis Visualization:** Simultaneously track volume and financial trends in a single high-fidelity dashboard.

## 🛠 Tech Stack

### Frontend
*   **React + Vite:** For a blazing-fast development experience.
*   **Tailwind CSS:** Modern utility-first styling with custom Glassmorphism components.
*   **Zustand:** Lightweight and scalable state management.
*   **Recharts:** High-performance data visualization.
*   **Lucide React:** Beautiful, consistent iconography.

### Backend
*   **Node.js & Express:** Robust API architecture.
*   **Firebase Realtime Database:** Low-latency, live data synchronization across all clients.
*   **Razorpay SDK:** Secure payment processing.

## 🏁 Getting Started

### Prerequisites
*   Node.js (v16+)
*   Firebase Account
*   Razorpay API Keys

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/muh-habeeb/smart-care-connect-.git
   cd smart-care-connect-
   ```

2. **Frontend Setup:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Backend Setup:**
   ```bash
   cd ../backend
   npm install
   # Create a .env file with your FIREBASE and RAZORPAY credentials
   npm run dev
   ```

## 📐 Architecture

The project follows a modular architecture:
*   `/frontend/src/pages`: Role-based views (Manager, Doctor, Delivery).
*   `/frontend/src/store`: Centralized data and auth state.
*   `/backend/controllers`: Business logic for auth, orders, and payments.
*   `/backend/routes`: API endpoints mapped to specific roles.

## 🔮 Future Development

### 🏥 Medical Shop Integration
*   **Sales Analytics:** Detailed tracking of medicine sales by vendor, including daily/monthly revenue reports.
*   **Hospital-Specific Ordering:** Multi-hospital support allowing medical shops to fulfill orders from different healthcare facilities.
*   **Personnel Attribution:** Track specifically which doctor ordered which batch of supplies to improve accountability.
*   **Automated Restocking:** Predictive inventory alerts that automatically notify managers when essential medicines are running low.

## 📄 License
This project is for internal hospital use and authorized medical personnel only.
