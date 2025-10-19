import { useState, useEffect } from 'react';

const quotes = [
  "एकता में शक्ति है, और हमारी एकता ही हमारा सबसे बड़ा खजाना है।",
  "मिलकर चलने से हर रास्ता आसान हो जाता है।",
  "सहयोग की शक्ति से हर मुश्किल आसान हो जाती है।",
  "एक दीपक से हज़ारों दीपक जल सकते हैं।",
  "साथ मिलकर चलने वालों का कोई नुकसान नहीं कर सकता।",
  "छोटी-छोटी बूंदों से ही समुद्र बनता है।",
  "हमारी एकजुटता ही हमारी सबसे बड़ी ताकत है।",
  "मिलजुल कर काम करने से असंभव भी संभव हो जाता है।"
];

const mantras = [
  'आज एक नया दिन है!',
  'आपकी मेहनत रंग लाएगी!',
  'सफलता आपका इंतज़ार कर रही है!',
  'आप बेहतरीन हैं!',
  'हर मुश्किल का हल है!',
  'आगे बढ़ते रहिए!',
  'आपमें असीम शक्ति है!',
  'मुस्कुराते रहिए!',
  'विश्वास रखें, सब कुछ ठीक होगा!',
  'छोटे कदम भी बड़ी मंज़िल तक पहुंचाते हैं!'
];

const emojis = ['🌟', '💪', '🚀', '🎯', '💎', '🏆', '🌈', '✨'];

