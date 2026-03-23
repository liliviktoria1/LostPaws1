import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "./Maps.css";

const Maps = () => {
    const mapRef = useRef(null); // Зберігає стан карти

    useEffect(() => {
        if (mapRef.current === null) {
            // Ініціалізація карти
            mapRef.current = L.map("map").setView([50.4501, 30.5234], 13); // Координати Києва

            // Додавання OpenStreetMap шару
            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            }).addTo(mapRef.current);

            // Додавання маркера
            L.marker([50.4501, 30.5234])
                .addTo(mapRef.current)
                .bindPopup("Це Київ!")
                .openPopup();
        }
        // Очищення карти при розмонтуванні компонента
        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []); // Виконується лише один раз при монтуванні компонента

    return (
        <div className="map-container">
            <h1>Maps</h1>
            <div id="map" style={{ height: "500px", width: "100%" }}></div> {/* Контейнер для карти */}
        </div>
    );
};

export default Maps;