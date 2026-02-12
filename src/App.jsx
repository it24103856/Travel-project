import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { GoogleOAuthProvider } from '@react-oauth/google';

// Pages Import - folder structure 
import LoginPage from './Pages/login';
import RegisterPage from './Pages/register';
import LinkPage from './Pages/linkPage';
import AdminPage from './Pages/adminPage';
import ContactPage from './Pages/contact';
import ForgotPassword from "./Pages/ForgotPassword";
function App() {
  return (
    <GoogleOAuthProvider clientId="601712598116-ckm9o17glc4rkas75394cfdcp74glbig.apps.googleusercontent.com">
      <BrowserRouter>
        <Toaster position="top-center" reverseOrder={false} />
        <div className='w-full h-screen bg-[#F3F4F6] text-[#1F1F1F]'>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path='/admin/*' element={<AdminPage/>}/>
            <Route path="/*" element={<LinkPage />} />
            <Route path="/admin/*" element={<AdminPage />} />
            <Route path="/forget-password" element={<ForgotPassword />} />
          </Routes>
        </div>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;