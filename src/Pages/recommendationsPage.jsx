import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import {
    FaMapMarkerAlt, FaClock, FaLeaf, FaStar,
    FaShieldAlt, FaCheckCircle, FaRobot, FaChevronDown
} from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";

// ── Constants matching Package.js enums ──────────────────────────────────────

const CATEGORIES = [
    { value: "adventure",   label: "Adventure" },
    { value: "wildlife",    label: "Wildlife" },
    { value: "historical",  label: "Historical" },
    { value: "cultural",    label: "Cultural" },
    { value: "beach",       label: "Beach" },
    { value: "wellness",    label: "Wellness" },
    { value: "eco",         label: "Eco / Nature" },
    { value: "family",      label: "Family" },
];

const WEATHER_OPTIONS = [
    { value: "sunny",    label: "☀️ Sunny & warm" },
    { value: "tropical", label: "🌴 Tropical" },
    { value: "humid",    label: "💧 Humid" },
    { value: "cool",     label: "❄️ Cool & crisp" },
    { value: "dry",      label: "🏜️ Hot & dry" },
    { value: "rainy",    label: "🌧️ Rainy" },
];

const LOCATIONS = [
    "Colombo", "Kandy", "Galle", "Jaffna", "Anuradhapura",
    "Polonnaruwa", "Sigiriya", "Ella", "Nuwara Eliya", "Trincomalee",
    "Batticaloa", "Hambantota", "Mirissa", "Hikkaduwa", "Arugam Bay",
    "Yala", "Wilpattu", "Udawalawe", "Dambulla", "Matara",
    "Bentota", "Negombo", "Ratnapura", "Badulla", "Ampara",
    "Multi-location",
];

// ── Main Page ─────────────────────────────────────────────────────────────────

