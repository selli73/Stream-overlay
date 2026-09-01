import { BrowserRouter, Route, Routes } from "react-router-dom";
import { DashboardPage } from "./components/dashboard/DashboardPage";
import { OverlayPage } from "./components/overlay/OverlayPage";

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path='/dashboard' element={<DashboardPage />} />
                <Route path='/overlay/:streamerId' element={<OverlayPage />} />
            </Routes>
        </BrowserRouter>
    )
}