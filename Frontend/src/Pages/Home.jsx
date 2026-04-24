import React, { useContext, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { userDataContext } from "../Context/UserContext";
import useVoiceAssistant from "../hooks/useVoiceAssistant";

const Home = () => {
  const {
    selectedImage,
    assistantName,
    userData,
    setUserData,
    serverUrl,
  } = useContext(userDataContext);
  const navigate = useNavigate();

  const [response, setResponse] = useState("");
  const [question, setQuestion] = useState("");
  const [lastTranscript, setLastTranscript] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [voiceReplyEnabled, setVoiceReplyEnabled] = useState(true);

  const displayName = assistantName?.trim() || "Assistant";
  const userName = userData?.name?.trim() || "there";

  const {
    isListening,
    isSpeaking,
    isSpeechSupported,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
  } = useVoiceAssistant({
    assistantName: displayName,
    onResult: (transcript) => {
      setLastTranscript(transcript);
      askAssistant(transcript, { shouldSpeakReply: true });
    },
    onError: (err) => {
      const blockedErrors = [
        "not-allowed",
        "service-not-allowed",
        "audio-capture",
        "speech-not-supported",
      ];

      if (blockedErrors.includes(err)) {
        setResponse(
          "Microphone or speaker access is blocked. Please allow voice permissions and try again."
        );
        return;
      }

      if (err !== "no-speech") {
        setResponse(
          "Voice input stopped. Press Start listening and speak again."
        );
      }
    },
  });

  const statusText = useMemo(() => {
    if (isThinking) return "Thinking";
    if (isListening) return "Listening";
    if (isSpeaking) return "Speaking";
    return "Ready";
  }, [isThinking, isListening, isSpeaking]);

  const askAssistant = async (incomingPrompt, options = {}) => {
    const { shouldSpeakReply = false } = options;
    const cleanPrompt = incomingPrompt.trim();
    if (!cleanPrompt) {
      setResponse("Ask a question and I will reply here.");
      return;
    }

    try {
      setIsThinking(true);
      setResponse("");

      const result = await axios.post(
        `${serverUrl}/api/auth/ask-assistant`,
        { prompt: cleanPrompt },
        { withCredentials: true }
      );

      const message =
        result.data.response || result.data.message || "I could not generate a reply.";
      setResponse(message);
      setQuestion("");

      if (shouldSpeakReply || voiceReplyEnabled) {
        speak(message);
      }
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "I could not reach the assistant service right now.";
      setResponse(message);

      if (shouldSpeakReply || voiceReplyEnabled) {
        speak(message);
      }
    } finally {
      setIsThinking(false);
    }
  };

  const handleStartListening = () => {
    if (!isSpeechSupported) {
      setResponse(
        "Voice is not supported in this browser. Please use the text box below."
      );
      return;
    }

    setResponse("Listening now. Ask your question.");
    startListening();
  };

  const handleStopAllVoice = () => {
    stopListening();
    stopSpeaking();
    setResponse("Voice stopped. Press Start listening when you want to speak again.");
  };

  const handleLogout = async () => {
    try {
      await axios.get(`${serverUrl}/api/auth/logout`, { withCredentials: true });
    } catch (error) {
      console.error("Logout request failed:", error);
    }

    localStorage.removeItem("userData");
    localStorage.removeItem("selectedImage");
    localStorage.removeItem("assistantName");
    localStorage.removeItem("frontendImage");
    setUserData(null);
    navigate("/signin");
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#1e293b_0%,_#0f172a_45%,_#020617_100%)] text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-white/5 p-5 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-cyan-400/30 bg-slate-900 shadow-[0_20px_60px_rgba(34,211,238,0.15)]">
              {selectedImage ? (
                <img
                  src={selectedImage}
                  alt={displayName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-xl font-semibold text-cyan-300">
                  {displayName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/80">
                Virtual Assistant
              </p>
              <h1 className="text-2xl font-semibold text-white">{displayName}</h1>
              <p className="text-sm text-slate-400">
                Welcome back, {userName}. Ask by voice or type below.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
              Status: <span className="text-cyan-300">{statusText}</span>
            </div>
            <button
              onClick={() => navigate("/customization")}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:border-cyan-300/40 hover:bg-white/10"
            >
              Customize
            </button>
            <button
              onClick={handleLogout}
              className="rounded-full bg-cyan-400 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-cyan-300"
            >
              Sign out
            </button>
          </div>
        </header>

        <main className="grid flex-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <div className="flex flex-col gap-6">
              <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/70 p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">
                  Live Response
                </p>
                <div className="mt-4 min-h-40 rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5">
                  <p className="text-sm text-slate-400">
                    {lastTranscript
                      ? `You said: "${lastTranscript}"`
                      : "Your latest question will appear here."}
                  </p>

                  <div className="mt-5">
                    {isThinking ? (
                      <div className="flex items-center gap-3 text-slate-300">
                        <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-cyan-300" />
                        <span>The assistant is preparing a response...</span>
                      </div>
                    ) : (
                      <p className="text-lg leading-8 text-white">
                        {response || "Ask anything and the assistant will respond here."}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  askAssistant(question);
                }}
                className="rounded-[1.75rem] border border-white/10 bg-slate-950/70 p-4"
              >
                <label
                  htmlFor="assistant-question"
                  className="mb-3 block text-sm font-medium text-slate-300"
                >
                  Type a message
                </label>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    id="assistant-question"
                    type="text"
                    value={question}
                    onChange={(event) => setQuestion(event.target.value)}
                    placeholder="Ask a question, request help, or start a task..."
                    className="min-h-14 flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/60"
                  />
                  <button
                    type="submit"
                    disabled={isThinking}
                    className="min-h-14 rounded-2xl bg-cyan-400 px-6 font-medium text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-300"
                  >
                    Send
                  </button>
                </div>
              </form>
            </div>
          </section>

          <aside className="flex flex-col gap-6">
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">
                Voice Control
              </p>
              <div className="mt-5 flex flex-col items-center gap-5 text-center">
                <div className="flex h-52 w-52 items-center justify-center overflow-hidden rounded-[2.5rem] border border-white/10 bg-slate-950 shadow-[0_30px_100px_rgba(15,23,42,0.65)]">
                  {selectedImage ? (
                    <img
                      src={selectedImage}
                      alt={displayName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-cyan-400/10 text-3xl font-semibold text-cyan-300">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <p className="text-xl font-semibold text-white">{displayName}</p>
                  <p className="text-sm text-slate-400">
                    Voice stays manual. Press Start listening, ask your question, and the assistant will speak the reply.
                  </p>
                </div>

                <div className="w-full space-y-3">
                  <div className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-300">
                    {isListening
                      ? "Listening now. Speak your question."
                      : isSpeaking
                        ? "Speaking the response now."
                        : isThinking
                          ? "Thinking about your question."
                          : "Manual voice is ready."}
                  </div>

                  <div className="grid w-full gap-3 sm:grid-cols-2">
                    <button
                      onClick={isListening ? stopListening : handleStartListening}
                      className={`rounded-2xl px-5 py-3 font-medium transition ${
                        isListening
                          ? "bg-amber-500 text-slate-950 hover:bg-amber-400"
                          : "bg-cyan-400 text-slate-950 hover:bg-cyan-300"
                      }`}
                    >
                      {isListening ? "Stop listening" : "Start listening"}
                    </button>
                    <button
                      onClick={handleStopAllVoice}
                      className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-medium text-white transition hover:bg-white/10"
                    >
                      Stop voice
                    </button>
                  </div>

                  <label className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-300">
                    <span>Speak replies aloud</span>
                    <input
                      type="checkbox"
                      checked={voiceReplyEnabled}
                      onChange={(event) => setVoiceReplyEnabled(event.target.checked)}
                      className="h-4 w-4 accent-cyan-400"
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">
                Suggested Prompts
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                {[
                  "Explain JavaScript closures simply",
                  "Help me plan my day",
                  "Summarize what this app can do",
                  "Give me a short productivity tip",
                ].map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => askAssistant(prompt)}
                    className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:border-cyan-300/50 hover:bg-white/10"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
};

export default Home;