export default function DailyFunZone() {
  const [currentQuote, setCurrentQuote] = useState(() => 
    quotes[Math.floor(Math.random() * quotes.length)]
  );
  const [luckyNumber, setLuckyNumber] = useState(() => 
    Math.floor(Math.random() * 100) + 1
  );
  const [currentMantra, setCurrentMantra] = useState(() => 
    mantras[Math.floor(Math.random() * mantras.length)]
  );
  const [currentEmoji, setCurrentEmoji] = useState(() => 
    emojis[Math.floor(Math.random() * emojis.length)]
  );

  // API-based features
  const [advice, setAdvice] = useState<string>('Loading advice...');
  const [joke, setJoke] = useState<string>('Loading joke...');
  const [fact, setFact] = useState<string>('Loading fact...');
  const [loading, setLoading] = useState({
    advice: false,
    joke: false,
    fact: false
  });


  const generateNewQuote = () => {
    setCurrentQuote(quotes[Math.floor(Math.random() * quotes.length)]);
  };

  const generateNewNumber = () => {
    setLuckyNumber(Math.floor(Math.random() * 100) + 1);
  };



  const generateNewMantra = () => {
    setCurrentMantra(mantras[Math.floor(Math.random() * mantras.length)]);
    setCurrentEmoji(emojis[Math.floor(Math.random() * emojis.length)]);
  };

  // API Functions
  const fetchAdvice = async () => {
    setLoading(prev => ({ ...prev, advice: true }));
    try {
      const response = await fetch('https://api.adviceslip.com/advice');
      const data = await response.json();
      setAdvice(data.slip.advice);
    } catch (error) {
      console.log('Error fetching advice:', error);
      setAdvice('सफलता के लिए कड़ी मेहनत और धैर्य जरूरी है।');
    } finally {
      setLoading(prev => ({ ...prev, advice: false }));
    }
  };

  const fetchJoke = async () => {
    setLoading(prev => ({ ...prev, joke: true }));
    try {
      const response = await fetch('https://official-joke-api.appspot.com/random_joke');
      const data = await response.json();
      setJoke(`${data.setup} - ${data.punchline}`);
    } catch (error) {
      console.log('Error fetching joke:', error);
      setJoke('हंसी सबसे अच्छी दवा है! 😄');
    } finally {
      setLoading(prev => ({ ...prev, joke: false }));
    }
  };

  const fetchFact = async () => {
    setLoading(prev => ({ ...prev, fact: true }));
    try {
      const response = await fetch('https://uselessfacts.jsph.pl/random.json?language=en');
      const data = await response.json();
      setFact(data.text);
    } catch (error) {
      console.log('Error fetching fact:', error);
      setFact('Knowledge is power. हमेशा कुछ नया सीखते रहें!');
    } finally {
      setLoading(prev => ({ ...prev, fact: false }));
    }
  };



  // Initial API calls
  useEffect(() => {
    fetchAdvice();
    fetchJoke();
    fetchFact();
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-orange-900/20 rounded-xl shadow-lg border border-purple-200 dark:border-purple-800 p-6">
      <h2 className="text-2xl font-bold text-center bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent mb-6">
        🎯 Daily Fun Zone 🎮
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Quote of the Day */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-purple-700 dark:text-purple-300 mb-3 text-center">
            💭 आज का विचार
          </h3>
          <div className="text-center">
            <p className="text-gray-700 dark:text-gray-300 italic text-sm md:text-base leading-relaxed">
              "{currentQuote}"
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              - आकस्मिक निधि युवा संस्था
            </p>
          </div>
          <div className="mt-3 text-center">
            <button 
              onClick={generateNewQuote}
              className="text-xs px-3 py-1 bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-200 rounded-full hover:bg-purple-200 dark:hover:bg-purple-700 transition-colors"
            >
              नया विचार लाएं
            </button>
          </div>
        </div>

        {/* Simple Number Game */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-pink-700 dark:text-pink-300 mb-3 text-center">
            🎲 लकी नंबर गेम
          </h3>
          <div className="text-center">
            <div className="mb-3">
              <span className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                {luckyNumber}
              </span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
              आपका आज का लकी नंबर! 🍀
            </p>
            <button 
              onClick={generateNewNumber}
              className="text-xs px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full hover:from-pink-600 hover:to-purple-600 transition-all transform hover:scale-105"
            >
              नया नंबर जेनरेट करें
            </button>
          </div>
        </div>

        {/* Mini Motivation */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-orange-700 dark:text-orange-300 mb-3 text-center">
            ⭐ आज का मंत्र
          </h3>
          <div className="text-center">
            <div className="text-3xl mb-2">
              {currentEmoji}
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
              {currentMantra}
            </p>
          </div>
          <div className="mt-3 text-center">
            <button 
              onClick={generateNewMantra}
              className="text-xs px-3 py-1 bg-orange-100 dark:bg-orange-800 text-orange-700 dark:text-orange-200 rounded-full hover:bg-orange-200 dark:hover:bg-orange-700 transition-colors"
            >
              नया मंत्र लाएं
            </button>
          </div>
        </div>

        {/* Daily Advice */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-300 mb-3 text-center">
            💡 Daily Advice
          </h3>
          <div className="text-center min-h-[60px] flex items-center justify-center">
            {loading.advice ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            ) : (
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {advice}
              </p>
            )}
          </div>
          <div className="mt-3 text-center">
            <button 
              onClick={fetchAdvice}
              disabled={loading.advice}
              className="text-xs px-3 py-1 bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200 rounded-full hover:bg-blue-200 dark:hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              नई सलाह लाएं
            </button>
          </div>
        </div>

        {/* Daily Joke */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-green-700 dark:text-green-300 mb-3 text-center">
            😄 Daily Joke
          </h3>
          <div className="text-center min-h-[60px] flex items-center justify-center">
            {loading.joke ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
            ) : (
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {joke}
              </p>
            )}
          </div>
          <div className="mt-3 text-center">
            <button 
              onClick={fetchJoke}
              disabled={loading.joke}
              className="text-xs px-3 py-1 bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-200 rounded-full hover:bg-green-200 dark:hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              नया जोक लाएं
            </button>
          </div>
        </div>

        {/* Random Fact */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-indigo-700 dark:text-indigo-300 mb-3 text-center">
            🧠 Random Fact
          </h3>
          <div className="text-center min-h-[60px] flex items-center justify-center">
            {loading.fact ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
            ) : (
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {fact}
              </p>
            )}
          </div>
          <div className="mt-3 text-center">
            <button 
              onClick={fetchFact}
              disabled={loading.fact}
              className="text-xs px-3 py-1 bg-indigo-100 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-200 rounded-full hover:bg-indigo-200 dark:hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              नया तथ्य लाएं
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          🎉 रोज़ाना नई चीज़ों के लिए वापस आएं! बटन दबाकर नए कंटेंट देखें।
        </p>
      </div>
    </div>
  );
}