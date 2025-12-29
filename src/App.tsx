import { BrowserRouter, Routes, Route } from "react-router-dom";
import MenuPage from "./pages/MenuPage";
import CaroPage from "./pages/CaroPage";

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<MenuPage />} />
                <Route path="/caro" element={<CaroPage />} />
            </Routes>
        </BrowserRouter>
    );
}
