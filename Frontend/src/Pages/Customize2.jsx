import React, { useContext, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { userDataContext } from "../Context/UserContext";

const Customize2 = () => {
  const [assistantName, setAssistantName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const {
    selectedImage,
    setAssistantName: setGlobalAssistantName,
    serverUrl,
  } = useContext(userDataContext);
  const navigate = useNavigate();

  const handleNext = async () => {
    const trimmedName = assistantName.trim();
    if (!trimmedName) {
      setError("Please enter a name for your assistant.");
      return;
    }

    try {
      setIsSaving(true);
      setError("");

      const response = await axios.put(
        `${serverUrl}/api/auth/update-assistant`,
        {
          assistantName: trimmedName,
          assistantImage: selectedImage || "",
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        setGlobalAssistantName(trimmedName);
        navigate("/");
      }
    } catch (requestError) {
      console.error("Error saving assistant:", requestError);
      setError("Failed to save the assistant. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#0f172a_0%,_#111827_100%)] text-white">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid w-full gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/80">
              Step 2 of 2
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
              Name your assistant
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-7 text-slate-300">
              Pick a short, memorable name. This is what your assistant will use
              across the app and voice interface.
            </p>

            <div className="mt-8 rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-5">
              <label
                htmlFor="assistant-name"
                className="mb-3 block text-sm font-medium text-slate-300"
              >
                Assistant name
              </label>
              <input
                id="assistant-name"
                type="text"
                value={assistantName}
                onChange={(event) => setAssistantName(event.target.value)}
                placeholder="For example: Nova, Jarvis, Atlas..."
                className="min-h-14 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/60"
              />
              {error ? (
                <p className="mt-3 text-sm text-rose-300">{error}</p>
              ) : null}

              <div className="mt-6 flex flex-wrap gap-3">
                {["Jarvis", "Nova", "Atlas", "Astra"].map((name) => (
                  <button
                    key={name}
                    onClick={() => {
                      setAssistantName(name);
                      setError("");
                    }}
                    className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:border-cyan-300/50 hover:bg-white/10"
                  >
                    {name}
                  </button>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  onClick={() => navigate("/customization")}
                  className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/10"
                >
                  Back
                </button>
                <button
                  onClick={handleNext}
                  disabled={isSaving}
                  className="rounded-full bg-cyan-400 px-5 py-3 text-sm font-medium text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-300"
                >
                  {isSaving ? "Saving..." : "Finish setup"}
                </button>
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/80">
              Preview
            </p>
            <div className="mt-6 flex h-full flex-col items-center justify-center rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-8 text-center">
              <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-[2rem] border border-cyan-400/20 bg-slate-900">
                {selectedImage ? (
                  <img
                    src={selectedImage}
                    alt="Assistant preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-semibold text-cyan-300">
                    {(assistantName || "A").charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              <h2 className="mt-6 text-2xl font-semibold text-white">
                {assistantName.trim() || "Your assistant"}
              </h2>
              <p className="mt-3 max-w-md text-sm leading-7 text-slate-300">
                The home screen will use this name for typed replies, voice output,
                and personalization.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Customize2;
