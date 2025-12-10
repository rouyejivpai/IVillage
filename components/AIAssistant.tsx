import React, { useState, useEffect, useRef } from 'react';
import { Mic, X, Volume2, Loader2 } from 'lucide-react';
import { generateAIResponse, summarizePage } from '../services/geminiService';

interface AIAssistantProps {
  currentContext: string;
  onNavigate: (view: string) => void;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ currentContext, onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([
    { role: 'ai', text: '您好！我是您的乡村智能助手。您可以按住话筒说话，比如“我想买苹果”或“怎么交电费”。' }
  ]);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Initialize Speech Recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.lang = 'zh-CN';
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript.trim()) {
           handleUserInput(transcript);
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
      
      recognitionRef.current.onerror = (event: any) => {
         setIsListening(false);
         
         // Benign errors to ignore
         if (event.error === 'no-speech' || event.error === 'aborted') {
             return;
         }

         console.error("Speech recognition error:", event.error);
         
         let errorMessage = "语音识别遇到问题，请重试。";
         switch (event.error) {
            case 'not-allowed':
                errorMessage = "请允许浏览器访问麦克风权限。";
                break;
            case 'network':
                errorMessage = "网络连接不稳定，无法使用语音服务。";
                break;
            default:
                errorMessage = `语音识别错误 (${event.error})，请重试。`;
         }
         
         setMessages(prev => [...prev, { role: 'ai', text: errorMessage }]);
      };
    }
  }, []);

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN';
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleUserInput = async (text: string) => {
    setMessages(prev => [...prev, { role: 'user', text }]);
    setIsProcessing(true);

    const result = await generateAIResponse(text, currentContext);
    
    setIsProcessing(false);
    setMessages(prev => [...prev, { role: 'ai', text: result.text }]);
    speak(result.text);

    if (result.action) {
      const actionMap: Record<string, string> = {
        'GOTO_HOME': 'home',
        'GOTO_NEWS': 'news',
        'GOTO_GOV': 'gov',
        'GOTO_MARKET': 'market',
        'GOTO_COMMUNITY': 'community',
        'GOTO_ADMIN': 'admin',
        'GOTO_PROFILE': 'profile',
        'GOTO_TOURISM': 'tourism',
        'GOTO_HEALTH': 'health',
        'GOTO_EDUCATION': 'education',
        'GOTO_FINANCE': 'finance'
      };
      if (actionMap[result.action]) {
        setTimeout(() => onNavigate(actionMap[result.action]), 1500);
      }
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      if (!recognitionRef.current) {
          setMessages(prev => [...prev, { role: 'ai', text: "抱歉，您的浏览器不支持语音识别功能。" }]);
          return;
      }
      
      setIsListening(true);
      try {
        recognitionRef.current.start();
      } catch (e) {
        setIsListening(false);
      }
    }
  };

  const handleSummarize = async () => {
      setIsProcessing(true);
      const summary = await summarizePage(document.body.innerText.substring(0, 1000));
      setMessages(prev => [...prev, { role: 'ai', text: summary }]);
      setIsProcessing(false);
      speak(summary);
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 md:bottom-8 md:right-8 bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-3 rounded-full shadow-lg z-40 hover:scale-110 transition-transform flex items-center justify-center w-14 h-14 border-2 border-white/20"
        title="智能语音助手"
      >
        <Mic size={28} />
      </button>

      {/* Modal/Sheet */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-t-[2rem] md:rounded-2xl p-6 shadow-2xl animate-slide-up min-h-[50vh] max-h-[80vh] flex flex-col relative">
            
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-8 bg-purple-600 rounded-full"></div>
                <h2 className="text-xl font-bold text-gray-800">智能助手</h2>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                <X size={20} className="text-gray-600" />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto mb-4 space-y-4 p-2 no-scrollbar bg-gray-50 rounded-xl min-h-[200px]">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-br-none' 
                      : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isProcessing && (
                <div className="flex justify-start">
                   <div className="bg-white border border-gray-100 p-3 rounded-2xl flex items-center space-x-2">
                      <Loader2 className="animate-spin text-purple-600" size={16} />
                      <span className="text-gray-500 text-xs">正在思考...</span>
                   </div>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex flex-col gap-3">
                <div className="flex justify-center gap-4">
                     <button 
                        onClick={handleSummarize}
                        className="flex items-center px-4 py-2 bg-orange-50 text-orange-600 rounded-full text-xs font-bold active:scale-95 hover:bg-orange-100 transition-colors border border-orange-100"
                     >
                        <Volume2 size={14} className="mr-1"/> 读屏/总结
                     </button>
                </div>
                
                <button
                    onClick={toggleListening}
                    className={`w-full py-4 rounded-2xl flex items-center justify-center text-white font-bold text-lg transition-all shadow-md active:scale-95 ${
                    isListening ? 'bg-red-500 animate-pulse shadow-red-200' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-indigo-200'
                    }`}
                >
                    {isListening ? <Mic size={24} className="animate-bounce"/> : <Mic size={24} />}
                    <span className="ml-2">{isListening ? '正在聆听...' : '按住说话'}</span>
                </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIAssistant;