# 🚚 FleetFlow: Modular Fleet & Logistics Management System

## 🎥 Project Demo
[![Watch the Video Presentation](https://img.shields.io/badge/Watch-Video_Demo-red?style=for-the-badge&logo=youtube)](https://drive.google.com/file/d/1sZ8ZShr9T8jje-F6OJBDuSikaRBlL__6/view?usp=sharing)
*(Click the badge above to watch our hackathon pitch!)*

---

## 📌 Project Overview
**FleetFlow** is a MERN STACK-based centralized, rule-based digital hub designed to replace inefficient, manual logbooks. Built with an **Odoo-inspired modular approach**, the system optimizes the entire lifecycle of a delivery fleet by monitoring driver safety, validating cargo logistics, and tracking financial performance in real-time.

### 🎯 Target Users
* **Fleet Managers:** Oversee vehicle health, asset lifecycle, and scheduling.
* **Dispatchers:** Create trips, assign drivers, and validate cargo loads.
* **Safety Officers:** Monitor driver compliance, license expirations, and safety scores.
* **Financial Analysts:** Audit fuel spend, maintenance ROI, and operational costs.

---

## ✨ Key Features & "Smart" Logic
What sets FleetFlow apart is its **automated validation engine** that prevents human error before it happens.

### 🛡️ Compliance & Safety
* **License Expiry Guard:** The system tracks license validity and automatically blocks a driver from assignment if their license is expired.
* **Driver Profiles:** Includes safety scores, trip completion rates, and status toggles (On Duty, Off Duty, or Suspended).

### 📦 Intelligent Dispatching
* **Capacity Validation:** Built-in logic prevents trip creation if the Cargo Weight exceeds the Vehicle’s Maximum Load Capacity.
* **Real-time Availability:** Vehicles and drivers are automatically marked "On Trip" or "Available" based on the trip lifecycle.

### 🛠️ Maintenance & Financial ROI
* **Auto-In Shop Logic:** Logging a maintenance activity automatically switches vehicle status to "In Shop," removing it from the Dispatcher's selection pool.
* **ROI Calculation:** The system calculates Return on Investment for every asset using the formula:
  
  $$\text{Vehicle ROI} = \frac{\text{Revenue} - (\text{Maintenance} + \text{Fuel})}{\text{Acquisition Cost}}$$

* **Fuel Efficiency:** Tracks **km/L** and updates cost-per-km metrics after every trip completion.

---

## 🔄 The FleetFlow Workflow
1.  **Vehicle Intake:** Add an asset (e.g., "Van-05" with 500kg capacity).
2.  **Compliance Check:** Add a Driver; the system verifies license validity for that specific vehicle category.
3.  **Dispatching:** Assign a driver to a vehicle for a specific load. System validates capacity (e.g., 450kg < 500kg) and marks both as "On Trip."
4.  **Completion:** Driver logs final Odometer; status reverts to "Available" for the next dispatch.
5.  **Maintenance:** Manager logs service; system auto-logic hides the vehicle from the dispatcher pool.

---

## 🛠️ Technical Implementation
* **Frontend:** Modular UI with scannable data tables and status pills.
* **Backend:** Real-time state management for vehicle and driver availability.
* **Database:** Relational structure linking expenses and trips to unique Vehicle IDs.
* **Design Blueprint:** [View the Excalidraw Mockup](https://link.excalidraw.com/I/65VNwvy7c4X/9gLrP9aS4YZ)

---

## 🚀 Getting Started
```bash
# Clone the repository
git clone [https://github.com/OmJadiya3226/Odoo-26.git](https://github.com/OmJadiya3226/Odoo-26.git)

# Navigate to the project
cd Odoo-26

# Install dependencies
npm install

# Run the application
npm run dev
