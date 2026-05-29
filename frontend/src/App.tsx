import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Home from './components/Home';
import Maps from './components/Maps';
import Announcements from './components/Announcements';
import ContactUs from './components/ContactUs';
import LostPawsForm from './components/LostPawsForm';
import PetDetail from './components/PetDetail';
import MyReports from './components/MyReports';
import Chat from './components/Chat';
import SuccessStories from './components/SuccessStories';
import Profile from './components/Auth/Profile';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminDashboard from './components/Admin/AdminDashboard';

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="App">
                    <Header />
                    <main className="content">
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/maps" element={<Maps />} />
                            <Route path="/announcements" element={<Announcements />} />
                            <Route path="/contact" element={<ContactUs />} />
                            <Route path="/pet/:id" element={<PetDetail />} />
                            <Route path="/success-stories" element={<SuccessStories />} />
                            
                            {/* Protected Routes */}
                            <Route path="/report" element={<ProtectedRoute><LostPawsForm /></ProtectedRoute>} />
                            <Route path="/my-reports" element={<ProtectedRoute><MyReports /></ProtectedRoute>} />
                            <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
                            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                            
                            {/* Admin Routes */}
                            <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
                        </Routes>
                    </main>
                    <Footer />
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;
