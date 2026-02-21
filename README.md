🚚 FleetFlow: Modular Fleet & Logistics Management System
🎥 Watch the Demo
(Replace the link above with your actual YouTube or Loom demo link)
📌 Project Overview
FleetFlow is a centralized, rule-based digital hub designed to replace inefficient, manual logbooks. It optimizes the entire lifecycle of a delivery fleet by monitoring driver safety, validating cargo logistics, and tracking financial performance in real-time.
🎯 Target Users
Fleet Managers: For vehicle health and asset lifecycle oversight.
Dispatchers: To create trips, assign drivers, and validate cargo loads.
Safety Officers: To monitor compliance, license expirations, and safety scores.
Financial Analysts: To audit fuel spend, maintenance ROI, and operational costs.
✨ Key Features & "Smart" Logic
What sets FleetFlow apart is its automated validation engine that prevents human error before it happens.
🛡️ Compliance & Safety
License Expiry Guard: The system tracks license validity and automatically blocks a driver from assignment if their license is expired.
Driver Profiles: Includes safety scores and status toggles (On Duty, Off Duty, or Suspended).
📦 Intelligent Dispatching
Capacity Validation: Built-in logic prevents trip creation if the Cargo Weight exceeds the Vehicle’s Maximum Load Capacity.
Real-time Availability: Vehicles and drivers are automatically marked "On Trip" or "Available" based on the trip lifecycle.
🛠️ Maintenance & Financial ROI
Auto-In Shop Logic: Logging a maintenance activity (e.g., an oil change) automatically switches vehicle status to "In Shop," removing it from the Dispatcher's selection pool.
ROI Calculation: The system calculates Return on Investment for every asset using the Fuel Efficiency: Tracks $km/L$ and updates cost-per-km metrics after every trip completion.
🛠️ Technical Stack
Platform: Inspired by Odoo's modular approach.
Frontend: Modular UI with scannable data tables and status pills for high-level oversight.
Backend: Real-time state management for vehicle and driver availability.
Database: Relational structure linking expenses and trips to unique Vehicle IDs.
Design Blueprint: View the Excalidraw Mockup.
🔄 The FleetFlow Workflow
Vehicle Intake: Add "Van-05" (500kg capacity).
Compliance Check: Add Driver "Alex." System verifies license for the "Van" category.
Dispatching: Assign Alex to Van-05 for a 450kg load. System validates ($450 < 500$) and marks both as "On Trip".Completion: Driver logs final Odometer; status reverts to "Available".
Analytics: System generates one-click CSV/PDF exports for payroll and health audits.🚀 Installation & SetupBash# Clone the repository
git clone https://github.com/your-username/fleetflow.git

# Install dependencies
npm install

# Run the development server
npm run dev
