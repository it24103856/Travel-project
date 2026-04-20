import { Routes, Route } from "react-router-dom";

//pages and components imports
import Header from "../components/Header"; 
import About from "./aboutPage";
import HomePage from "./homePage";
import Contact from "./contact"; 
import ProfilePage from "./ProfilePage";
import Drivers from "./driverPage";
import DriverOverview from "../components/driverOverview";
import HotelPage from "./hotelPage";
import HotelOverview from "../components/hotelOverview";
import FeedbackPage from "./Feedback";
import BookingPage from "./BookingPage";
import PaymentMainPage from "./paymentPage";
import MyBookings from "../components/MyBokkings";
import BankTransferPage from "../components/BankTranferPage";
import MyPayments from "../components/MypayemntPage";
import CryptoPayment from "../components/cryptoPayment";
import DestinationPage from "./destinationpage";
import DestinationOverview from "../components/destinationOverview";
import Vehicles from "./vehiclePage";
import VehicleOverview from "../components/vehicleOverview";
import PackageOverviewPage from "../components/packageOverview";
import PackagePage from "./packagePage";
import RecommendationsPage from "./recommendationsPage";

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
                    <Route path="/drivers" element={<Drivers />} />
                    <Route path="/overview/:email" element={<DriverOverview />} />
                    <Route path="/hotel" element={<HotelPage />} />
                    <Route path="/hotel-details/:id" element={<HotelOverview />} />
                    <Route path="/feedback" element={<FeedbackPage />} />
                    <Route path="/booking/:type/:id" element={<BookingPage />} />
                    <Route path="/payment" element={<PaymentMainPage />} />
                    <Route path="/payment/bank-transfer" element={<BankTransferPage />} />
                    <Route path="/payment/crypto" element={<CryptoPayment />} />
                    <Route path="/my-payments" element={<MyPayments />} />
                    <Route path="/packages" element={<PackagePage />} />
                    <Route path="/destinations" element={<DestinationPage />} />
                    <Route path="/destination/:id" element={<DestinationOverview />} />
                    <Route path="/my-bookings/:userId" element={<MyBookings />} />
                    <Route path="/vehicles" element={<Vehicles />} />
                    <Route path="/vehicle/:id" element={<VehicleOverview />} />
                    <Route path="/package-details/:id" element={<PackageOverviewPage />} />
                    <Route path="/ai-recommendations" element={<RecommendationsPage />} />
                </Routes>
            </main>
        </div>
    );
}