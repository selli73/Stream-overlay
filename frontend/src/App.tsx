import { BrowserRouter, Route, Routes } from "react-router-dom";
import { DashboardPage } from "./components/dashboard/DashboardPage";
import { OverlayPage } from "./components/overlay/OverlayPage";
import { TrackHistory } from "./components/trackHistory/TrackHistory";

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path='/dashboard' element={<DashboardPage />} />
                <Route path='/overlay/:streamerId' element={<OverlayPage />} />
                <Route path='/history/:streamerId' element={<TrackHistory />} />                
            </Routes>
        </BrowserRouter>
    )
}