const AIRecommendationsPage = () => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    // Form state
    const [form, setForm] = useState({
        budget:      "",
        duration:    "",
        adults:      1,
        children:    0,
        categories:  [],
        weather:     [],
        location:    "",
    });

    // UI state
    const [results, setResults]   = useState(null);
    const [loading, setLoading]   = useState(false);
    const [error, setError]       = useState(null);
    const [errors, setErrors]     = useState({});

    const set = (field) => (e) =>
        setForm((f) => ({ ...f, [field]: e.target.value }));

    const toggleMulti = (field, value) => {
        setForm((f) => ({
            ...f,
            [field]: f[field].includes(value)
                ? f[field].filter((v) => v !== value)
                : [...f[field], value],
        }));
    };

    const validate = () => {
        const e = {};
        if (!form.budget || Number(form.budget) < 1)
            e.budget = "Enter a valid budget";
        if (!form.duration || Number(form.duration) < 1)
            e.duration = "Enter number of days";
        if (!form.adults || Number(form.adults) < 1)
            e.adults = "At least 1 adult required";
        return e;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setErrors({});
        setLoading(true);
        setError(null);
        setResults(null);

        try {
            const payload = {
                budget:      parseFloat(form.budget),
                duration:    parseInt(form.duration),
                adults:      parseInt(form.adults),
                children:    parseInt(form.children) || 0,
                categories:  form.categories,
                weather:     form.weather,
                location:    form.location,
                interests:   [], // will be populated from user profile in Phase 2
            };

            const response = await axios.post(`${backendUrl}/recommend`, payload);
            setResults(response.data.results || []);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Something went wrong. Make sure both servers are running."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setForm({
            budget: "", duration: "", adults: 1, children: 0,
            categories: [], weather: [], travel_mode: "", location: "",
        });
        setResults(null);
        setError(null);
        setErrors({});
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <main
            className="w-full min-h-screen bg-white pt-10"
            style={{ fontFamily: "'Poppins', sans-serif" }}
        >
            {/* ── HERO ── */}
            <section
                className="relative h-[50vh] md:h-[55vh] flex items-center justify-center bg-fixed bg-center bg-cover"
                style={{
                    backgroundImage:
                        "url('https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1600&q=80')",
                }}
            >
                <div className="absolute inset-0 bg-black/55" />
                <div className="relative z-10 text-center text-white px-6">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <FaRobot className="text-amber-400 text-3xl" />
                        <span className="text-amber-400 font-black text-xs uppercase tracking-[0.3em]">
                            AI Powered
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight">
                        Find Your{" "}
                        <span className="text-amber-400">Perfect Trip</span>
                    </h1>
                    <p className="mt-3 text-sm md:text-xl font-light max-w-2xl mx-auto italic opacity-90">
                        "Tell us what you love — we'll match the best Sri Lankan packages for you."
                    </p>
                </div>
            </section>

            {/* ── TRUST BADGES ── */}
            <section className="bg-gray-50 border-b border-gray-100 py-8 overflow-x-auto no-scrollbar">
                <div className="flex md:grid md:grid-cols-3 gap-8 px-6 min-w-max md:min-w-0 md:max-w-7xl mx-auto">
                    <Badge icon={<FaRobot />}       text="Cosine Similarity Matching" />
                    <Badge icon={<FaShieldAlt />}   text="Budget Filtered Results" />
                    <Badge icon={<FaCheckCircle />} text="Personalised For You" />
                </div>
            </section>

            {/* ── PREFERENCE FORM ── */}
            <section className="max-w-4xl mx-auto px-4 mt-14 mb-4">
                <h2 className="text-3xl md:text-5xl font-black text-slate-900 text-center mb-2 tracking-tight">
                    Set Your Preferences
                </h2>
                <p className="text-center text-gray-400 text-sm mb-10 font-medium">
                    Fill in the details below and let our AI find the best matches.
                </p>

                <form onSubmit={handleSubmit} noValidate>
                    <div className="bg-gray-50 rounded-[2rem] p-8 md:p-10 space-y-8 border border-gray-100 shadow-sm">

                        {/* ── Row 1: Budget, Duration ── */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormGroup label="Total Budget (LKR)" error={errors.budget}>
                                <input
                                    type="number" min="1" placeholder="e.g. 50000"
                                    value={form.budget} onChange={set("budget")}
                                    className={inputCls(errors.budget)}
                                />
                            </FormGroup>
                            <FormGroup label="Tour Duration (days)" error={errors.duration}>
                                <input
                                    type="number" min="1" max="30" placeholder="e.g. 5"
                                    value={form.duration} onChange={set("duration")}
                                    className={inputCls(errors.duration)}
                                />
                            </FormGroup>
                        </div>

                        {/* ── Row 2: Adults, Children ── */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormGroup label="Number of Adults" error={errors.adults}>
                                <input
                                    type="number" min="1" max="30" placeholder="e.g. 2"
                                    value={form.adults} onChange={set("adults")}
                                    className={inputCls(errors.adults)}
                                />
                            </FormGroup>
                            <FormGroup label="Number of Children (optional)">
                                <input
                                    type="number" min="0" max="20" placeholder="e.g. 1"
                                    value={form.children} onChange={set("children")}
                                    className={inputCls()}
                                />
                            </FormGroup>
                        </div>

                        {/* ── Row 3: Location ── */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormGroup label="Preferred Location">
                                <div className="relative">
                                    <select
                                        value={form.location} onChange={set("location")}
                                        className={selectCls()}
                                    >
                                        <option value="">Anywhere in Sri Lanka</option>
                                        {LOCATIONS.map((l) => (
                                            <option key={l} value={l}>{l}</option>
                                        ))}
                                    </select>
                                    <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-[10px] pointer-events-none" />
                                </div>
                            </FormGroup>
                            
                        </div>

                        {/* ── Categories (multi-select chips) ── */}
                        <FormGroup label="Preferred Categories">
                            <p className="text-[11px] text-gray-400 mb-3 font-medium">
                                Select all that apply
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {CATEGORIES.map(({ value, label }) => (
                                    <Chip
                                        key={value}
                                        label={label}
                                        active={form.categories.includes(value)}
                                        onClick={() => toggleMulti("categories", value)}
                                    />
                                ))}
                            </div>
                        </FormGroup>

                        {/* ── Weather (multi-select chips) ── */}
                        <FormGroup label="Preferred Weather">
                            <p className="text-[11px] text-gray-400 mb-3 font-medium">
                                Select all that apply
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {WEATHER_OPTIONS.map(({ value, label }) => (
                                    <Chip
                                        key={value}
                                        label={label}
                                        active={form.weather.includes(value)}
                                        onClick={() => toggleMulti("weather", value)}
                                    />
                                ))}
                            </div>
                        </FormGroup>

                        {/* ── Actions ── */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-slate-900 text-white py-4 rounded-full font-black text-sm hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                        Finding matches...
                                    </>
                                ) : (
                                    <>
                                        <FaRobot className="text-amber-400" />
                                        Get AI Recommendations
                                    </>
                                )}
                            </button>
                            {results !== null && (
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="sm:w-auto px-8 py-4 rounded-full font-black text-sm border-2 border-gray-200 text-gray-500 hover:border-gray-400 transition-all"
                                >
                                    Reset
                                </button>
                            )}
                        </div>
                    </div>
                </form>
            </section>

            {/* ── ERROR ── */}
            {error && (
                <div className="max-w-4xl mx-auto px-4 mb-6">
                    <div className="bg-red-50 border border-red-200 text-red-600 rounded-2xl px-6 py-4 text-sm font-medium">
                        ⚠️ {error}
                    </div>
                </div>
            )}

            {/* ── RESULTS ── */}
            {results !== null && !loading && (
                <section className="max-w-7xl mx-auto py-10 px-4 md:px-6">
                    <div className="flex items-end justify-between mb-8">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-black text-gray-900 leading-none">
                                AI{" "}
                                <span className="text-amber-500">Recommendations</span>
                            </h2>
                            <div className="w-16 h-1 bg-amber-500 mt-3 rounded-full" />
                        </div>
                        <p className="text-gray-400 text-xs font-medium italic hidden md:block">
                            {results.length} package{results.length !== 1 ? "s" : ""} matched
                        </p>
                    </div>

                    {results.length === 0 ? (
                        <EmptyState />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-7">
                            {results.map((pkg, i) => (
                                <RecommendedCard key={pkg.id || pkg._id} pkg={pkg} index={i} />
                            ))}
                        </div>
                    )}
                </section>
            )}

            {/* ── BOTTOM CTA ── */}
            <section className="bg-[#0b223a] py-16 px-6 rounded-[3rem] md:rounded-[4rem] mx-4 md:mx-6 mb-16 mt-10 text-center relative overflow-hidden shadow-2xl">
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl" />
                <div className="relative z-10">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 italic">
                        Can't find the right trip?
                    </h2>
                    <p className="text-blue-200 text-sm md:text-base mb-10 max-w-xs md:max-w-lg mx-auto opacity-80 font-medium">
                        Our travel experts will craft a personalised Sri Lankan itinerary just for you.
                    </p>
                    <Link
                        to="/contact"
                        className="inline-block bg-[#f3c26b] text-[#1c3d58] px-10 py-4 rounded-full font-black text-[11px] uppercase tracking-widest shadow-2xl hover:scale-105 transition-transform"
                    >
                        Get in Touch
                    </Link>
                </div>
            </section>

            <Footer />
        </main>
    );
};

