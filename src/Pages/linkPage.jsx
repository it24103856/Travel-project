import { Routes, Route } from "react-router-dom";

//pages and components imports
import Header from "../components/Header"; 
import About from "./aboutPage";
import HomePage from "./homePage";
import Contact from "./contact"; 
import ProfilePage from "./ProfilePage";

export default function LinkPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <Header /> 
            
            <main className="flex-grow">
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} /> 
                    <Route path="/profile" element={<ProfilePage />} />
                </Routes>
            </main>
        </div>
    );
}