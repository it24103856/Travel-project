import { Routes, Route, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
//pages
import AdminContactPage from "./Admin/adminContactPage";
import AdminMessages from "./Admin/AdminMessages";

export default function AdminPage() {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/users/`, {
            headers: { Authorization: `Bearer ${token}` }
        }).then((response) => {
            const userData = response.data.user;
            if (userData && userData.role === "admin") {
                setUser(userData);
                setIsLoading(false);
            } else {
                navigate("/");
            }
        }).catch(() => navigate("/login"));
    }, [navigate]);

    if (isLoading) return <div className="h-screen flex items-center justify-center">Loading Admin...</div>;

    return (
        <div className="w-full h-screen flex overflow-hidden bg-gray-100">
            {/* 1. පැත්තෙන් තියෙන Sidebar එක */}
            

            <div className="flex-1 flex flex-col h-full overflow-y-auto">
                {/* 2. උඩින් තියෙන Header එක */}

                {/* 3. ප්‍රධාන Content එක */}
                <div className="p-6">
                    <Routes>
                        <Route path="/contact" element={<AdminContactPage />} />
                        <Route path="/messages" element={<AdminMessages />} />
                        <Route path="/" element={<h1 className="text-2xl font-bold">Welcome to the Admin Dashboard!</h1>} />
                    </Routes>
                </div>
            </div>
        </div>
    );
}