// ── Recommended Package Card (with match score badge) ─────────────────────────
const RecommendedCard = ({ pkg, index }) => {
    const scoreColor =
        pkg.match_score >= 70 ? "bg-green-500" :
        pkg.match_score >= 40 ? "bg-amber-500" : "bg-gray-400";

    return (
        <div
            className="group bg-white rounded-t-[2.5rem] rounded-b-2xl border border-gray-100 shadow-[0_2px_15px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_35px_rgba(0,0,0,0.12)] hover:scale-[1.03] transition-all duration-500 overflow-hidden"
            style={{
                fontFamily: "'Poppins', sans-serif",
                animationDelay: `${index * 80}ms`
            }}
        >
            {/* Image */}
            <div className="relative h-52 overflow-hidden">
                <img
                    src={
                        pkg.gallery?.[0] ||
                        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4"
                    }
                    alt={pkg.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />

                {/* Match score badge */}
                <div className={`absolute top-3.5 left-3.5 ${scoreColor} text-white rounded-full px-3 py-1.5 flex flex-col items-center shadow-lg z-10`}>
                    <span className="text-[11px] font-black leading-none">
                        {pkg.match_score}%
                    </span>
                    <span className="text-[8px] font-medium opacity-80 leading-none mt-0.5">
                        match
                    </span>
                </div>

                {/* Price badge */}
                <div className="absolute top-3.5 right-3.5 w-[4.2rem] h-[4.2rem] rounded-full bg-white/50 backdrop-blur-lg border border-white/30 shadow-lg flex flex-col items-center justify-center z-10">
                    <span className="text-[8px] text-gray-400 font-medium leading-none">LKR</span>
                    <span className="text-[11px] font-bold text-gray-800 leading-tight mt-0.5">
                        {pkg.price?.toLocaleString()}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="bg-white px-5 py-5 text-center">
                <h3 className="text-[1.05rem] font-bold text-gray-800 mb-1 leading-snug">
                    {pkg.title}
                </h3>
                <p className="text-[11px] text-gray-400 mb-1 font-medium">
                    {pkg.location} · {pkg.no_of_days} days
                </p>
                {/* Total cost for group */}
                <p className="text-[11px] text-amber-600 font-bold mb-3">
                    LKR {pkg.total_cost?.toLocaleString()} total
                </p>
                {/* Categories */}
                {pkg.categories?.length > 0 && (
                    <div className="flex flex-wrap gap-1 justify-center mb-4">
                        {pkg.categories.slice(0, 2).map((cat) => (
                            <span
                                key={cat}
                                className="text-[9px] font-bold uppercase tracking-wider bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full border border-amber-200"
                            >
                                {cat}
                            </span>
                        ))}
                    </div>
                )}
                <Link
                    to={`/package-details/${pkg.id || pkg._id}`}
                    className="inline-flex items-center gap-1.5 text-[#C8813A] font-semibold text-sm hover:text-[#A66A28] hover:gap-3 transition-all duration-300"
                >
                    View Details <span className="text-base">→</span>
                </Link>
            </div>
        </div>
    );
};

// ── Reusable components ───────────────────────────────────────────────────────

const Chip = ({ label, active, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wide border-2 transition-all duration-200 ${
            active
                ? "bg-slate-900 border-slate-900 text-white scale-[1.04]"
                : "bg-white border-gray-200 text-gray-500 hover:border-slate-400"
        }`}
    >
        {label}
    </button>
);

const FormGroup = ({ label, error, children }) => (
    <div className="flex flex-col gap-2">
        <label className="text-xs font-black uppercase tracking-widest text-slate-700">
            {label}
        </label>
        {children}
        {error && (
            <p className="text-red-500 text-[11px] font-medium">{error}</p>
        )}
    </div>
);

const Badge = ({ icon, text }) => (
    <div className="flex items-center gap-3 justify-center px-6">
        <div className="text-amber-500 text-2xl">{icon}</div>
        <span className="font-extrabold text-gray-800 uppercase tracking-tighter text-[10px] whitespace-nowrap">
            {text}
        </span>
    </div>
);

const EmptyState = () => (
    <div className="col-span-full text-center py-20 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200 mx-4">
        <FaRobot className="mx-auto text-4xl text-gray-300 mb-3" />
        <p className="text-gray-400 text-sm font-bold italic">
            No packages matched your preferences. Try adjusting your budget or filters.
        </p>
    </div>
);

// ── Style helpers ─────────────────────────────────────────────────────────────
const inputCls = (err) =>
    `w-full appearance-none bg-white border-2 ${
        err ? "border-red-300" : "border-gray-200"
    } text-slate-700 font-medium text-sm px-5 py-3.5 rounded-full outline-none hover:border-slate-400 focus:border-slate-700 transition-all`;

const selectCls = (err) =>
    `w-full appearance-none bg-white border-2 ${
        err ? "border-red-300" : "border-gray-200"
    } text-slate-700 font-black text-xs uppercase tracking-wide px-5 py-3.5 pr-8 rounded-full outline-none cursor-pointer hover:border-slate-400 focus:border-slate-700 transition-all`;

export default AIRecommendationsPage;