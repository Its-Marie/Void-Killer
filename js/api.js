// The Void Killer - Gemini API Module

let lastRequestTime = 0;
const RATE_LIMIT_MS = 3000; // 3 seconds
const requestQueue = [];
let processingQueue = false;

// Read API Key from LocalStorage
export function getApiKey() {
  return localStorage.getItem("void_killer_api_key");
}

export function setApiKey(key) {
  if (key) {
    localStorage.setItem("void_killer_api_key", key);
  } else {
    localStorage.removeItem("void_killer_api_key");
  }
}

export function isOfflineMode() {
  const key = getApiKey();
  return !key || key === "offline" || localStorage.getItem("void_killer_offline_flag") === "true";
}

// Queue system for rate limiting
export function callGeminiApi(prompt) {
  return new Promise((resolve, reject) => {
    requestQueue.push({ prompt, resolve, reject });
    processQueue();
  });
}

async function processQueue() {
  if (processingQueue || requestQueue.length === 0) return;
  processingQueue = true;

  const now = Date.now();
  const timeSinceLast = now - lastRequestTime;
  const delay = Math.max(0, RATE_LIMIT_MS - timeSinceLast);

  setTimeout(async () => {
    const { prompt, resolve, reject } = requestQueue.shift();
    lastRequestTime = Date.now();
    
    try {
      if (isOfflineMode()) {
        throw new Error("Offline mode enabled. Fallback data will be used.");
      }
      
      const apiKey = getApiKey();
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            responseMimeType: "application/json"
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!textResponse) {
        throw new Error("Gemini API returned an empty response.");
      }

      // Try parsing as JSON to confirm valid format
      const parsedJson = JSON.parse(textResponse);
      resolve(parsedJson);
    } catch (error) {
      console.warn("API request failed, triggering offline fallback:", error);
      reject(error);
    } finally {
      processingQueue = false;
      // Trigger next in queue
      processQueue();
    }
  }, delay);
}
