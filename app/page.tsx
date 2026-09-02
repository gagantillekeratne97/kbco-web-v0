"use client";
import { loginUser } from "@/lib/apis";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {    
  const router = useRouter(); // ← moved to top level, called once per render

  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [companyId, setCompanyId] = useState("001"); // default to a real option

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);    

  //Handling the login form 
  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await loginUser({ userName, password, companyId });      
      if (response.statusCode === 200) {
        sessionStorage.setItem("username", userName);
        router.push("/dashboard");
      } else {
        setError(response.message ?? "Login failed. Check your credentials.");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false); // ← guarantees loading resets whether login succeeds, fails, or throws
    }
  };          

  return (
    <main className="min-h-screen bg-[#EFEDE4] flex justify-center items-center p-4">

      <div className="font-body bg-white w-full max-w-[880px] min-h-[560px] shadow-xl rounded-2xl flex overflow-hidden">
        {/* left side: brand panel */}
        <div className="hidden md:flex md:w-[42%] relative bg-[#0B1F3A] text-[#F7F5EF] flex-col justify-between p-10 overflow-hidden">
          {/* growth-ring motif */}
          <svg
            className="absolute -right-24 -bottom-24 opacity-[0.18]"
            width="420"
            height="420"
            viewBox="0 0 420 420"
            fill="none"
          >
            {[40, 80, 120, 160, 200].map((r) => (
              <circle
                key={r}
                cx="210"
                cy="210"
                r={r}
                stroke="#E8722C"
                strokeWidth="1"
              />
            ))}
          </svg>

          <div className="relative z-10">
            <div className="flex items-center gap-2.5">
              <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
                <rect width="30" height="30" rx="7" fill="#E8722C" />
                <path
                  d="M9 20 L15 9 L21 20"
                  stroke="#0B1F3A"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
              <span className="font-display text-lg tracking-wide">KBCO</span>
              <span className="ml-1 text-[10px] font-body font-medium tracking-wider text-[#7C93B3] border border-[#2A4468] rounded px-1.5 py-0.5">
                WEB V.2
              </span>
            </div>
          </div>

          <div className="relative z-10 max-w-[280px]">
            <h1 className="font-display text-[28px] leading-[1.25] font-medium">
              Manage your fleet, without the paperwork.
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-[#C9D6E8]">
              Sign in to track rentals, monitor meter readings, and schedule
              service across every copier in your network.
            </p>
          </div>

          <p className="relative z-10 text-xs text-[#7C93B3]">
            © {new Date().getFullYear()} KBCO, Inc.
          </p>
        </div>

        {/* right side: login form */}
        <div className="flex-1 flex flex-col justify-center px-8 py-10 sm:px-14">
          <div className="w-full max-w-sm mx-auto">
            {/* compact brand mark for mobile, hidden on desktop since the left panel already shows it */}
            <div className="flex md:hidden items-center gap-2.5 mb-8">
              <svg width="26" height="26" viewBox="0 0 30 30" fill="none">
                <rect width="30" height="30" rx="7" fill="#0B1F3A" />
                <path
                  d="M9 20 L15 9 L21 20"
                  stroke="#E8722C"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
              <span className="font-display text-lg text-[#0B1F3A]">KBCO</span>
              <span className="ml-0.5 text-[10px] font-medium tracking-wider text-[#6B7280] border border-[#E4E1D8] rounded px-1.5 py-0.5">
                WEB V.2
              </span>
            </div>

            <h2 className="font-display text-2xl font-medium text-[#14201C]">
              Welcome back
            </h2>
            <p className="mt-1.5 text-sm text-[#6B7280]">
              Sign in to your account to continue.
            </p>

            <form className="mt-8 space-y-5" noValidate onSubmit={handleLogin}>
              <div>
                <label htmlFor="companyid" className="block text-sm font-medium text-[#14201C] mb-1.5">
                  Company
                </label>
                <select name="companyId" id="companyId" className={`w-full h-11 px-3.5 rounded-lg border bg-white text-sm text-[#14201C] placeholder:text-[#9CA3AF] outline-none transition-shadow focus:ring-2 focus:ring-[#E8722C]/40 focus:border-[#E8722C] ${
                    "border-[#E4E1D8]"
                  }`}>
                  <option value="001">Gestetner (P2P)</option>
                  <option value="003">Fintek (Doculine)</option>
                </select>                                                
              </div>
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-[#14201C] mb-1.5"
                >
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"                          
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Your username"                                    
                  className={`w-full h-11 px-3.5 rounded-lg border bg-white text-sm text-[#14201C] placeholder:text-[#9CA3AF] outline-none transition-shadow focus:ring-2 focus:ring-[#E8722C]/40 focus:border-[#E8722C] ${
                    "border-[#E4E1D8]"
                  }`}
                />                
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-[#14201C]"
                  >
                    Password
                  </label>
                  <a
                    href="#forgot-password"
                    className="text-xs font-medium text-[#0B1F3A] hover:text-[#E8722C] transition-colors"
                  >
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}                    
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    // aria-invalid={Boolean(errors.password)}
                    // aria-describedby={errors.password ? "password-error" : undefined}
                    className={`w-full h-11 px-3.5 pr-11 rounded-lg border bg-white text-sm text-[#14201C] placeholder:text-[#9CA3AF] outline-none transition-shadow focus:ring-2 focus:ring-[#E8722C]/40 focus:border-[#E8722C] border-[#E4E1D8]`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#14201C] transition-colors"
                  >
                    {showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M9.9 5.1A9.7 9.7 0 0112 5c5 0 9 4 10 7-1 1.6-2.6 3.4-4.6 4.6M6.1 6.6C4.2 7.8 2.7 9.5 2 11c1 3 5 7 10 7a9.7 9.7 0 002.9-.4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                </div>
                {/* {errors.password && (
                  <p id="password-error" className="mt-1.5 text-xs text-red-600">
                    {errors.password}
                  </p>
                )} */}
              </div>  

              <label className="flex items-center gap-2.5 text-sm text-[#374151] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded border-[#D1D5DB] text-[#0B1F3A] focus:ring-[#E8722C]/40"
                />
                Keep me signed in
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-lg bg-[#0B1F3A] text-white text-sm font-medium tracking-wide hover:bg-[#14315C] active:scale-[0.99] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form> 
          </div>
        </div>
      </div>
    </main>
  );
}