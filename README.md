TrackFlow- Customer Lead Management
A React-based CRM system for managing leads and orders, integrated with Supabase for real-time data handling.

Features


Lead Management:

Create, edit, and list leads (name, company, contact, email, product, quantity, price, stage, follow-up date).
Filter by stage, search by name/company, sort by name, follow-up date, or creation date.
Update lead stage, auto-delete orders if stage changes from 'Won'.
Set and manage follow-up dates with toast notifications.

Order Management:

Create/list orders for leads with 'Won' stage, preventing duplicates.
Update order status ('Order Received', 'In Development', 'Ready to Dispatch', 'Dispatched').
Send email receipts on 'Dispatched' status via backend API.
Download PDF receipts for dispatched orders (jsPDF).
Filter by status, search by lead name, sort by name or dispatch date.

Dashboard:

Metrics: total leads, leads won, total orders, dispatched orders.
Charts: bar (lead/order counts), pie (lead stage distribution), line (lead creation trend).
Lists top 5 upcoming follow-ups.
Navigation to view/add leads and orders.

General:

Supabase for real-time CRUD operations.
Responsive UI with Tailwind CSS and Font Awesome icons.
Toast notifications for user feedback.
Client-side routing with React Router.

Architecture

Frontend: React with hooks (useState, useEffect, useCallback) for state and side effects. React Router for navigation.
Data Management: Supabase (PostgreSQL) with leads and orders tables. Local component state, no global state management.
UI/UX: Tailwind CSS for styling, Chart.js for charts, jsPDF for PDF receipts, React Toastify for notifications, Font Awesome for icons.

Components:
Dashboard.js: Analytics with charts and navigation.
LeadList.js: Table-based lead management with editing/filtering.
CreateLeads.js: Lead creation form.
OrderList.js: Order listing with status updates and PDF downloads.
CreateOrderPage.js: Order creation form for 'Won' leads.

Data Flow:

Leads created/edited in LeadList.js/CreateLeads.js, stored in Supabase.
Orders created in CreateOrderPage.js/OrderList.js for 'Won' leads, with status updates triggering emails/PDFs.
Dashboard aggregates data for metrics and charts.
Integrations: Supabase client for database, backend API for email receipts.
Error Handling: Console logs and toast notifications for errors, basic form validation.

![lead_order_lifecycle (1)](https://github.com/user-attachments/assets/ba67f7c5-8103-4d34-86d9-8d56ca7a9aa8)

Setup(Frontend):

1. Install dependencies: npm install
2. Set up Supabase: Create a  project at supabase.com.
   Create leads and orders tables
3. Configure Supabase client:
In src/supabaseClient.js, add your Supabase URL and anon key:

import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';
export const supabase = createClient(supabaseUrl, supabaseKey);

4. Run the frontend: npm start

Setup(Backend):
1. Navigate to the server directory: cd Server
2. Install dependencies: npm install
3. Configure environment variables:
   Create a .env file in the server directory:

   PORT=5000
   EMAIL_USER=your_email@example.com
   EMAIL_PASS=your_email_password
   
5. Run the backend: node server.js
![Screenshot 2025-05-25 115414](https://github.com/user-attachments/assets/69918cf9-7b3a-4427-beb7-5edc83ef7e55)
![Screenshot 2025-05-25 115253](https://github.com/user-attachments/assets/41d2bcfb-8029-463c-a5c1-952f03985d9d)
![Screenshot 2025-05-25 115207](https://github.com/user-attachments/assets/89f9216b-4ab4-42ed-b6b4-6f25df38463d)
![Screenshot 2025-05-25 115057](https://github.com/user-attachments/assets/f4231899-2175-48f5-ba0b-b33f3e6cc9a9)
![Screenshot 2025-05-25 115128](https://github.com/user-attachments/assets/3b933617-768c-4f70-94cf-f4337f6923be)
![Screenshot 2025-05-25 120625](https://github.com/user-attachments/assets/7711fe9b-7b90-4137-88d2-24bd4c330724)


