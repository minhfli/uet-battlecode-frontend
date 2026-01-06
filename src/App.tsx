import { BrowserRouter, Routes, Route } from "react-router-dom";
import MenuPage from "./pages/MenuPage";
import CaroPage from "./pages/CaroPage";
import UserPage from "./pages/UserPage";

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<MenuPage />} />
                <Route path="/caro/:tourId" element={<CaroPage />} />
                <Route path="/user" element={<UserPage />} />
            </Routes>
        </BrowserRouter>
    );
}
