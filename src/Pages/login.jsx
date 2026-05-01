import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { GrGoogle } from "react-icons/gr";
import { useGoogleLogin } from "@react-oauth/google";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // --- Helper Function to Save User Session ---
  const saveUserSession = (data) => {
    // Backend එකෙන් දත්ත ලැබෙන්නේ res.data.user ලෙස හෝ සෘජුවම res.data ලෙස විය හැක.
    // එය නිවැරදිව හඳුනාගෙන ගබඩා කිරීම මෙහිදී සිදු වේ.
    const user = data.user || data; 
    const token = data.token;
    const role = data.role || user?.role;

    if (user && token) {
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("role", role);
      return role;
    }
    return null;
  };

  // Google Login Logic
  const GoogleLogin = useGoogleLogin({
    flow: "implicit",
    onSuccess: (response) => {
      setIsLoading(true);
      axios.post(import.meta.env.VITE_BACKEND_URL + "/users/google-login", {
        token: response.access_token,
      }).then((res) => {
        const role = saveUserSession(res.data);
        
        if (role) {
          toast.success("Welcome back to your journey!");
          role === "admin" ? navigate("/admin") : navigate("/");
          // UI එක refresh කිරීමට (Header update වීමට)
          window.location.reload();
        }
      }).catch((err) => {
        toast.error("Google Login Failed");
        console.error(err);
      }).finally(() => { setIsLoading(false); });
    },
    onError: () => { toast.error("Google Login Failed"); }
  });

  // Email validation: Gmail only
  const validateEmail = (emailValue) => {
    const gmailPattern = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!gmailPattern.test(emailValue)) {
      toast.error("Please enter a valid Gmail address (example@gmail.com)");
      return false;
    }
    return true;
  };

  // Manual Login Logic
  async function login(e) {
    if (e) e.preventDefault();
    
    if (!validateEmail(email)) {
      return;
    }
    
    setIsLoading(true);
    try {
      const res = await axios.post(import.meta.env.VITE_BACKEND_URL + "/users/login", {
        email,
        password,
      });

      const role = saveUserSession(res.data);

      if (role) {
        toast.success("Ready for your next adventure?");
        if (role === "admin") {
          navigate("/admin");
        } else {
          navigate("/");
        }
        // UI එක refresh කිරීමට (Header update වීමට)
        window.location.reload();
      } else {
        toast.error("Invalid user data received");
      }

    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full min-h-screen bg-[url('/travel-bg.jpg')] bg-center bg-cover bg-no-repeat flex items-center justify-center relative px-6">

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"></div>

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between w-full max-w-6xl gap-12">

        {/* Left Side: Brand Identity */}
        <div className="text-center md:text-left max-w-[550px]">
          <img src="/logo.png" alt="Travel Logo" className="w-40 mb-8 mx-auto md:mx-0 drop-shadow-2xl" />
          <h1 className="text-white font-bold text-5xl md:text-6xl leading-[1.1] drop-shadow-2xl" style={{ fontFamily: "'Playfair Display', serif" }}>
            Explore the <span className="italic text-[#C8813A]">World</span> <br />
            with Ease.
          </h1>
          <p className="mt-6 text-gray-200 text-xl font-light tracking-wide italic drop-shadow-md">
            "Your journey of a thousand miles begins with a single click."
          </p>
        </div>

        {/* Right Side: Glassmorphism Login Form */}
        <form onSubmit={login} className="w-full max-w-[420px] bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-10 flex flex-col items-center">
          <h2 className="text-3xl font-bold text-white mb-2 self-start" style={{ fontFamily: "'Playfair Display', serif" }}>Sign In</h2>
          <p className="text-white/60 text-sm mb-8 self-start">Welcome back! Please enter your details.</p>

          <div className="w-full space-y-4">
            <input
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="Email Address"
              className="w-full p-4 rounded-xl bg-white/90 border-none focus:ring-4 focus:ring-[#C8813A]/50 transition-all duration-500 outline-none text-gray-800 shadow-inner"
            />

            <input
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="Password"
              className="w-full p-4 rounded-xl bg-white/90 border-none focus:ring-4 focus:ring-[#C8813A]/50 transition-all duration-500 outline-none text-gray-800 shadow-inner"
            />
          </div>

          <div className="w-full flex justify-end mt-3 mb-6">
            <Link to="/forget-password" className="text-white/80 text-sm hover:text-[#C8813A] transition-colors duration-500 italic">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#C8813A] hover:bg-[#A66A28] text-white font-bold py-4 rounded-full shadow-lg shadow-[#C8813A]/40 active:scale-[0.98] transition-all duration-500 uppercase text-[11px] tracking-widest"
          >
            {isLoading ? "Authenticating..." : "Sign In"}
          </button>

          {/* Divider */}
          <div className="w-full flex items-center gap-3 my-6">
            <div className="h-[1px] bg-white/20 flex-1"></div>
            <span className="text-white/40 text-xs uppercase tracking-widest">or</span>
            <div className="h-[1px] bg-white/20 flex-1"></div>
          </div>

          {/* Google Login Button */}
          <button
            onClick={() => GoogleLogin()}
            type="button"
            className="w-full flex items-center justify-center gap-3 bg-white text-gray-700 py-3.5 rounded-full hover:bg-gray-100 transition-all duration-500 font-semibold shadow-md active:scale-[0.98] uppercase text-[11px] tracking-widest"
          >
            <GrGoogle className="text-xl text-red-500" />
            Sign in with Google
          </button>

          <p className="text-white/70 mt-8 text-sm">
            Not a member?{" "}
            <Link to="/register" className="text-[#C8813A] font-bold hover:underline">
              Join for Free
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}