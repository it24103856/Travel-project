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

  // Google Login Logic
  const GoogleLogin = useGoogleLogin({
    flow: "implicit",
    onSuccess: (response) => {
      setIsLoading(true);
      axios.post(import.meta.env.VITE_BACKEND_URL + "/users/google-login", {
        token: response.access_token,
      }).then((res) => {
        localStorage.setItem("token", res.data.token);
        res.data.role === "admin" ? navigate("/admin") : navigate("/");
        toast.success("Welcome back to your journey!");
      }).catch((err) => {
        toast.error("Google Login Failed");
        console.error(err);
      }).finally(() => { setIsLoading(false); });
    },
    onError: () => { toast.error("Google Login Failed"); }
  });

  // Manual Login Logic
async function login(e) {
  if (e) e.preventDefault();
  setIsLoading(true); 
  try {
    const res = await axios.post(import.meta.env.VITE_BACKEND_URL + "/users/login", {
      email,
      password,
    });

    localStorage.setItem("token", res.data.token);
    
    //  check user role form backend
    console.log("Logged in user role:", res.data.role);
localStorage.setItem("token", res.data.token);
localStorage.setItem("role", res.data.role);
    if (res.data.role === "admin") {
      navigate("/admin");
    } else {
      navigate("/"); // customer navigate to home page
    }
    
    toast.success("Ready for your next adventure?");
  } catch (err) {
    toast.error(err.response?.data?.message || "Login failed");
  } finally {
    setIsLoading(false);
  }
}
  return (
    
    <div className="w-full min-h-screen bg-[url('/travel-bg.jpg')] bg-center bg-cover bg-no-repeat flex items-center justify-center relative px-6">
      
      {/* Dark Overlay for better readability */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"></div>

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between w-full max-w-6xl gap-12">
        
        {/* Left Side: Brand Identity */}
        <div className="text-center md:text-left max-w-[550px]">
          {/* Logo Path '/logo.png'  */}
          <img src="/logo.png" alt="Travel Logo" className="w-40 mb-8 mx-auto md:mx-0 drop-shadow-2xl" />
          <h1 className="text-white font-extrabold text-5xl md:text-6xl leading-[1.1] drop-shadow-2xl">
            Explore the <span className="text-cyan-400">World</span> <br /> 
            with Ease.
          </h1>
          <p className="mt-6 text-gray-100 text-xl font-light tracking-wide italic drop-shadow-md">
            "Your journey of a thousand miles begins with a single click."
          </p>
        </div>

        {/* Right Side: Glassmorphism Login Form */}
        <form onSubmit={login} className="w-full max-w-[420px] bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-10 flex flex-col items-center">
          <h2 className="text-3xl font-bold text-white mb-2 self-start">Sign In</h2>
          <p className="text-white/60 text-sm mb-8 self-start">Welcome back! Please enter your details.</p>

          <div className="w-full space-y-4">
            <input
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="Email Address"
              className="w-full p-4 rounded-xl bg-white/90 border-none focus:ring-4 focus:ring-cyan-400/50 transition-all outline-none text-gray-800 shadow-inner"
            />

            <input
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="Password"
              className="w-full p-4 rounded-xl bg-white/90 border-none focus:ring-4 focus:ring-cyan-400/50 transition-all outline-none text-gray-800 shadow-inner"
            />
          </div>

          <div className="w-full flex justify-end mt-3 mb-6">
            <Link to="/forget-password"  className="text-white/80 text-sm hover:text-cyan-400 transition-colors italic">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-cyan-500 hover:bg-cyan-400 text-white font-bold py-4 rounded-xl shadow-lg shadow-cyan-500/40 active:scale-[0.98] transition-all duration-300"
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
            className="w-full flex items-center justify-center gap-3 bg-white text-gray-700 py-3.5 rounded-xl hover:bg-gray-100 transition-all font-semibold shadow-md active:scale-[0.98]"
          >
            <GrGoogle className="text-xl text-red-500" />
            Sign in with Google
          </button>

          <p className="text-white/70 mt-8 text-sm">
            Not a member? {" "}
            <Link to="/register" className="text-cyan-400 font-bold hover:underline">
              Join for Free
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}