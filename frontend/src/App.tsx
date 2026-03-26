import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Home from './components/Home';
import Maps from './components/Maps';
import Announcements from './components/Announcements';
import ContactUs from './components/ContactUs';
import LostPawsForm from './components/LostPawsForm';
import { mockAnnouncements } from './data/mockData';

function App() {
    return (
        <Router>
            <div className="App">
                <Header />
                <main className="content">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/maps" element={<Maps />} />
                        <Route path="/announcements" element={<Announcements announcements={mockAnnouncements} />} />
                        <Route path="/contact" element={<ContactUs />} />
                        <Route path="/report" element={<LostPawsForm />} />
                    </Routes>
                </main>
                <Footer />
            </div>
        </Router>
    );
}

export default App;
