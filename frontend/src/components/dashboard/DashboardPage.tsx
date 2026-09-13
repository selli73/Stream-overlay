import { observer } from "mobx-react-lite";
import { SessionSection } from "./sections/SessionSection";
import { DonationSection } from "./sections/DonationSection";
import { OverlaySection } from "./sections/OverlaySection";
import { HistorySection } from "./sections/HistorySection";
import { SetupSection } from "./sections/SetupSection";
import { HeaderDashboard } from "./sections/HeaderDashboard";
import './DashboardPage.css';


export const DashboardPage = observer(() => {
    
    
    return (
        <div className="dashboard">
            <HeaderDashboard />
            <SessionSection />   
            <DonationSection />            
            <OverlaySection />           
            <HistorySection />  
            <SetupSection />          
        </div>
    );
})