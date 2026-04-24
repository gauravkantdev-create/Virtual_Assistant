// Device detection and configuration utilities
import React from "react";

export const deviceConfig = {
  isMobile: () => {
    if (typeof navigator === "undefined") return false;
    return (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ) || (typeof window !== "undefined" && window.innerWidth <= 768)
    );
  },

  isTablet: () => {
    if (typeof navigator === "undefined") return false;
    return (
      /iPad|Android(?!.*Mobile)|Tablet/i.test(navigator.userAgent) ||
      (typeof window !== "undefined" &&
        window.innerWidth > 768 &&
        window.innerWidth <= 1024)
    );
  },

  isDesktop: () => !deviceConfig.isMobile() && !deviceConfig.isTablet(),
  isIOS: () =>
    typeof navigator !== "undefined" && /iPad|iPhone|iPod/.test(navigator.userAgent),
  isAndroid: () =>
    typeof navigator !== "undefined" && /Android/.test(navigator.userAgent),
  isSafari: () =>
    typeof navigator !== "undefined" &&
    /Safari/.test(navigator.userAgent) &&
    !/Chrome/.test(navigator.userAgent),
  isChrome: () =>
    typeof navigator !== "undefined" && /Chrome/.test(navigator.userAgent),
  isFirefox: () =>
    typeof navigator !== "undefined" && /Firefox/.test(navigator.userAgent),

  getSettings: () => {
    if (typeof window === "undefined") {
      return {
        touchAction: "auto",
        preventZoom: false,
        recognitionLang: "en-US",
        recognitionContinuous: true,
        recognitionInterimResults: true,
        reduceMotion: false,
        animationDuration: "0.5s",
        enableGpuAcceleration: true,
        maxParticles: 50,
        buttonSize: "36px",
        fontSize: {
          xs: "0.625rem",
          sm: "0.75rem",
          base: "0.875rem",
          lg: "1rem",
          xl: "1.125rem",
          "2xl": "1.25rem",
          "3xl": "1.5rem",
        },
        cardWidth: "380px",
        cardHeight: "460px",
        swipeThreshold: 75,
        swipeTimeout: 400,
        doubleTapTimeout: 500,
        enableOfflineMode: true,
        cacheStrategy: "networkFirst",
        enableHighContrast: false,
        enableLargeText: false,
      };
    }

    const isMobile = deviceConfig.isMobile();
    const isTablet = deviceConfig.isTablet();
    const isIOS = deviceConfig.isIOS();

    return {
      touchAction: isMobile ? "pan-y pinch-zoom" : "auto",
      preventZoom: isMobile && isIOS,
      recognitionLang: "en-US",
      recognitionContinuous: true,
      recognitionInterimResults: true,
      reduceMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      animationDuration: isMobile ? "0.3s" : "0.5s",
      enableGpuAcceleration: !isMobile || window.devicePixelRatio <= 2,
      maxParticles: isMobile ? 20 : 50,
      buttonSize: isMobile ? "44px" : "36px",
      fontSize: {
        xs: isMobile ? "0.75rem" : "0.625rem",
        sm: isMobile ? "0.875rem" : "0.75rem",
        base: isMobile ? "1rem" : "0.875rem",
        lg: isMobile ? "1.125rem" : "1rem",
        xl: isMobile ? "1.25rem" : "1.125rem",
        "2xl": isMobile ? "1.5rem" : "1.25rem",
        "3xl": isMobile ? "2rem" : "1.5rem",
      },
      cardWidth: isMobile ? "280px" : isTablet ? "320px" : "380px",
      cardHeight: isMobile ? "350px" : isTablet ? "400px" : "460px",
      swipeThreshold: isMobile ? 50 : 75,
      swipeTimeout: isMobile ? 300 : 400,
      doubleTapTimeout: isMobile ? 300 : 500,
      enableOfflineMode: true,
      cacheStrategy: isMobile ? "cacheFirst" : "networkFirst",
      enableHighContrast: window.matchMedia("(prefers-contrast: high)").matches,
      enableLargeText: window.matchMedia("(prefers-reduced-data: reduce)").matches,
    };
  },

  getViewport: () => {
    if (typeof window === "undefined") {
      return {
        width: 1024,
        height: 768,
        dvh: 768,
        dvw: 1024,
        safeArea: { top: "0px", bottom: "0px", left: "0px", right: "0px" },
        orientation: "landscape",
      };
    }

    return {
      width: window.innerWidth,
      height: window.innerHeight,
      dvh: window.visualViewport?.height || window.innerHeight,
      dvw: window.visualViewport?.width || window.innerWidth,
      safeArea: {
        top: getComputedStyle(document.documentElement).getPropertyValue(
          "env(safe-area-inset-top)"
        ),
        bottom: getComputedStyle(document.documentElement).getPropertyValue(
          "env(safe-area-inset-bottom)"
        ),
        left: getComputedStyle(document.documentElement).getPropertyValue(
          "env(safe-area-inset-left)"
        ),
        right: getComputedStyle(document.documentElement).getPropertyValue(
          "env(safe-area-inset-right)"
        ),
      },
      orientation:
        window.innerWidth > window.innerHeight ? "landscape" : "portrait",
    };
  },

  hasTouchSupport: () =>
    "ontouchstart" in window || navigator.maxTouchPoints > 0,
  hasSpeechRecognition: () =>
    "SpeechRecognition" in window ||
    "webkitSpeechRecognition" in window ||
    "mozSpeechRecognition" in window,
  hasSpeechSynthesis: () => "speechSynthesis" in window,
  hasPwaSupport: () => "serviceWorker" in navigator && "manifest" in document,
  hasFullscreenSupport: () =>
    document.fullscreenEnabled ||
    document.webkitFullscreenEnabled ||
    document.mozFullScreenEnabled ||
    document.msFullscreenEnabled,

  getOptimizedSettings: () => {
    const baseSettings = deviceConfig.getSettings();
    const hasTouch = deviceConfig.hasTouchSupport();
    const hasSpeech = deviceConfig.hasSpeechRecognition();
    const hasPwa = deviceConfig.hasPwaSupport();

    return {
      ...baseSettings,
      enableTouchGestures: hasTouch,
      enableVoiceInput: hasSpeech,
      enableVoiceOutput: deviceConfig.hasSpeechSynthesis(),
      enablePwaFeatures: hasPwa,
      enableFullscreen: deviceConfig.hasFullscreenSupport(),
      enableAnimations: !baseSettings.reduceMotion,
      enableParticles:
        baseSettings.enableGpuAcceleration && !baseSettings.reduceMotion,
      compactMode: deviceConfig.isMobile(),
      enhancedTouch: hasTouch,
      features: {
        voiceCommands: hasSpeech,
        touchGestures: hasTouch,
        pwaInstall: hasPwa,
        fullscreenMode: deviceConfig.hasFullscreenSupport(),
        offlineMode: true,
        pushNotifications: "Notification" in window,
        cameraAccess:
          "mediaDevices" in navigator &&
          "getUserMedia" in navigator.mediaDevices,
        microphoneAccess:
          "mediaDevices" in navigator &&
          "getUserMedia" in navigator.mediaDevices,
      },
    };
  },
};

