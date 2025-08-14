import { useState, useRef, useEffect } from 'react';

interface RequiredField {
  field: string;
  type: string;
  required: boolean;
  description: string;
}

interface DataCollectionChatProps {
  requiredFields: RequiredField[];
  onDataCollected: (data: Record<string, any>) => void;
  onComplete: () => void;
}

interface ChatMessage {
  id: string;
  type: 'ai' | 'user';
  content: string;
  timestamp: Date;
  fieldContext?: string;
}

const DataCollectionChat = ({ requiredFields, onDataCollected, onComplete }: DataCollectionChatProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [currentFieldIndex, setCurrentFieldIndex] = useState(0);
  const [collectedData, setCollectedData] = useState<Record<string, any>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initialize conversation
    addAIMessage(
      `안녕하세요! RFP 제출을 위해 필요한 정보를 수집해드리겠습니다. 총 ${requiredFields.length}개의 정보가 필요하며, 하나씩 차근차근 진행하겠습니다. 

첫 번째 질문부터 시작하겠습니다.`
    );
    setTimeout(() => {
      askCurrentField();
    }, 1000);
  }, []);

  const addAIMessage = (content: string, fieldContext?: string) => {
    const message: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'ai',
      content,
      timestamp: new Date(),
      fieldContext
    };
    setMessages(prev => [...prev, message]);
  };

  const addUserMessage = (content: string) => {
    const message: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'user',
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, message]);
  };

  const askCurrentField = () => {
    if (currentFieldIndex >= requiredFields.length) {
      completeCollection();
      return;
    }

    const field = requiredFields[currentFieldIndex];
    let question = generateQuestionForField(field);
    
    addAIMessage(question, field.field);
  };

  const generateQuestionForField = (field: RequiredField): string => {
    const progress = `(${currentFieldIndex + 1}/${requiredFields.length})`;
    
    switch (field.field) {
      case '회사명':
        return `${progress} 운용사의 정식 회사명을 알려주세요. 등록된 법인명으로 입력해주시면 됩니다.`;
      
      case 'AUM':
        return `${progress} 현재 총 운용자산 규모(AUM)를 알려주세요. 예: "500억원" 또는 "1조 2000억원" 형태로 입력해주세요.`;
      
      case 'GP 출자비율':
        return `${progress} GP의 최소 출자 비율을 퍼센트로 알려주세요. 예: "15%" 또는 "20%" 형태로 입력해주세요. (정부 출자사업은 보통 10% 이상 요구)`;
      
      case '팀 구성원':
        return `${progress} 핵심 투자팀 구성원 정보를 알려주세요. 다음 형태로 입력해주세요:
        
예시:
- 김철수 (대표이사, 20년 경력, 삼성벤처투자 출신)
- 이영희 (투자본부장, 15년 경력, KDB산업은행 출신)
- 박민수 (투자팀장, 10년 경력, 네이버 출신)

각 구성원의 이름, 직책, 경력년수, 주요 경력을 포함해주세요.`;
      
      case '투자전략':
        return `${progress} 투자 전략 및 접근 방식을 상세히 알려주세요. 다음 내용을 포함해주세요:
        
• 투자 대상 (업종, 기업 규모, 성장 단계)
• 투자 방식 (지분 투자, 채권 투자 등)
• 가치 창출 방법
• 차별화된 투자 철학`;
      
      case '과거 실적':
        return `${progress} 과거 3년간 투자 실적을 알려주세요. 다음 정보를 포함해주세요:
        
• 투자 건수
• 총 투자 금액
• 주요 성공 사례 (회사명, 투자 금액, 수익률)
• IRR, MOIC 등 성과 지표`;
      
      default:
        return `${progress} ${field.description}에 대해 알려주세요.`;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentInput.trim() || isProcessing) return;

    const userInput = currentInput.trim();
    addUserMessage(userInput);
    setCurrentInput('');
    setIsProcessing(true);

    // Simulate processing time
    setTimeout(() => {
      processUserInput(userInput);
      setIsProcessing(false);
    }, 1000);
  };

  const processUserInput = (input: string) => {
    const currentField = requiredFields[currentFieldIndex];
    
    // Validate and process the input
    const processedData = validateAndProcessInput(input, currentField);
    
    if (processedData.isValid) {
      // Store the data
      const newData = { ...collectedData, [currentField.field]: processedData.value };
      setCollectedData(newData);
      onDataCollected(newData);

      // Provide confirmation
      addAIMessage(generateConfirmationMessage(currentField, processedData.value));

      // Move to next field
      setCurrentFieldIndex(prev => prev + 1);
      
      setTimeout(() => {
        askCurrentField();
      }, 1500);
    } else {
      // Ask for clarification
      addAIMessage(processedData.errorMessage || '죄송합니다. 다시 한 번 입력해주시겠어요?');
    }
  };

  const validateAndProcessInput = (input: string, field: RequiredField) => {
    switch (field.type) {
      case 'currency':
        const currencyMatch = input.match(/(\d+(?:,\d{3})*(?:\.\d+)?)\s*([억조만원]*)/);
        if (currencyMatch) {
          return {
            isValid: true,
            value: input
          };
        }
        return {
          isValid: false,
          errorMessage: '금액을 정확히 입력해주세요. 예: "500억원", "1조 2000억원"'
        };

      case 'percentage':
        const percentMatch = input.match(/(\d+(?:\.\d+)?)\s*%?/);
        if (percentMatch) {
          const value = parseFloat(percentMatch[1]);
          if (value >= 0 && value <= 100) {
            return {
              isValid: true,
              value: `${value}%`
            };
          }
        }
        return {
          isValid: false,
          errorMessage: '퍼센트를 정확히 입력해주세요. 예: "15%", "20%"'
        };

      case 'array':
        if (input.length > 20) { // Minimum reasonable length for team info
          return {
            isValid: true,
            value: input
          };
        }
        return {
          isValid: false,
          errorMessage: '팀 구성원 정보를 더 자세히 입력해주세요. 이름, 직책, 경력을 포함해주세요.'
        };

      default:
        if (input.length > 2) {
          return {
            isValid: true,
            value: input
          };
        }
        return {
          isValid: false,
          errorMessage: '더 자세한 정보를 입력해주세요.'
        };
    }
  };

  const generateConfirmationMessage = (field: RequiredField, value: any): string => {
    switch (field.field) {
      case '회사명':
        return `네, "${value}"로 등록하겠습니다. 다음 정보로 넘어가겠습니다.`;
      case 'AUM':
        return `총 운용자산 규모 ${value}로 확인했습니다.`;
      case 'GP 출자비율':
        return `GP 출자비율 ${value}로 등록했습니다. 정부 출자 요건을 충족하는 비율이네요.`;
      case '팀 구성원':
        return `팀 구성원 정보를 잘 받았습니다. 경험이 풍부한 팀이시네요!`;
      case '투자전략':
        return `투자 전략을 상세히 설명해주셔서 감사합니다. 명확한 방향성이 보입니다.`;
      case '과거 실적':
        return `과거 실적 정보를 확인했습니다. 좋은 성과를 보여주고 계시네요.`;
      default:
        return `${field.field} 정보를 확인했습니다.`;
    }
  };

  const completeCollection = () => {
    addAIMessage(`모든 정보 수집이 완료되었습니다! 🎉

다음 정보들이 수집되었습니다:
${Object.keys(collectedData).map(key => `• ${key}: ✓`).join('\n')}

이제 이 정보를 바탕으로 RFP 응답 문서를 자동 생성하겠습니다. 문서 생성 단계로 넘어가시겠어요?`);

    setTimeout(() => {
      onComplete();
    }, 3000);
  };

  const progress = Math.round((currentFieldIndex / requiredFields.length) * 100);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-[700px] flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">정보 수집 단계</h2>
            <p className="text-slate-600">AI가 필요한 정보를 하나씩 질문드립니다</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-slate-500">진행률</div>
            <div className="text-lg font-bold text-blue-600">{progress}%</div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-3xl ${
              message.type === 'user' 
                ? 'bg-blue-600 text-white rounded-lg rounded-br-sm' 
                : 'bg-slate-100 text-slate-900 rounded-lg rounded-bl-sm'
            } p-4`}>
              <div className="whitespace-pre-wrap">{message.content}</div>
              <div className={`text-xs mt-2 ${
                message.type === 'user' ? 'text-blue-100' : 'text-slate-500'
              }`}>
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        
        {isProcessing && (
          <div className="flex justify-start">
            <div className="bg-slate-100 text-slate-900 rounded-lg rounded-bl-sm p-4">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-600"></div>
                <span>처리 중...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-6 border-t border-slate-200">
        <form onSubmit={handleSubmit} className="flex space-x-4">
          <input
            type="text"
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            placeholder="답변을 입력해주세요..."
            className="flex-1 border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isProcessing || currentFieldIndex >= requiredFields.length}
          />
          <button
            type="submit"
            disabled={!currentInput.trim() || isProcessing || currentFieldIndex >= requiredFields.length}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            전송
          </button>
        </form>
      </div>
    </div>
  );
};

export default DataCollectionChat;