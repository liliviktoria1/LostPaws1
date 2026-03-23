import React, { useState, useMemo } from "react";
import "./Announcements.css";

const AnnouncementsPage = ({ announcements }) => {
    const [filters, setFilters] = useState({
        status: "",
        location: "",
        petType: "",
        sex: "",
    });

    const [isFilterVisible, setIsFilterVisible] = useState(false); // Стан для відображення фільтра

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prevFilters) => ({
            ...prevFilters,
            [name]: value,
        }));
    };

    const clearFilters = () => {
        setFilters({
            status: "",
            location: "",
            petType: "",
            sex: "",
        });
    };

    const filteredAnnouncements = useMemo(() => {
        return (announcements || []).filter((announcement) => {
            return (
                (filters.status === "" || announcement.status === filters.status) &&
                (filters.location === "" ||
                    announcement.location
                        .toLowerCase()
                        .includes(filters.location.toLowerCase())) &&
                (filters.petType === "" || announcement.petType === filters.petType) &&
                (filters.sex === "" || announcement.sex === filters.sex)
            );
        });
    }, [announcements, filters]);

    const handleViewPost = (id) => {
        console.log("View post clicked for announcement ID:", id);
    };

    return (
        <div className="announcements-page">
            <h1>Announcements</h1>
            <button
                className="filter-toggle-button"
                onClick={() => setIsFilterVisible(!isFilterVisible)}>
                {isFilterVisible ? "Hide Filter" : "Show Filter"}
            </button>

            {isFilterVisible && (
                <div className="filter-section">
                    <form className="filter-form">
                        <div>
                            <label>Status:</label>
                            <div>
                                <label>
                                    <input
                                        type="radio"
                                        name="status"
                                        value="Lost"
                                        onChange={handleFilterChange}
                                    />
                                    Lost
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        name="status"
                                        value="Found"
                                        onChange={handleFilterChange}
                                    />
                                    Found
                                </label>
                            </div>
                        </div>
                        <div>
                            <label>Location:</label>
                            <input
                                type="text"
                                name="location"
                                placeholder="City, Zip, or Address"
                                onChange={handleFilterChange}
                            />
                        </div>
                        <div>
                            <label>Pet type:</label>
                            <div>
                                <label>
                                    <input
                                        type="radio"
                                        name="petType"
                                        value="Dog"
                                        onChange={handleFilterChange}
                                    />
                                    Dog
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        name="petType"
                                        value="Cat"
                                        onChange={handleFilterChange}
                                    />
                                    Cat
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        name="petType"
                                        value="Other"
                                        onChange={handleFilterChange}
                                    />
                                    Other
                                </label>
                            </div>
                        </div>
                        <div>
                            <label>Sex:</label>
                            <div>
                                <label>
                                    <input
                                        type="radio"
                                        name="sex"
                                        value="Male"
                                        onChange={handleFilterChange}
                                    />
                                    Male
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        name="sex"
                                        value="Female"
                                        onChange={handleFilterChange}
                                    />
                                    Female
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        name="sex"
                                        value="Unknown"
                                        onChange={handleFilterChange}
                                    />
                                    Unknown
                                </label>
                            </div>
                        </div>
                        <button type="button" onClick={clearFilters}>Clear Filters</button>
                    </form>
                </div>
            )}
            <div className="announcements-list">
                {filteredAnnouncements.length > 0 ? (
                    filteredAnnouncements.map((announcement) => (
                        <div className="announcement-card" key={announcement.id}>
                            <img src={announcement.image} alt={announcement.name} />
                            <h3>{announcement.name}</h3>
                            <p>Status: <span>{announcement.status}</span></p>
                            <p>Address: {announcement.location}</p>
                            <button onClick={() => handleViewPost(announcement.id)}>View Post</button>
                        </div>
                    ))
                ) : (
                    <p>No announcements match your filters.</p>
                )}
            </div>
        </div>
    );
};

export default AnnouncementsPage;