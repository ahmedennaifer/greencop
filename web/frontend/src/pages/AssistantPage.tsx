import React, { useState, useRef, useEffect } from 'react';
import { marked } from 'marked';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Send, Bot, User, Loader } from 'lucide-react';

marked.setOptions({
  gfm: true,
  breaks: true,
});

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const AssistantPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    document.title = 'GreenCop | Assistant';

    const warmUpAssistant = async () => {
      try {
        await fetch('https://assistant-804862180664.us-central1.run.app/api/v1/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: 'hello' }),
        });
      } catch (error) {
        console.log('Warming up assistant');
      }
    };

    warmUpAssistant();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('https://assistant-804862180664.us-central1.run.app/api/v1/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from AI assistant');
      }

      const data = await response.json();

      const cleanContent = data.response.includes('|') && !data.response.startsWith('|')
        ? data.response.replace(/\n\n/g, '\n').trim()
        : data.response;

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: cleanContent,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <DashboardLayout>
      <div className="h-full flex flex-col p-6">
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-gray-900">Assistant</h1>
          <p className="text-sm text-gray-600">AI-powered sensor monitoring and Green IT analysis</p>
        </div>

        <Card className="flex-1 flex flex-col min-h-0">
          <CardHeader className="border-b flex-shrink-0">
            <CardTitle className="flex items-center space-x-2">
              <Bot className="w-6 h-6 text-green-600" />
              <span>GreenCop Assistant</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-0 min-h-0">
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-gray-500 mt-8">
                  <Bot className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-sm">Ask me about sensor data, Green IT recommendations, or ASHRAE compliance</p>
                </div>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start space-x-3 ${
                    message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}
                >
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                      message.role === 'user'
                        ? 'bg-green-600'
                        : 'bg-gradient-to-br from-purple-500 to-green-500'
                    }`}
                  >
                    {message.role === 'user' ? (
                      <User className="w-5 h-5 text-white" />
                    ) : (
                      <Bot className="w-5 h-5 text-white" />
                    )}
                  </div>

                  <div className={`flex-1 min-w-0 ${message.role === 'user' ? 'flex justify-end' : ''}`}>
                    <div
                      className={`rounded-2xl px-4 py-3 break-words ${
                        message.role === 'user'
                          ? 'bg-green-600 text-white max-w-md'
                          : 'bg-gray-100 text-gray-900 max-w-full'
                      }`}
                    >
                      <div
                        className={`text-sm prose prose-sm max-w-none ${message.role === 'user' ? 'text-white prose-invert' : 'text-gray-900'}`}
                        dangerouslySetInnerHTML={{ __html: marked(message.content) }}
                      />
                      <p
                        className={`text-xs mt-2 ${
                          message.role === 'user' ? 'text-green-100' : 'text-gray-500'
                        }`}
                      >
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-green-500 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="rounded-2xl px-4 py-3 bg-gray-100">
                      <Loader className="w-5 h-5 text-gray-600 animate-spin" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="border-t p-4 flex-shrink-0">
              <div className="flex items-end space-x-3">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about sensors, get Green IT recommendations, check ASHRAE compliance..."
                  className="flex-1 min-h-[60px] max-h-[200px] px-4 py-3 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="px-6 py-3 h-[60px]"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Press Enter to send, Shift+Enter for new line
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AssistantPage;