const fallbackConfig = {
  enableAnimations: true,
  compactMode: false,
  enhancedTouch: false,
  reduceMotion: false,
  enableGpuAcceleration: true,
  enableTouchGestures: false,
  enableVoiceInput: false,
  enableVoiceOutput: false,
  enablePwaFeatures: false,
  enableFullscreen: false,
  enableParticles: false,
  touchAction: "auto",
  preventZoom: false,
  recognitionLang: "en-US",
  recognitionContinuous: true,
  recognitionInterimResults: true,
  animationDuration: "0.5s",
  maxParticles: 50,
  buttonSize: "36px",
  fontSize: {
    xs: "0.625rem",
    sm: "0.75rem",
    base: "0.875rem",
    lg: "1rem",
    xl: "1.125rem",
    "2xl": "1.25rem",
    "3xl": "1.5rem",
  },
  cardWidth: "380px",
  cardHeight: "460px",
  swipeThreshold: 75,
  swipeTimeout: 400,
  doubleTapTimeout: 500,
  enableOfflineMode: true,
  cacheStrategy: "networkFirst",
  enableHighContrast: false,
  enableLargeText: false,
};

const fallbackViewport = {
  width: 1024,
  height: 768,
  dvh: 768,
  dvw: 1024,
  safeArea: { top: "0px", bottom: "0px", left: "0px", right: "0px" },
  orientation: "landscape",
};

export const useDeviceConfig = () => {
  const [config, setConfig] = React.useState(() => {
    if (typeof window === "undefined") return fallbackConfig;

    try {
      return deviceConfig.getOptimizedSettings();
    } catch (error) {
      console.error("Error getting device config:", error);
      return fallbackConfig;
    }
  });

  const [viewport, setViewport] = React.useState(() => {
    if (typeof window === "undefined") return fallbackViewport;

    try {
      return deviceConfig.getViewport();
    } catch (error) {
      console.error("Error getting viewport:", error);
      return fallbackViewport;
    }
  });

  React.useEffect(() => {
    const handleResize = () => {
      try {
        setViewport(deviceConfig.getViewport());
        setConfig(deviceConfig.getOptimizedSettings());
      } catch (error) {
        console.error("Error updating device config:", error);
      }
    };

    const handleOrientationChange = () => {
      setTimeout(handleResize, 100);
    };

    if (typeof window !== "undefined") {
      window.addEventListener("resize", handleResize);
      window.addEventListener("orientationchange", handleOrientationChange);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("resize", handleResize);
        window.removeEventListener("orientationchange", handleOrientationChange);
      }
    };
  }, []);

  return { config, viewport };
};

export default deviceConfig;
