import React, { useContext, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import bg from "../assets/authBg.png";
import { userDataContext } from "../Context/UserContext";

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    serverUrl,
    setUserData,
    setSelectedImage,
    setAssistantName,
    setFrontendImage,
  } = useContext(userDataContext);
  const navigate = useNavigate();

  const handleSignUp = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post(`${serverUrl}/api/auth/signup`, formData, {
        withCredentials: true,
      });

      setUserData(res.data.user);
      setSelectedImage(null);
      setAssistantName("");
      setFrontendImage(null);
      navigate("/customization");
    } catch (requestError) {
      console.error("Signup Error:", requestError);
      setError(
        requestError.response?.data?.message ||
          "Unable to create the account right now."
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
        <div className="grid w-full gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="rounded-[2rem] border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur-2xl sm:p-8">
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/80">
              Create Account
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-white">
              Start building your assistant
            </h1>
            <p className="mt-2 text-sm text-slate-200/80">
              Create an account, then choose the assistant image and name that fit
              your style.
            </p>

            <form onSubmit={handleSignUp} className="mt-8 space-y-5">
              <div>
                <label className="mb-2 block text-sm text-slate-200">Full name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={(event) =>
                    setFormData({ ...formData, name: event.target.value })
                  }
                  required
                  className="min-h-14 w-full rounded-2xl border border-white/10 bg-white/10 px-4 text-white outline-none transition placeholder:text-slate-400 focus:border-cyan-300/60"
                />
              </div>

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
                {loading ? "Creating account..." : "Create account"}
              </button>
            </form>

            <p className="mt-6 text-sm text-slate-200/80">
              Already have an account?{" "}
              <Link to="/signin" className="text-cyan-200 underline-offset-4 hover:underline">
                Sign in
              </Link>
            </p>
          </section>

          <section className="hidden rounded-[2rem] border border-white/10 bg-white/5 p-8 text-white backdrop-blur-xl lg:block">
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/80">
              Guided Setup
            </p>
            <h2 className="mt-4 max-w-xl text-5xl font-semibold leading-tight">
              Build an assistant that looks cleaner and responds more naturally.
            </h2>
            <p className="mt-6 max-w-xl text-base leading-8 text-slate-300">
              After sign-up, you will pick the assistant image, choose a name, and
              enter the redesigned home screen with both voice and text replies.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
