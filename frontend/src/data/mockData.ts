import { MockPet, Announcement } from '../types';

export const mockAnnouncements: Announcement[] = [
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
        image: "/assets/image/Jon.jpeg", 
    },
    {
        id: 4,
        name: "Sharik",
        status: "Lost",
        location: "Chernivtsi, 58000",
        petType: "Dog",
        sex: "Male",
        date: "2023-03-12",
        image: "/assets/image/Sharik.jpeg", 
    },
    {
        id: 5,
        name: "Luigi",
        status: "Lost",
        location: "Odessa, 65000",
        petType: "Cat",
        sex: "Male",
        date: "2023-02-20",
        image: "/assets/image/Luigi.png", 
    },
    {
        id: 6,
        name: "Lisa",
        status: "Found",
        location: "Kharkiv, 61000",
        petType: "Dog",
        sex: "Female",
        date: "2023-01-15",
        image: "/assets/image/Lisa.jpeg", 
    },
];

export const mockMissingPets: MockPet[] = [
    { id: 1, name: "Ben", status: "Lost", location: "Kiev, Yurivka, 08170", image: "/assets/image/Ben.jpeg" },
    { id: 2, name: "Murka", status: "Lost", location: "Lviv, Duliby, 82434", image: "/assets/image/Murka.jpeg" },
    { id: 3, name: "Sharik", status: "Lost", location: "Chernivtsi, 58000", image: "/assets/image/Sharik.jpeg" },
    { id: 4, name: "Eshli", status: "Lost", location: "Odessa, 65000", image: "/assets/image/Eshli.png" },
];

export const mockFoundPets: MockPet[] = [
    { id: 1, name: "Jon", status: "Found", location: "Kiev, Yurivka, 08170", image: "/assets/image/Jon.jpeg" }, 
    { id: 2, name: "Luigi", status: "Found", location: "Lviv, Duliby, 82434", image: "/assets/image/Luigi.png" },
    { id: 3, name: "Lisa", status: "Found", location: "Chernivtsi, 58000", image: "/assets/image/Lisa.jpeg" },  
];
