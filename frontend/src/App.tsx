import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Home from './components/Home';
import Maps from './components/Maps';
import Announcements from './components/Announcements';
import ContactUs from './components/ContactUs';
import LostPawsForm from './components/LostPawsForm';


import { Announcement } from './types';

function App() {
    const announcementsData: Announcement[] = [
        {
            id: 1,
            name: "Ben",
            status: "Lost",
            location: "Kiev, Yurivka, 08170",
            petType: "Dog",
            sex: "Male",
            date: "2023-05-01",
            image: "/assets/image/Ben.jpeg",
        },
        {
            id: 2,
            name: "Murka",
            status: "Lost",
            location: "Lviv, Dubly, 82434",
            petType: "Cat",
            sex: "Female",
            date: "2023-04-15",
            image: "/assets/image/Murka.jpeg",
        },
        {
            id: 3,
            name: "Jon",
            status: "Found",
            location: "Rivne, Obariv, 35307",
            petType: "Dog",
            sex: "Male",
            date: "2023-05-03",
            image: "/assets/image/Jon.jpeg", // Локальне зображення
        },
        {
            id: 4,
            name: "Sharik",
            status: "Lost",
            location: "Chernivtsi, 58000",
            petType: "Dog",
            sex: "Male",
            date: "2023-03-12",
            image: "/assets/image/Sharik.jpeg", // Локальне зображення
        },
        {
            id: 5,
            name: "Luigi",
            status: "Lost",
            location: "Odessa, 65000",
            petType: "Cat",
            sex: "Male",
            date: "2023-02-20",
            image: "/assets/image/Luigi.png", // Локальне зображення
        },
        {
            id: 6,
            name: "Lisa",
            status: "Found",
            location: "Kharkiv, 61000",
            petType: "Dog",
            sex: "Female",
            date: "2023-01-15",
            image: "/assets/image/Lisa.jpeg", // Локальне зображення
        },
    ];
    return (
        <Router>
            <div className="App">
                <Header />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/maps" element={<Maps />} />
                    <Route path="/announcements" element={<Announcements announcements={announcementsData} />} />
                    <Route path="/contact" element={<ContactUs />} />
                    <Route path="/report" element={<LostPawsForm />} />
                </Routes>
                <Footer />
            </div>
        </Router>
    );
}

export default App;