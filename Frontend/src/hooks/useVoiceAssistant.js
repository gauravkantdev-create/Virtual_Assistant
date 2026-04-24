import { useCallback, useEffect, useRef, useState } from "react";

const useVoiceAssistant = (options = {}) => {
  const {
    lang = "en-US",
    continuous = false,
    interimResults = false,
    onResult,
    onError,
  } = options;

  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(true);
  const [availableVoices, setAvailableVoices] = useState([]);

  const recognitionRef = useRef(null);
  const isComponentMounted = useRef(true);
  const isActuallyListening = useRef(false);
  const isActuallySpeaking = useRef(false);
  const speakTimeoutRef = useRef(null);
  const onResultRef = useRef(onResult);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onResultRef.current = onResult;
    onErrorRef.current = onError;
  }, [onResult, onError]);

  const initRecognition = useCallback(() => {
    if (typeof window === "undefined") return null;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSpeechSupported(false);
      return null;
    }

    const recognition = recognitionRef.current || new SpeechRecognition();
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.lang = lang;

    recognition.onstart = () => {
      isActuallyListening.current = true;
      if (isComponentMounted.current) setIsListening(true);
    };

    recognition.onend = () => {
      isActuallyListening.current = false;
      if (isComponentMounted.current) setIsListening(false);
    };

    recognition.onresult = (event) => {
      const result = event.results[event.results.length - 1];
      const transcript = result?.[0]?.transcript?.trim();
      if (transcript && onResultRef.current) onResultRef.current(transcript);
    };

    recognition.onerror = (event) => {
      isActuallyListening.current = false;
      if (isComponentMounted.current) setIsListening(false);
      if (onErrorRef.current) onErrorRef.current(event.error);
    };

    recognitionRef.current = recognition;
    setIsSpeechSupported(true);
    return recognition;
  }, [continuous, interimResults, lang]);

  const startListening = useCallback(() => {
    if (typeof window === "undefined") return;
    if (isActuallySpeaking.current) return;

    const recognition = initRecognition();
    if (!recognition || isActuallyListening.current) return;

    try {
      recognition.start();
    } catch (error) {
      if (error?.name !== "InvalidStateError" && onErrorRef.current) {
        onErrorRef.current(error?.name || "start-failed");
      }
    }
  }, [initRecognition]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;

    try {
      recognitionRef.current.stop();
      isActuallyListening.current = false;
      if (isComponentMounted.current) setIsListening(false);
    } catch (error) {
      if (onErrorRef.current) onErrorRef.current(error?.name || "stop-failed");
    }
  }, []);

  const speak = useCallback(
    (text) => {
      if (!text || typeof window === "undefined") return;
      if (
        !("speechSynthesis" in window) ||
        typeof window.SpeechSynthesisUtterance === "undefined"
      ) {
        if (onErrorRef.current) onErrorRef.current("speech-not-supported");
        return;
      }

      window.speechSynthesis.resume();
      window.speechSynthesis.cancel();

      if (isActuallyListening.current) {
        stopListening();
      }

      isActuallySpeaking.current = false;
      if (isComponentMounted.current) setIsSpeaking(false);

      if (speakTimeoutRef.current) clearTimeout(speakTimeoutRef.current);

      speakTimeoutRef.current = setTimeout(() => {
        const cleanText = text.replace(/[*#`]/g, "").trim();
        if (!cleanText) return;

        const utterance = new window.SpeechSynthesisUtterance(cleanText);
        utterance.lang = lang;
        utterance.rate = 1;

        const voices = window.speechSynthesis.getVoices();
        const preferredVoice =
          voices.find((voice) => voice.lang?.includes(lang) && voice.name?.includes("Google")) ||
          voices.find((voice) => voice.lang?.startsWith(lang.split("-")[0])) ||
          voices[0];

        if (preferredVoice) utterance.voice = preferredVoice;

        utterance.onstart = () => {
          isActuallySpeaking.current = true;
          if (isComponentMounted.current) setIsSpeaking(true);
        };

        utterance.onend = () => {
          isActuallySpeaking.current = false;
          if (isComponentMounted.current) setIsSpeaking(false);
        };

        utterance.onerror = (event) => {
          isActuallySpeaking.current = false;
          if (isComponentMounted.current) setIsSpeaking(false);

          if (event.error !== "interrupted" && event.error !== "canceled") {
            if (onErrorRef.current) onErrorRef.current(event.error || "speak-failed");
          }
        };

        window.speechSynthesis.speak(utterance);
      }, 100);
    },
    [lang, stopListening]
  );

  const stopSpeaking = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();
    isActuallySpeaking.current = false;
    if (isComponentMounted.current) setIsSpeaking(false);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!("speechSynthesis" in window)) {
      setIsSpeechSupported(false);
      return;
    }

    const loadVoices = () => {
      setAvailableVoices(window.speechSynthesis.getVoices());
    };

    window.speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();

    return () => {
      isComponentMounted.current = false;

      if (speakTimeoutRef.current) clearTimeout(speakTimeoutRef.current);

      stopListening();
      stopSpeaking();

      if (recognitionRef.current) {
        recognitionRef.current.onstart = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onresult = null;
      }
    };
  }, [stopListening, stopSpeaking]);

  return {
    isListening,
    isSpeaking,
    isSpeechSupported,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    availableVoices,
  };
};

export default useVoiceAssistant;
