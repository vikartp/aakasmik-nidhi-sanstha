import { useState, useEffect } from 'react';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface TriviaQuestion {
  category: string;
  type: string;
  difficulty: string;
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
}

const quizQuestions: Question[] = [
  {
    id: 1,
    question: 'आकस्मिक निधि का मुख्य उद्देश्य क्या है?',
    options: [
      'पैसा कमाना',
      'संकट के समय सहायता करना',
      'मनोरंजन करना',
      'व्यापार करना',
    ],
    correctAnswer: 1,
    explanation:
      'आकस्मिक निधि का मुख्य उद्देश्य समुदाय के सदस्यों को आपातकाल के समय वित्तीय सहायता प्रदान करना है।',
  },
  {
    id: 2,
    question: 'एकता में शक्ति का मतलब क्या है?',
    options: [
      'अकेले रहना बेहतर है',
      'मिलकर काम करने से बड़े लक्ष्य हासिल होते हैं',
      'झगड़ा करना चाहिए',
      'सबसे अलग रहना चाहिए',
    ],
    correctAnswer: 1,
    explanation:
      'एकता में शक्ति का अर्थ है कि जब लोग मिलकर काम करते हैं, तो वे बड़ी से बड़ी चुनौतियों का सामना कर सकते हैं।',
  },
  {
    id: 3,
    question: 'महीने में कितनी बार योगदान देना होता है?',
    options: ['रोज', 'हर महीने एक बार', 'साल में एक बार', 'जब मन करे'],
    correctAnswer: 1,
    explanation:
      'सदस्यों को हर महीने नियमित रूप से एक बार अपना योगदान देना होता है।',
  },
  {
    id: 4,
    question: 'सहयोग की भावना से क्या फायदा होता है?',
    options: [
      'कोई फायदा नहीं',
      'समुदाय मजबूत बनता है',
      'झगड़े बढ़ते हैं',
      'पैसा बर्बाद होता है',
    ],
    correctAnswer: 1,
    explanation:
      'सहयोग की भावना से समुदाय मजबूत बनता है और हर व्यक्ति को कठिन समय में सहारा मिलता है।',
  },
  {
    id: 5,
    question: 'आपसी भाईचारा क्यों जरूरी है?',
    options: [
      'समय बर्बाद करने के लिए',
      'एक-दूसरे की मदद के लिए',
      'लड़ाई करने के लिए',
      'दिखावा करने के लिए',
    ],
    correctAnswer: 1,
    explanation:
      'आपसी भाईचारा इसलिए जरूरी है क्योंकि इससे समुदाय में प्रेम और एक-दूसरे की मदद की भावना बनी रहती है।',
  },
];

function CommunityQuiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const handleAnswerSelect = (answerIndex: number) => {
    if (selectedAnswer !== null) return; // Prevent changing answer
    setSelectedAnswer(answerIndex);
    setShowExplanation(true);

    if (answerIndex === quizQuestions[currentQuestion].correctAnswer) {
      setScore(score + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setShowResult(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
    setShowResult(false);
    setShowExplanation(false);
  };

  const getScoreMessage = () => {
    const percentage = (score / quizQuestions.length) * 100;
    if (percentage >= 80) return 'बहुत बढ़िया! 🏆 आप एक सच्चे सदस्य हैं!';
    if (percentage >= 60) return 'अच्छा! 👍 आप सही राह पर हैं!';
    if (percentage >= 40) return 'ठीक है! 📚 थोड़ा और सीखने की जरूरत है!';
    return 'कोशिश करते रहें! 💪 अभ्यास से सब कुछ सीख सकते हैं!';
  };

  const question = quizQuestions[currentQuestion];

  if (showResult) {
    return (
      <div className="w-full max-w-sm mx-auto mt-8 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20 rounded-xl shadow-lg border border-blue-200 dark:border-blue-800 p-4">
        <div className="text-center">
          <h2 className="text-lg font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            🧠 Quiz पूरी हो गई!
          </h2>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4 border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              {score} / {quizQuestions.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {((score / quizQuestions.length) * 100).toFixed(0)}% सही उत्तर
            </div>
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {getScoreMessage()}
            </div>
          </div>

          <button
            onClick={resetQuiz}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold rounded-lg transition-all transform hover:scale-105 touch-manipulation"
          >
            फिर से खेलें
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto mt-8 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20 rounded-xl shadow-lg border border-blue-200 dark:border-blue-800 p-4">
      <div className="text-center mb-4">
        <h2 className="text-lg font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
          🧠 समुदायिक ज्ञान Quiz
        </h2>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          प्रश्न {currentQuestion + 1} / {quizQuestions.length}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4 border border-gray-200 dark:border-gray-700">
        <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-4 text-center leading-relaxed">
          {question.question}
        </h3>

        <div className="space-y-2">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(index)}
              disabled={selectedAnswer !== null}
              className={`w-full p-3 text-left rounded-lg border transition-all touch-manipulation ${
                selectedAnswer === null
                  ? 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                  : selectedAnswer === index
                    ? index === question.correctAnswer
                      ? 'border-green-500 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200'
                      : 'border-red-500 bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200'
                    : index === question.correctAnswer
                      ? 'border-green-500 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200'
                      : 'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
            >
              <span className="font-medium">
                {String.fromCharCode(65 + index)}.
              </span>{' '}
              {option}
            </button>
          ))}
        </div>

        {showExplanation && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg">
            <div className="text-sm text-blue-800 dark:text-blue-200 font-medium mb-1">
              व्याख्या:
            </div>
            <div className="text-sm text-blue-700 dark:text-blue-300">
              {question.explanation}
            </div>
          </div>
        )}
      </div>

      {selectedAnswer !== null && (
        <button
          onClick={handleNextQuestion}
          className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold rounded-lg transition-all transform hover:scale-105 touch-manipulation"
        >
          {currentQuestion < quizQuestions.length - 1
            ? 'अगला प्रश्न'
            : 'परिणाम देखें'}
        </button>
      )}
    </div>
  );
}

function TriviaQuiz() {
  const [triviaQuestions, setTriviaQuestions] = useState<TriviaQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionData, setCurrentQuestionData] = useState<{
    question: string;
    options: string[];
    correctAnswer: number;
    difficulty: string;
    category: string;
  } | null>(null);

  // Update question data when triviaQuestions or currentQuestion changes
  useEffect(() => {
    if (
      triviaQuestions.length > 0 &&
      currentQuestion < triviaQuestions.length
    ) {
      const question = triviaQuestions[currentQuestion];
      const allOptions = [
        ...question.incorrect_answers,
        question.correct_answer,
      ];
      const shuffledOptions = shuffleArray(allOptions);
      const correctIndex = shuffledOptions.indexOf(question.correct_answer);

      setCurrentQuestionData({
        question: decodeHtml(question.question),
        options: shuffledOptions.map(option => decodeHtml(option)),
        correctAnswer: correctIndex,
        difficulty: question.difficulty,
        category: question.category,
      });
    }
  }, [triviaQuestions, currentQuestion]);

  const fetchTriviaQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        'https://opentdb.com/api.php?amount=5&category=9&type=multiple'
      );
      const data = await response.json();

      if (data.response_code === 0) {
        setTriviaQuestions(data.results);
        setCurrentQuestion(0);
        setSelectedAnswer(null);
        setScore(0);
        setShowResult(false);
      } else {
        setError('प्रश्न लोड नहीं हो सके। कृपया दोबारा कोशिश करें।');
      }
    } catch (err) {
      console.log('Error fetching trivia questions:', err);
      setError('इंटरनेट कनेक्शन की समस्या है। कृपया बाद में कोशिश करें।');
    } finally {
      setLoading(false);
    }
  };

  const decodeHtml = (html: string) => {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
  };

  const shuffleArray = (array: string[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(answerIndex);

    if (
      currentQuestionData &&
      answerIndex === currentQuestionData.correctAnswer
    ) {
      setScore(score + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < triviaQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      setShowResult(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
    setShowResult(false);
    setTriviaQuestions([]);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'text-green-600 dark:text-green-400';
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'hard':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getScoreMessage = () => {
    const percentage = (score / triviaQuestions.length) * 100;
    if (percentage >= 80)
      return 'शानदार! 🌟 आप सामान्य ज्ञान में बहुत अच्छे हैं!';
    if (percentage >= 60) return 'बढ़िया! 🎯 अच्छी जानकारी है!';
    if (percentage >= 40) return 'ठीक है! 📖 और पढ़ने की जरूरत है!';
    return 'कोई बात नहीं! 💪 अभ्यास से सब कुछ सीख सकते हैं!';
  };

  if (loading) {
    return (
      <div className="w-full max-w-sm mx-auto mt-6 bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 dark:from-orange-900/20 dark:via-red-900/20 dark:to-pink-900/20 rounded-xl shadow-lg border border-orange-200 dark:border-orange-800 p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            प्रश्न लोड हो रहे हैं...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-sm mx-auto mt-6 bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 dark:from-orange-900/20 dark:via-red-900/20 dark:to-pink-900/20 rounded-xl shadow-lg border border-orange-200 dark:border-orange-800 p-4">
        <div className="text-center">
          <div className="text-red-600 dark:text-red-400 mb-4">{error}</div>
          <button
            onClick={fetchTriviaQuestions}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
          >
            दोबारा कोशिश करें
          </button>
        </div>
      </div>
    );
  }

  if (showResult) {
    return (
      <div className="w-full max-w-sm mx-auto mt-6 bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 dark:from-orange-900/20 dark:via-red-900/20 dark:to-pink-900/20 rounded-xl shadow-lg border border-orange-200 dark:border-orange-800 p-4">
        <div className="text-center">
          <h2 className="text-lg font-bold bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent mb-4">
            🌍 Trivia Quiz पूरी हो गई!
          </h2>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4 border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-2">
              {score} / {triviaQuestions.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {((score / triviaQuestions.length) * 100).toFixed(0)}% सही उत्तर
            </div>
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {getScoreMessage()}
            </div>
          </div>

          <div className="space-y-2">
            <button
              onClick={fetchTriviaQuestions}
              className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold rounded-lg transition-all transform hover:scale-105 touch-manipulation"
            >
              नए प्रश्न लाएं
            </button>
            <button
              onClick={resetQuiz}
              className="w-full py-2 bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors touch-manipulation"
            >
              मुख्य मेनू पर जाएं
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (triviaQuestions.length === 0) {
    return (
      <div className="w-full max-w-sm mx-auto mt-6 bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 dark:from-orange-900/20 dark:via-red-900/20 dark:to-pink-900/20 rounded-xl shadow-lg border border-orange-200 dark:border-orange-800 p-4">
        <div className="text-center">
          <h2 className="text-lg font-bold bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent mb-3">
            🌍 सामान्य ज्ञान Quiz
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            विश्व भर के दिलचस्प प्रश्नों के साथ अपना सामान्य ज्ञान बढ़ाएं!
          </p>
          <button
            onClick={fetchTriviaQuestions}
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold rounded-lg transition-all transform hover:scale-105 touch-manipulation"
          >
            Quiz शुरू करें
          </button>
        </div>
      </div>
    );
  }

  if (!currentQuestionData) {
    return (
      <div className="w-full max-w-sm mx-auto mt-6 bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 dark:from-orange-900/20 dark:via-red-900/20 dark:to-pink-900/20 rounded-xl shadow-lg border border-orange-200 dark:border-orange-800 p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            प्रश्न तैयार हो रहे हैं...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto mt-6 bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 dark:from-orange-900/20 dark:via-red-900/20 dark:to-pink-900/20 rounded-xl shadow-lg border border-orange-200 dark:border-orange-800 p-4">
      <div className="text-center mb-4">
        <h2 className="text-lg font-bold bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent mb-2">
          🌍 सामान्य ज्ञान Quiz
        </h2>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          प्रश्न {currentQuestion + 1} / {triviaQuestions.length}
        </div>
        <div
          className={`text-xs font-medium ${getDifficultyColor(currentQuestionData.difficulty)}`}
        >
          Difficulty: {currentQuestionData.difficulty.toUpperCase()}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4 border border-gray-200 dark:border-gray-700">
        <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-4 text-center leading-relaxed">
          {currentQuestionData.question}
        </h3>

        <div className="space-y-2">
          {currentQuestionData.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(index)}
              disabled={selectedAnswer !== null}
              className={`w-full p-3 text-left rounded-lg border transition-all touch-manipulation ${
                selectedAnswer === null
                  ? 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 hover:bg-orange-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                  : selectedAnswer === index
                    ? index === currentQuestionData?.correctAnswer
                      ? 'border-green-500 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200'
                      : 'border-red-500 bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200'
                    : index === currentQuestionData?.correctAnswer
                      ? 'border-green-500 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200'
                      : 'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
            >
              <span className="font-medium">
                {String.fromCharCode(65 + index)}.
              </span>{' '}
              {option}
            </button>
          ))}
        </div>
      </div>

      {selectedAnswer !== null && (
        <button
          onClick={handleNextQuestion}
          className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold rounded-lg transition-all transform hover:scale-105 touch-manipulation"
        >
          {currentQuestion < triviaQuestions.length - 1
            ? 'अगला प्रश्न'
            : 'परिणाम देखें'}
        </button>
      )}
    </div>
  );
}

function QuizSection() {
  return (
    <div className="space-y-0">
      <CommunityQuiz />
      <TriviaQuiz />
    </div>
  );
}

export default QuizSection;
