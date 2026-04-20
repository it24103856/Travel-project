import { toast } from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';
import { uploadFile } from '../utils/meadiaUpload';
import { BiCamera } from "react-icons/bi";

// ── Interest definitions with emoji icons ──────────────────────────────────
const INTERESTS = [
    { id: "hiking",              label: "Hiking",              emoji: "🥾" },
    { id: "surfing",             label: "Surfing",             emoji: "🏄" },
    { id: "nature_photography",  label: "Nature Photography",  emoji: "📷" },
    { id: "wildlife_spotting",   label: "Wildlife Spotting",   emoji: "🦁" },
    { id: "camping",             label: "Camping",             emoji: "⛺" },
    { id: "diving",              label: "Diving",              emoji: "🤿" },
    { id: "paddling_boats",      label: "Paddling Boats",      emoji: "🚣" },
    { id: "stargazing",          label: "Stargazing",          emoji: "🔭" },
    { id: "cycling",             label: "Cycling",             emoji: "🚴" },
    { id: "rock_climbing",       label: "Rock Climbing",       emoji: "🧗" },
    { id: "bird_watching",       label: "Bird Watching",       emoji: "🦜" },
    { id: "cultural_tours",      label: "Cultural Tours",      emoji: "🏛️" },
];

export default function RegisterPage() {
    const [firstName, setFirstName]           = useState('');
    const [lastName, setLastName]             = useState('');
    const [email, setEmail]                   = useState('');
    const [password, setPassword]             = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [address, setAddress]               = useState('');
    const [phone, setPhone]                   = useState('');
    const [interests, setInterests]           = useState([]);
    const [isLoading, setIsLoading]           = useState(false);
    const [imageFile, setImageFile]           = useState(null);
    const [preview, setPreview]               = useState(null);

    const navigate = useNavigate();

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const toggleInterest = (id) => {
        setInterests(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    async function HandleRegister(e) {
        if (e) e.preventDefault();

        if (password !== confirmPassword) { toast.error("Passwords do not match"); return; }
        if (password.length < 6)          { toast.error("Password must be at least 6 characters"); return; }
        if (!firstName || !lastName || !email || !password || !address || !phone) {
            toast.error("All fields are required"); return;
        }

        setIsLoading(true);
        try {
            let imageUrl = "/default-profile.png";
            if (imageFile) {
                const t = toast.loading("Uploading image...");
                try {
                    const url = await uploadFile(imageFile);
                    if (url) { imageUrl = url; toast.success("Image uploaded!", { id: t }); }
                } catch { toast.error("Image upload failed!", { id: t }); }
            }

            await axios.post(import.meta.env.VITE_BACKEND_URL + "/users/create", {
                firstName, lastName, email, password,
                image: imageUrl, address, phone,
                interests, // array of interest IDs e.g. ["hiking", "diving"]
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

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between w-full max-w-6xl gap-12">

                {/* ── Left branding ── */}
                <div className="text-center md:text-left max-w-[550px]">
                    <img src="/logo.png" alt="Logo" className="w-40 mb-8 mx-auto md:mx-0 drop-shadow-2xl" />
                    <h1 className="text-white font-bold text-5xl md:text-6xl leading-[1.1] drop-shadow-2xl"
                        style={{ fontFamily: "'Playfair Display', serif" }}>
                        Start Your <br />
                        <span className="italic text-[#C8813A]">Adventure</span> Today.
                    </h1>
                    <p className="mt-6 text-gray-200 text-xl font-light tracking-wide italic drop-shadow-md">
                        "Join our community of world travelers and discover hidden gems."
                    </p>
                </div>

                {/* ── Right form ── */}
                <form
                    onSubmit={HandleRegister}
                    className="w-full max-w-[520px] bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-10 flex flex-col items-center"
                >
                    <h2 className="text-3xl font-bold text-white mb-1 self-start"
                        style={{ fontFamily: "'Playfair Display', serif" }}>
                        Create Account
                    </h2>
                    <p className="text-white/60 text-sm mb-8 self-start">
                        Sign up to get started on your journey.
                    </p>

                    {/* Profile photo */}
                    <div className="relative mb-8 group">
                        <div className="w-24 h-24 rounded-full border-4 border-[#C8813A] overflow-hidden bg-white/20 shadow-xl">
                            {preview
                                ? <img src={preview} alt="preview" className="w-full h-full object-cover" />
                                : <div className="w-full h-full flex items-center justify-center text-white/40 text-[10px] text-center p-2 uppercase">Upload Photo</div>
                            }
                        </div>
                        <label className="absolute bottom-0 right-0 bg-[#C8813A] p-2 rounded-full cursor-pointer hover:bg-[#A66A28] transition-all duration-500 shadow-lg border-2 border-white/50">
                            <BiCamera size={20} className="text-white" />
                            <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                        </label>
                    </div>

                    {/* Basic fields */}
                    <div className="w-full space-y-4">
                        <div className="flex gap-4">
                            <input required value={firstName} onChange={e => setFirstName(e.target.value)}
                                type="text" placeholder="First Name" className="input-field w-1/2" />
                            <input required value={lastName} onChange={e => setLastName(e.target.value)}
                                type="text" placeholder="Last Name" className="input-field w-1/2" />
                        </div>
                        <input required value={phone} onChange={e => setPhone(e.target.value)}
                            type="number" placeholder="Phone Number" className="input-field w-full" />
                        <input required value={address} onChange={e => setAddress(e.target.value)}
                            type="text" placeholder="Address" className="input-field w-full" />
                        <input required value={email} onChange={e => setEmail(e.target.value)}
                            type="email" placeholder="Email Address" className="input-field w-full" />
                        <input required value={password} onChange={e => setPassword(e.target.value)}
                            type="password" placeholder="Password" className="input-field w-full" />
                        <input required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                            type="password" placeholder="Confirm Password" className="input-field w-full" />

                        {/* ── Interests ── */}
                        <div className="pt-3">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <p className="text-white font-semibold text-sm">
                                        What are your travel interests?
                                    </p>
                                    <p className="text-white/50 text-[11px] mt-0.5">
                                        Select all that apply — we'll personalise your recommendations.
                                    </p>
                                </div>
                                {interests.length > 0 && (
                                    <span className="bg-[#C8813A] text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0">
                                        {interests.length} selected
                                    </span>
                                )}
                            </div>

                            {/* Interest grid */}
                            <div className="grid grid-cols-3 gap-2">
                                {INTERESTS.map(({ id, label, emoji }) => {
                                    const selected = interests.includes(id);
                                    return (
                                        <button
                                            key={id}
                                            type="button"
                                            onClick={() => toggleInterest(id)}
                                            className={`
                                                relative flex flex-col items-center justify-center gap-1.5
                                                px-2 py-3 rounded-2xl text-center
                                                border transition-all duration-300 select-none
                                                ${selected
                                                    ? "bg-[#C8813A] border-[#C8813A] shadow-lg shadow-[#C8813A]/30 scale-[1.04]"
                                                    : "bg-white/8 border-white/15 hover:border-white/35 hover:bg-white/15"
                                                }
                                            `}
                                        >
                                            {/* Tick badge */}
                                            {selected && (
                                                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-white rounded-full flex items-center justify-center">
                                                    <svg className="w-2.5 h-2.5 text-[#C8813A]" fill="none" viewBox="0 0 12 12">
                                                        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                    </svg>
                                                </span>
                                            )}
                                            <span className="text-2xl leading-none">{emoji}</span>
                                            <span className={`text-[10px] font-semibold leading-tight ${selected ? "text-white" : "text-white/60"}`}>
                                                {label}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Optional hint */}
                            <p className="text-white/30 text-[10px] text-center mt-3 italic">
                                You can always update these later in your profile.
                            </p>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-[#C8813A] hover:bg-[#A66A28] text-white font-bold py-4 rounded-full shadow-lg shadow-[#C8813A]/40 active:scale-[0.98] transition-all duration-500 mt-8 uppercase text-[11px] tracking-widest disabled:opacity-60"
                    >
                        {isLoading ? "Creating Account..." : "Join Now"}
                    </button>

                    <p className="text-white/70 mt-8 text-sm">
                        Already have an account?{" "}
                        <Link to="/login" className="text-[#C8813A] font-bold hover:underline">Login</Link>
                    </p>
                </form>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .input-field {
                    padding: 1rem;
                    border-radius: 0.75rem;
                    background: rgba(255,255,255,0.9);
                    border: none;
                    outline: none;
                    color: #1f2937;
                    transition: all 0.5s;
                    width: 100%;
                }
                .input-field:focus  { box-shadow: 0 0 0 4px rgba(200,129,58,0.5); }
                .input-field::placeholder { color: #9ca3af; }
            `}} />
        </div>
    );
}