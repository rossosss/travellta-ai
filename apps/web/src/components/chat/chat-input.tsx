'use client';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Sparkles } from 'lucide-react';
import { useRef, useState } from 'react';

interface ChatInputProps {
  onSend: (message: string) => void;
  onLucky: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({
  onSend,
  onLucky,
  disabled,
  placeholder = 'Откуда и куда? Например: из Москвы в Сочи 25.06–28.06',
}: ChatInputProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="shrink-0 border-t border-border/60 bg-background/80 backdrop-blur-xl p-3 lg:p-4 pb-safe">
      <div className="max-w-5xl mx-auto w-full space-y-2 lg:space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onLucky}
            disabled={disabled}
            className="w-full lg:w-auto lg:shrink-0 rounded-full border-dashed border-primary/40 text-primary hover:bg-primary/5 gap-2 lg:px-5"
          >
            <Sparkles className="w-4 h-4" />
            Испытать удачу
          </Button>

          <div className="flex flex-1 items-end gap-2 lg:gap-3 min-w-0">
            <Textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              rows={1}
              className="min-h-[44px] lg:min-h-[48px] max-h-32 resize-none rounded-2xl bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary/30 text-sm lg:text-base"
            />
            <Button
              type="button"
              size="icon"
              onClick={handleSend}
              disabled={disabled || !value.trim()}
              className="h-11 w-11 lg:h-12 lg:w-12 rounded-full shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
