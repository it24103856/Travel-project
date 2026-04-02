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
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [interests, setInterests] = useState([]); // New state for interests
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const [imageFile, setImageFile] = useState(null);
    const [preview, setPreview] = useState(null);

    // Travel categories
    const categories = ["Adventure", "Beach", "Hiking", "Cultural", "Wildlife", "Luxury"];

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setPreview(URL.createObjectURL(file));
        }
    }

    const toggleInterest = (cat) => {
        setInterests(prev => 
            prev.includes(cat) ? prev.filter(i => i !== cat) : [...prev, cat]
        );
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
        if (!firstName || !lastName || !email || !password || !confirmPassword || !address || !phone) {
            toast.error("All fields are required");
            return;
        }

        setIsLoading(true);
        try {
            let imageUrl = "/default-profile.png";

            if (imageFile) {
                const uploadToast = toast.loading("Uploading image...");
                try {
                    const uploadedUrl = await uploadFile(imageFile);
                    if (uploadedUrl) {
                        imageUrl = uploadedUrl;
                        toast.success("Image uploaded!", { id: uploadToast });
                    }
                } catch (uploadErr) {
                    toast.error("Image upload failed!", { id: uploadToast });
                }
            }

            await axios.post(import.meta.env.VITE_BACKEND_URL + "/users/create", {
                firstName,
                lastName,
                email,
                password,
                image: imageUrl,
                address,
                phone,
                interests // Added to request body
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

            <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"></div>

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between w-full max-w-6xl gap-12">

                {/* Left Side */}
                <div className="text-center md:text-left max-w-[550px]">
                    <img src="/logo.png" alt="Travel Logo" className="w-40 mb-8 mx-auto md:mx-0 drop-shadow-2xl" />
                    <h1 className="text-white font-bold text-5xl md:text-6xl leading-[1.1] drop-shadow-2xl" style={{ fontFamily: "'Playfair Display', serif" }}>
                        Start Your <br />
                        <span className="italic text-[#00AEEF]">Adventure</span> Today.
                    </h1>
                    <p className="mt-6 text-gray-200 text-xl font-light tracking-wide italic drop-shadow-md">
                        "Join our community of world travelers and discover hidden gems."
                    </p>
                </div>

                {/* Right Side: Form */}
                <form onSubmit={HandleRegister} className="w-full max-w-[480px] bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-10 flex flex-col items-center">
                    <h2 className="text-3xl font-bold text-white mb-2 self-start" style={{ fontFamily: "'Playfair Display', serif" }}>Create Account</h2>
                    <p className="text-white/60 text-sm mb-8 self-start">Sign up to get started on your journey.</p>

                    <div className="relative mb-8 group">
                        <div className="w-24 h-24 rounded-full border-4 border-[#00AEEF] overflow-hidden bg-white/20 shadow-xl">
                            {preview ? (
                                <img src={preview} alt="preview" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-white/40 text-[10px] text-center p-2 uppercase">
                                    Upload Photo
                                </div>
                            )}
                        </div>
                        <label className="absolute bottom-0 right-0 bg-[#00AEEF] p-2 rounded-full cursor-pointer hover:bg-[#0096CE] transition-all duration-500 shadow-lg border-2 border-white/50">
                            <BiCamera size={20} className="text-white" />
                            <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                        </label>
                    </div>

                    <div className="w-full space-y-4">
                        <div className="flex gap-4">
                            <input required value={firstName} onChange={(e) => setFirstName(e.target.value)} type="text" placeholder="First Name" className="input-field w-1/2" />
                            <input required value={lastName} onChange={(e) => setLastName(e.target.value)} type="text" placeholder="Last Name" className="input-field w-1/2" />
                        </div>
                        <input required value={phone} onChange={(e) => setPhone(e.target.value)} type="number" placeholder="Phone Number" className="input-field w-full" />
                        <input required value={address} onChange={(e) => setAddress(e.target.value)} type="text" placeholder="Address" className="input-field w-full" />
                        <input required value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email Address" className="input-field w-full" />
                        <input required value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" className="input-field w-full" />
                        <input required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} type="password" placeholder="Confirm Password" className="input-field w-full" />

                        {/* Travel Interests (Added under Confirm Password) */}
                        <div className="pt-2">
                            <p className="text-white/70 text-xs mb-3 uppercase tracking-wider font-semibold">Select Your Interests:</p>
                            <div className="flex flex-wrap gap-2">
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        type="button"
                                        onClick={() => toggleInterest(cat)}
                                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all duration-300 border ${
                                            interests.includes(cat) 
                                            ? "bg-[#00AEEF] border-[#00AEEF] text-white shadow-md" 
                                            : "bg-white/10 border-white/10 text-white/50 hover:border-white/30"
                                        }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-[#00AEEF] hover:bg-[#0096CE] text-white font-bold py-4 rounded-full shadow-lg shadow-[#00AEEF]/40 active:scale-[0.98] transition-all duration-500 mt-8 uppercase text-[11px] tracking-widest"
                    >
                        {isLoading ? "Creating Account..." : "Join Now"}
                    </button>

                    <p className="text-white/70 mt-8 text-sm">
                        Already have an account?{" "}
                        <Link to="/login" className="text-[#00AEEF] font-bold hover:underline">
                            Login
                        </Link>
                    </p>
                </form>
            </div>

            {/* In-component Styles for reusability */}
            <style dangerouslySetInnerHTML={{ __html: `
                .input-field {
                    padding: 1rem;
                    border-radius: 0.75rem;
                    background: rgba(255, 255, 255, 0.9);
                    border: none;
                    outline: none;
                    color: #1f2937;
                    transition: all 0.5s;
                }
                .input-field:focus {
                    box-shadow: 0 0 0 4px rgba(0, 174, 239, 0.5);
                }
                .input-field::placeholder {
                    color: #9ca3af;
                }
            `}} />
        </div>
    );
}