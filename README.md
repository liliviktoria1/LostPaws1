# Lost Paws 🐾

A full-stack application dedicated to reuniting lost pets with their owners using advanced AI-powered matching, automated geocoding, and real-time notifications.

## 🚀 Features

- **AI-Powered Pet Matching:** Utilizes Google Gemini 1.5 Flash to visually compare pet photos (analyzing fur patterns, snout shape, and markings) and generate a strict confidence score.
- **Automated Form Auto-fill:** Upload a pet photo, and the AI automatically extracts the species, breed, colors, and distinctive features to pre-fill the report form.
- **Two-Step Deep Scan Architecture:** 
  - **Fast Vector Search:** Uses Gemini's `text-embedding-004` to find potential candidates based on text descriptions and extracted features.
  - **Deep Visual Verification:** Compares images of the top candidates using vision models to eliminate false positives and provide high-accuracy matching.
- **Passive Background Watcher:** Automatically and asynchronously scans new "Found" reports against existing "Lost" reports in the background without slowing down the user experience.
- **Smart Notifications & Alerts:** Features a real-time in-app notification bell and sends automated email alerts (via Nodemailer) when a high-confidence visual match is found.
- **Interactive Maps & Geocoding:** Integration with Leaflet for map-based reporting and OpenStreetMap (Nominatim) for automatic address-to-coordinate geocoding.
- **Secure Authentication:** User registration and login using JWT and bcrypt.

## 🛠 Technologies Used

### Frontend
- **React 18** (Create React App)
- **TypeScript** for robust type safety
- **React Router DOM v7** for navigation
- **Leaflet** for interactive maps
- **React Dropzone** for drag-and-drop file uploads
- **Custom CSS3** for responsive, modern styling

### Backend
- **Node.js & Express 5**
- **TypeScript**
- **Sequelize ORM** for database management
- **PostgreSQL** as the primary relational database
- **Google Generative AI SDK** (Gemini 1.5 Flash & Text Embeddings)
- **Multer** for handling multipart/form-data image uploads
- **Nodemailer** for dispatching email notifications
- **JSON Web Tokens (JWT) & bcryptjs** for secure authentication

## ⚙️ Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL installed and running
- A Google Gemini API Key

### 1. Database Setup
1. Ensure your local PostgreSQL server is running.
2. Create a new database named `lost_paws_db` (or your preferred name).

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` directory with the following variables:
   ```env
   PORT=8080
   NODE_ENV=development

   # Database Configuration
   DB_NAME=lost_paws_db
   DB_USER=postgres
   DB_PASSWORD=your_postgres_password
   DB_HOST=localhost
   DB_PORT=5432

   # AI & Secrets
   GEMINI_API_KEY=your_gemini_api_key_here
   JWT_SECRET=your_jwt_secret_key_here
   
   # Email Configuration (for Nodemailer match alerts)
   SMTP_HOST=smtp.ethereal.email
   SMTP_PORT=587
   SMTP_USER=your_smtp_user
   SMTP_PASS=your_smtp_password
   ```
4. Build and start the backend server:
   ```bash
   npm run build
   npm start
   ```
   *Note: On the first run, Sequelize will automatically sync and create the necessary database tables.*

### 3. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `frontend` directory to link to the backend:
   ```env
   PORT=3005
   REACT_APP_API_URL=http://localhost:8080/api
   ```
4. Start the frontend development server:
   ```bash
   npm start
   ```

## 🧠 How the AI Matching Works

1. **Report Creation & Auto-fill:** When a user uploads a pet photo during report creation, the image is passed to Gemini 1.5 Flash to extract physical traits, instantly auto-filling the form.
2. **Embedding Generation:** Upon form submission, a text-based vector embedding (`text-embedding-004`) is generated, mathematically describing the pet's characteristics.
3. **Passive Watching:** The system fires off an asynchronous background job comparing the new report against the database using cosine similarity on the embeddings to find the top candidates.
4. **Visual Verification:** The photos of the top candidates from the vector search are sent to Gemini 1.5 Flash for a strict, side-by-side visual comparison.
5. **Notification:** If the AI's visual confidence score exceeds the threshold (e.g., 75%), the system generates an in-app alert and sends an email to the pet owner containing a link to the match.
6. **On-Demand Scanning:** Report owners can also manually trigger this deep visual scan at any time from their pet's detail page using the "✨ Scan for Matches" button.
