const DEFAULT_API_KEY = '';

export const getStoredApiKey = () => {
  return localStorage.getItem('aero_ai_api_key') || DEFAULT_API_KEY;
};

export const setStoredApiKey = (key) => {
  if (key) {
    localStorage.setItem('aero_ai_api_key', key);
  } else {   
    localStorage.removeItem('aero_ai_api_key');
  }
};

/**
 * Generate Smart Weather-Aware AI Response
 */
export const generateAIResponse = async (userPrompt, weatherContext, conversationHistory = []) => {
  const apiKey = getStoredApiKey();

  // Format system prompt with real-time weather context
  const systemContext = `
You are "AeroAI", an expert meteorologist and AI personal weather assistant.
You provide friendly, accurate, and actionable weather advice.    

CURRENT WEATHER CONTEXT:        
- Location: ${weatherContext?.location || 'Unknown City'}
- Temperature: ${weatherContext?.temp ?? '--'}°C (Feels like: ${weatherContext?.feelsLike ?? '--'}°C)
- Condition: ${weatherContext?.condition?.text || 'Clear'}
- Humidity: ${weatherContext?.humidity ?? '--'}%
- Wind: ${weatherContext?.windSpeed ?? '--'} km/h
- UV Index: ${weatherContext?.uvIndex ?? '--'}
- Air Quality (AQI): ${weatherContext?.airQuality?.aqi ?? '--'} (${weatherContext?.airQuality?.status || 'Good'})
- Sunrise: ${weatherContext?.sunrise || '06:00 AM'}, Sunset: ${weatherContext?.sunset ||        
    weatherContext?.daily  
      ? weatherContext.daily.slice(0, 3).map(d => `${d.day}: ${d.maxTemp}°C / ${d.minTemp}°C (${d.condition.text})`).join('; ')
      : 'Mild weather'
  }

INSTRUCTIONS:
1. Always base your advice on the current weather context provided above.
2. Be concise, engaging, and practical (use bullet points, emojis where appropriate).
3. If asked about clothing, travel, sports, or outdoor plans, give specific recommendations suited to ${weatherContext?.temp}°C and ${weatherContext?.condition?.text}.
  `;

  // 1. Try Gemini REST API
  if (apiKey && apiKey.length > 5) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: `${systemContext}\n\nUser Question: ${userPrompt}` }
                ]
              }
            ]
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidateText) {
          return candidateText;
        }
      }
    } catch (err) {
      console.warn('Gemini REST API request error, activating smart local AI engine:', err);
    }
  }

  // 2. Smart Local Fallback AI Engine
  return generateLocalFallbackResponse(userPrompt, weatherContext);
};

/**
 * Intelligent Local Weather AI Engine
 */
function generateLocalFallbackResponse(prompt, weather) {
  const query = prompt.toLowerCase();
  const temp = weather?.temp ?? 20;
  const cond = (weather?.condition?.text || '').toLowerCase();
  const location = weather?.location || 'your area';
  const humidity = weather?.humidity ?? 50;
  const wind = weather?.windSpeed ?? 10;
  const uv = weather?.uvIndex ?? 4;
  const aqi = weather?.airQuality?.aqi ?? 30;

  // Outfit & What to wear
  if (query.includes('wear') || query.includes('outfit') || query.includes('clothes') || query.includes('dress')) {
    if (temp >= 28) {
      return `☀️ **Outfit Advice for ${location} (${temp}°C, Hot):**\n\n- Wear light, breathable cotton or linen t-shirts and shorts/skirt.\n- Don't forget sunglasses, sunscreen (UV is ${uv}), and a hat.\n- Stay hydrated with plenty of water!`;
    } else if (temp >= 18) {
      return `🌤️ **Outfit Advice for ${location} (${temp}°C, Pleasant):**\n\n- Comfortable jeans, chinos, or pants paired with a t-shirt or light blouse.\n- Bring a light denim jacket or cardigan for evening breezes.\n- Great weather for comfortable sneakers!`;
    } else if (temp >= 10) {
      return `🧥 **Outfit Advice for ${location} (${temp}°C, Cool):**\n\n- Layer up! Wear a long-sleeve shirt under a sweater or medium jacket.\n- Full-length trousers or jeans.\n- Warm socks and light boots or closed shoes.`;
    } else {
      return `❄️ **Outfit Advice for ${location} (${temp}°C, Cold):**\n\n- Bundle up with a heavy winter coat, thermal inner layers, and a cozy sweater.\n- Scarf, gloves, and a warm beanie hat recommended.\n- Keep your feet warm with insulated boots.`;
    }
  }

  // Umbrella / Rain Check
  if (query.includes('rain') || query.includes('umbrella') || query.includes('wet')) {
    if (cond.includes('rain') || cond.includes('drizzle') || cond.includes('thunder')) {
      return `☔ **Rain Alert in ${location}!**\n\nYes, absolutely bring an umbrella! Current condition is **${weather?.condition?.text}** with **${humidity}%** humidity. A waterproof rain jacket or poncho is also strongly advised.`;
    } else {
      return `🌤️ **Rain Status for ${location}:**\n\nCurrently, it's **${weather?.condition?.text}** with a low chance of rain today. You probably won't need an umbrella right now, but feel free to check the 24-hour hourly forecast bar above!`;
    }
  }

  // Outdoor Activities / Running / Picnic
  if (query.includes('picnic') || query.includes('run') || query.includes('outdoor') || query.includes('walk') || query.includes('sport')) {
    if (cond.includes('rain') || cond.includes('thunder')) {
      return `⚠️ **Outdoor Activity Warning for ${location}:**\n\nIt's currently **${weather?.condition?.text}**. Outdoor sports, picnics, or running are not recommended right now. Consider indoor activities like gym workouts, visiting a museum, or cozying up with a book!`;
    } else if (uv > 8) {
      return `🧢 **High UV Warning (${uv}):**\n\nOutdoor activities in ${location} are great, but avoid direct sun exposure during peak afternoon hours (11 AM - 3 PM). Apply broad-spectrum SPF 50+ sunscreen and wear UV-protection sunglasses!`;
    } else {
      return `🚴 **Great Weather for Outdoor Plans in ${location}!**\n\nWith **${temp}°C** and **${weather?.condition?.text}**, conditions are fantastic for a walk, jog, cycling, or a park picnic! Enjoy the outdoors.`;
    }
  }

  // Air Quality
  if (query.includes('air') || query.includes('aqi') || query.includes('pollution') || query.includes('breathe')) {
    return `🌬️ **Air Quality Summary for ${location}:**\n\n- **AQI Index:** ${aqi} (${weather?.airQuality?.status || 'Good'})\n- **PM2.5:** ${weather?.airQuality?.pm25 || 12} µg/m³\n- **PM10:** ${weather?.airQuality?.pm10 || 20} µg/m³\n\n${
      aqi <= 50
        ? 'Air quality is excellent! Perfect for outdoor exercise.'
        : 'Air quality is moderate. Sensitive individuals should take basic precautions.'
    }`;
  }

  // General / Default response
  return `🌤️ **AeroAI Weather Summary for ${location}:**\n\nRight now, it is **${temp}°C** (feels like ${weather?.feelsLike}°C) with **${weather?.condition?.text}**.\n\n- **Wind:** ${wind} km/h\n- **Humidity:** ${humidity}%\n- **UV Index:** ${uv}\n- **Air Quality:** ${aqi} (${weather?.airQuality?.status || 'Good'})\n\nFeel free to ask me anything about outfits, outdoor plans, rain checks, or travel recommendations for ${location}!`;
}
