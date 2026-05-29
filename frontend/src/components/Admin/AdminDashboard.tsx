import React, { useState, useEffect } from 'react';
import { reportService } from '../../services/reportService';
import { authService } from '../../services/authService';
import { PetReport, User } from '../../types';
import './AdminDashboard.css';

const AdminDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'reports' | 'users'>('reports');
    const [reports, setReports] = useState<PetReport[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (activeTab === 'reports') {
            fetchReports();
        } else {
            fetchUsers();
        }
    }, [activeTab]);

    const fetchReports = async () => {
        setIsLoading(true);
        try {
            const data = await reportService.getReports({});
            setReports(data.reports);
        } catch (error) {
            console.error('Failed to fetch reports', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const data = await authService.adminGetAllUsers();
            setUsers(data);
        } catch (error) {
            console.error('Failed to fetch users', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteReport = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this report?')) {
            try {
                await reportService.deleteReport(id);
                setReports(reports.filter(r => r.id !== id));
            } catch (error) {
                alert('Failed to delete report');
            }
        }
    };

    const handleVerifyUser = async (userId: string) => {
        try {
            await authService.adminVerifyUser(userId);
            setUsers(users.map(u => u.id === userId ? { ...u, isVerified: true } : u));
        } catch (error) {
            alert('Failed to verify user');
        }
    };

    const handleToggleRole = async (user: User) => {
        const newRole = user.role === 'admin' ? 'user' : 'admin';
        if (window.confirm(`Change ${user.email} to ${newRole}?`)) {
            try {
                await authService.adminUpdateRole(user.id, newRole);
                setUsers(users.map(u => u.id === user.id ? { ...u, role: newRole } : u));
            } catch (error) {
                alert('Failed to update role');
            }
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (window.confirm('Delete this user? All their reports will be orphaned or deleted based on DB constraints.')) {
            try {
                await authService.adminDeleteUser(userId);
                setUsers(users.filter(u => u.id !== userId));
            } catch (error) {
                alert('Failed to delete user');
            }
        }
    };

    return (
        <div className="admin-dashboard">
            <header className="admin-header">
                <div>
                    <h1>Admin Control Panel</h1>
                    <div className="admin-tabs">
                        <button 
                            className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
                            onClick={() => setActiveTab('reports')}
                        >
                            Reports ({reports.length})
                        </button>
                        <button 
                            className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
                            onClick={() => setActiveTab('users')}
                        >
                            Users ({users.length})
                        </button>
                    </div>
                </div>
            </header>

            <main className="admin-content">
                {isLoading ? (
                    <div className="admin-loading">Loading...</div>
                ) : activeTab === 'reports' ? (
                    <section className="admin-section">
                        <h2>Manage Reports</h2>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Pet Name</th>
                                    <th>Status</th>
                                    <th>Species</th>
                                    <th>Contact Email</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reports.map(report => (
                                    <tr key={report.id}>
                                        <td>{report.petName}</td>
                                        <td><span className={`status-badge ${report.petStatus}`}>{report.petStatus}</span></td>
                                        <td>{report.petSpecies}</td>
                                        <td>{report.contactEmail}</td>
                                        <td>{new Date(report.createdAt!).toLocaleDateString()}</td>
                                        <td>
                                            <button onClick={() => handleDeleteReport(report.id)} className="admin-btn delete">Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>
                ) : (
                    <section className="admin-section">
                        <h2>User Management</h2>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Verified</th>
                                    <th>Joined</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u.id}>
                                        <td>{u.name}</td>
                                        <td>{u.email}</td>
                                        <td>
                                            <span className={`role-badge ${u.role}`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td>
                                            {u.isVerified ? 
                                                <span className="verified-yes">✅</span> : 
                                                <button onClick={() => handleVerifyUser(u.id)} className="admin-btn verify">Verify Now</button>
                                            }
                                        </td>
                                        <td>{new Date(u.createdAt!).toLocaleDateString()}</td>
                                        <td>
                                            <div className="action-group">
                                                <button onClick={() => handleToggleRole(u)} className="admin-btn role">
                                                    {u.role === 'admin' ? 'Demote' : 'Promote'}
                                                </button>
                                                <button onClick={() => handleDeleteUser(u.id)} className="admin-btn delete">Delete</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;
