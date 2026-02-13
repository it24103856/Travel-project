import { Routes, Route } from "react-router-dom";
import Header from "../components/Header"; 
import About from "./aboutPage";
import HomePage from "./homePage";
import Contact from "./contact"; // Contact පිටුව හරියට import කරන්න

export default function LinkPage() {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Header එක මෙතන තියෙන නිසා මේ ඇතුළේ තියෙන හැම පේජ් එකකටම මේක පොදුයි */}
            <Header /> 
            
            <main className="flex-grow">
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} /> 
                </Routes>
            </main>
        </div>
    );
}