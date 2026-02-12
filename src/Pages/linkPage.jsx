import { Routes, Route } from "react-router-dom";




{/*Import pages*/}
import About from "./aboutPage";
import HomePage from "./homePage";


export default function LinkPage() {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<HomePage />} />
        </Routes>
    );
}
