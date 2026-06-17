import { cn } from '@/lib/utils';
import type { ChatMessage } from '@/types/chat';
import { TripResultCard } from './trip-result-card';

interface MessageBubbleProps {
  message: ChatMessage;
  onOptionSelect?: (questionId: string, option: string) => void;
}

export function MessageBubble({ message, onOptionSelect }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  if (message.type === 'trip_result' && message.metadata?.packages) {
    return (
      <div className="flex flex-col gap-3 lg:gap-4 w-full">
        <div className="flex justify-start">
          <div className="bg-card border border-border/60 rounded-2xl rounded-bl-md px-4 py-2.5 lg:px-5 lg:py-3 max-w-[85%] lg:max-w-[70%] shadow-sm">
            <p className="text-sm lg:text-base leading-relaxed">{message.content}</p>
          </div>
        </div>
        <div
          className={`grid gap-4 lg:gap-5 ${
            message.metadata.packages.length > 1 ? 'lg:grid-cols-2' : 'lg:grid-cols-1'
          }`}
        >
          {message.metadata.packages.map((pkg) => (
            <TripResultCard key={pkg.id} trip={pkg} />
          ))}
        </div>
      </div>
    );
  }

  if (message.type === 'question' && message.metadata?.question) {
    const { question } = message.metadata;
    return (
      <div className="flex justify-start w-full">
        <div className="bg-card border border-border/60 rounded-2xl rounded-bl-md px-4 py-3 lg:px-5 lg:py-4 max-w-[90%] lg:max-w-xl shadow-sm">
          <p className="text-sm lg:text-base font-medium mb-3">{message.content}</p>
          <div className="flex flex-wrap gap-2">
            {question.options.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => onOptionSelect?.(question.id, option)}
                className={cn(
                  'text-xs lg:text-sm px-3 py-2 lg:px-4 lg:py-2.5 rounded-full',
                  'bg-primary/10 text-primary hover:bg-primary/20',
                  'transition-colors active:scale-95',
                  'border border-primary/20',
                )}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (message.type === 'loading') {
    return (
      <div className="flex justify-start">
        <div className="bg-card border border-border/60 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:0ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:300ms]" />
            </span>
            <p className="text-sm text-muted-foreground">{message.content}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'rounded-2xl px-4 py-2.5 lg:px-5 lg:py-3 max-w-[85%] lg:max-w-[65%] text-sm lg:text-base leading-relaxed shadow-sm',
          isUser
            ? 'bg-primary text-primary-foreground rounded-br-md'
            : 'bg-card border border-border/60 rounded-bl-md',
        )}
      >
        {message.content}
      </div>
    </div>
  );
}
