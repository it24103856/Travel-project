import { toast } from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';
import { uploadFile } from '../utils/meadiaUpload';
import { BiCamera } from "react-icons/bi";

export default function RegisterPage() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    // New state for  image file
    const[imageFile, setImageFile] = useState(null);
    const[preview,setPreview] = useState(null);

    // Handle image selection
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if(file){
            setImageFile(file);
            setPreview(URL.createObjectURL(file));
        }
    }
    async function HandleRegister(e) {
        if (e) e.preventDefault();

        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }
        if (password.length < 6) {
            toast.error("Password must be at least 6 characters long");
            return;
        }
        if (!firstName || !lastName || !email || !password || !confirmPassword) {
            toast.error("All fields are required");
            return;
        }

        setIsLoading(true);
        try {
    let imageUrl = "/default-profile.png"; 

    if (imageFile) {
        // Upload වෙන්න යන වෙලාවේ toast එකක් පෙන්වමු
        const uploadToast = toast.loading("Uploading image...");
        try {
            const uploadedUrl = await uploadFile(imageFile);
            if (uploadedUrl) {
                imageUrl = uploadedUrl;
                toast.success("Image uploaded!", { id: uploadToast });
            }
        } catch (uploadErr) {
            toast.error("Image upload failed!", { id: uploadToast });
            console.error(uploadErr);
            // Image එක වැරදුණත් registration එක නවත්වන්න ඕනේ නැත්නම් මෙතන return කරන්න එපා
        }
    }

    const res = await axios.post(import.meta.env.VITE_BACKEND_URL + "/users/create", {
        firstName,
        lastName,
        email,
        password,
        image: imageUrl
    });
    
    toast.success("Registration successful!");
    navigate("/login");
} catch (error) {
    toast.error(error.response?.data?.message || "Registration failed");
} finally {
    setIsLoading(false);
}

    }

    return (
        
        <div className="w-full min-h-screen bg-[url('/travel-bg.jpg')] bg-center bg-cover bg-no-repeat flex items-center justify-center relative px-6 py-10">
            
            {/* Dark Overlay for better readability */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"></div>

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between w-full max-w-6xl gap-12">
                
                {/* Left Side: Brand Identity */}
                <div className="text-center md:text-left max-w-[550px]">
                    <img src="/logo.png" alt="Travel Logo" className="w-40 mb-8 mx-auto md:mx-0 drop-shadow-2xl" />
                    <h1 className="text-white font-extrabold text-5xl md:text-6xl leading-[1.1] drop-shadow-2xl">
                        Start Your <br />
                        <span className="text-cyan-400">Adventure</span> Today.
                    </h1>
                    <p className="mt-6 text-gray-100 text-xl font-light tracking-wide italic drop-shadow-md">
                        "Join our community of world travelers and discover hidden gems."
                    </p>
                </div>

                {/* Right Side: Glassmorphism Register Form */}
                <form onSubmit={HandleRegister} className="w-full max-w-[480px] bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-10 flex flex-col items-center">
                    <h2 className="text-3xl font-bold text-white mb-2 self-start">Create Account</h2>
                    <p className="text-white/60 text-sm mb-8 self-start">Sign up to get started on your journey.</p>

                    {/* --- Profile Image Picker --- */}
                    <div className="relative mb-8 group">
                        <div className="w-24 h-24 rounded-full border-4 border-cyan-400 overflow-hidden bg-white/20 shadow-xl">
                            {preview ? (
                                <img src={preview} alt="preview" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-white/40 text-[10px] text-center p-2 uppercase">
                                    Upload Photo
                                </div>
                            )}
                        </div>
                        <label className="absolute bottom-0 right-0 bg-cyan-500 p-2 rounded-full cursor-pointer hover:bg-cyan-400 transition-all shadow-lg border-2 border-white/50">
                            <BiCamera size={20} className="text-white" />
                            <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                        </label>
                    </div>


                    <div className="w-full space-y-4">
                        <div className="flex gap-4">
                            <input
                                required
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                type="text"
                                placeholder="First Name"
                                className="w-1/2 p-4 rounded-xl bg-white/90 border-none focus:ring-4 focus:ring-cyan-400/50 transition-all outline-none text-gray-800 shadow-inner placeholder:text-gray-400"
                            />
                            <input
                                required
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                type="text"
                                placeholder="Last Name"
                                className="w-1/2 p-4 rounded-xl bg-white/90 border-none focus:ring-4 focus:ring-cyan-400/50 transition-all outline-none text-gray-800 shadow-inner placeholder:text-gray-400"
                            />
                        </div>

                        <input
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            type="email"
                            placeholder="Email Address"
                            className="w-full p-4 rounded-xl bg-white/90 border-none focus:ring-4 focus:ring-cyan-400/50 transition-all outline-none text-gray-800 shadow-inner placeholder:text-gray-400"
                        />

                        <input
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            type="password"
                            placeholder="Password"
                            className="w-full p-4 rounded-xl bg-white/90 border-none focus:ring-4 focus:ring-cyan-400/50 transition-all outline-none text-gray-800 shadow-inner placeholder:text-gray-400"
                        />

                        <input
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            type="password"
                            placeholder="Confirm Password"
                            className="w-full p-4 rounded-xl bg-white/90 border-none focus:ring-4 focus:ring-cyan-400/50 transition-all outline-none text-gray-800 shadow-inner placeholder:text-gray-400"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-cyan-500 hover:bg-cyan-400 text-white font-bold py-4 rounded-xl shadow-lg shadow-cyan-500/40 active:scale-[0.98] transition-all duration-300 mt-8"
                    >
                        {isLoading ? "Creating Account..." : "Join Now"}
                    </button>

                    <p className="text-white/70 mt-8 text-sm">
                        Already have an account? {" "}
                        <Link to="/login" className="text-cyan-400 font-bold hover:underline">
                            Login
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}