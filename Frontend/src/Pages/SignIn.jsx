import React, { useContext, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import bg from "../assets/authBg.png";
import { userDataContext } from "../Context/UserContext";

const SignIn = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { serverUrl, setUserData, setSelectedImage, setAssistantName } =
    useContext(userDataContext);
  const navigate = useNavigate();

  const loadUserCustomization = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/auth/current`, {
        withCredentials: true,
      });
      const user = result.data.user;

      if (user.assistantName) {
        setAssistantName(user.assistantName);
        localStorage.setItem("assistantName", user.assistantName);
      }

      if (user.assistantImage) {
        setSelectedImage(user.assistantImage);
        localStorage.setItem("selectedImage", user.assistantImage);
      }
    } catch (requestError) {
      console.error("Error loading customization:", requestError);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post(`${serverUrl}/api/auth/login`, formData, {
        withCredentials: true,
      });

      if (res.data.user) {
        setUserData(res.data.user);
      }

      await loadUserCustomization();

      const user = res.data.user || {};
      if (user.assistantName && user.assistantImage) {
        navigate("/");
      } else {
        navigate("/customization");
      }
    } catch (requestError) {
      console.error("Login Error:", requestError);
      setError(
        requestError.response?.data?.message ||
          "Unable to sign in. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative min-h-screen overflow-hidden bg-slate-950 bg-cover bg-center"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <div className="absolute inset-0 bg-[linear-gradient(135deg,_rgba(15,23,42,0.92),_rgba(8,47,73,0.84))]" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid w-full gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="hidden rounded-[2rem] border border-white/10 bg-white/5 p-8 text-white backdrop-blur-xl lg:block">
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/80">
              Virtual Assistant Workspace
            </p>
            <h1 className="mt-4 max-w-xl text-5xl font-semibold leading-tight">
              Clean voice and chat assistance in one focused interface.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-slate-300">
              Sign in to continue with your assistant, keep your setup, and ask
              questions by voice or text from the same screen.
            </p>
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur-2xl sm:p-8">
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/80">
              Sign In
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-white">
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-slate-200/80">
              Access your assistant and continue where you left off.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label className="mb-2 block text-sm text-slate-200">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={(event) =>
                    setFormData({ ...formData, email: event.target.value })
                  }
                  required
                  className="min-h-14 w-full rounded-2xl border border-white/10 bg-white/10 px-4 text-white outline-none transition placeholder:text-slate-400 focus:border-cyan-300/60"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-200">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={(event) =>
                    setFormData({ ...formData, password: event.target.value })
                  }
                  required
                  className="min-h-14 w-full rounded-2xl border border-white/10 bg-white/10 px-4 text-white outline-none transition placeholder:text-slate-400 focus:border-cyan-300/60"
                />
              </div>

              {error ? <p className="text-sm text-rose-300">{error}</p> : null}

              <button
                type="submit"
                disabled={loading}
                className="min-h-14 w-full rounded-2xl bg-cyan-400 px-5 font-medium text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-slate-500 disabled:text-slate-300"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>

            <p className="mt-6 text-sm text-slate-200/80">
              Do not have an account?{" "}
              <Link to="/signup" className="text-cyan-200 underline-offset-4 hover:underline">
                Create one
              </Link>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
