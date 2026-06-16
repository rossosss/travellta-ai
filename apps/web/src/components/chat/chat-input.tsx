'use client';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useTelegram } from '@/components/telegram-provider';
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
  placeholder = 'Опишите ваш идеальный отпуск...',
}: ChatInputProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { haptic } = useTelegram();

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    haptic('light');
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
    <div className="border-t border-border/60 bg-background/80 backdrop-blur-xl p-3 pb-safe space-y-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => {
          haptic('medium');
          onLucky();
        }}
        disabled={disabled}
        className="w-full rounded-full border-dashed border-primary/40 text-primary hover:bg-primary/5 gap-2"
      >
        <Sparkles className="w-4 h-4" />
        Испытать удачу
      </Button>

      <div className="flex items-end gap-2">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className="min-h-[44px] max-h-32 resize-none rounded-2xl bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary/30"
        />
        <Button
          type="button"
          size="icon"
          onClick={handleSend}
          disabled={disabled || !value.trim()}
          className="h-11 w-11 rounded-full shrink-0"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
