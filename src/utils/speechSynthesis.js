/**
 * Speech synthesis utility for flashcard audio
 * Uses Web Speech API to provide text-to-speech functionality
 */

/**
 * Speaks the given text using appropriate language voice
 * @param {string} text - The text to speak
 * @param {string} language - Language code: 'polish' or 'english'
 * @param {number} rate - Speech rate (0.5 to 2.0, default 1.0)
 * @param {boolean} isMuted - Whether audio is muted
 * @returns {Promise<void>}
 */
export const speakText = (text, language, rate = 1.0, isMuted = false) => {
  return new Promise((resolve, reject) => {
    // Check if speech synthesis is supported
    if (!window.speechSynthesis) {
      console.warn('Speech synthesis not supported in this browser');
      reject(new Error('Speech synthesis not supported'));
      return;
    }

    // Don't speak if muted
    if (isMuted) {
      resolve();
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;

    // Set language based on the text language
    const langCode = language.toLowerCase() === 'polish' ? 'pl-PL' : 'en-US';
    utterance.lang = langCode;

    // Try to find the best voice for the language
    const voices = window.speechSynthesis.getVoices();

    // Prefer voices that match the language
    const matchingVoice = voices.find(voice => voice.lang.startsWith(langCode.substring(0, 2)));

    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    utterance.onend = () => resolve();
    utterance.onerror = (error) => {
      console.error('Speech synthesis error:', error);
      reject(error);
    };

    window.speechSynthesis.speak(utterance);
  });
};

/**
 * Stops any ongoing speech
 */
export const stopSpeech = () => {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
};

/**
 * Check if speech synthesis is available
 * @returns {boolean}
 */
export const isSpeechSynthesisSupported = () => {
  return 'speechSynthesis' in window;
};

/**
 * Get available voices (needs to be called after voices are loaded)
 * @returns {SpeechSynthesisVoice[]}
 */
export const getAvailableVoices = () => {
  if (!window.speechSynthesis) {
    return [];
  }
  return window.speechSynthesis.getVoices();
};
