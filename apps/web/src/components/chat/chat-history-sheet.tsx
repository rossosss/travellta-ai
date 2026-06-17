'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ChatHistoryPanel } from '@/components/chat/chat-history-panel';
import type { ChatSessionSummary } from '@/types/chat';

interface ChatHistorySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessions: ChatSessionSummary[];
  activeSessionId?: string;
  onSelectSession: (sessionId: string) => void;
  onNewChat: () => void;
  loading?: boolean;
}

export function ChatHistorySheet({
  open,
  onOpenChange,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  loading,
}: ChatHistorySheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[min(100vw-2rem,320px)] p-0 flex flex-col lg:hidden">
        <SheetHeader className="sr-only">
          <SheetTitle>История чатов</SheetTitle>
        </SheetHeader>
        <ChatHistoryPanel
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelectSession={onSelectSession}
          onNewChat={onNewChat}
          loading={loading}
          onAfterSelect={() => onOpenChange(false)}
        />
      </SheetContent>
    </Sheet>
  );
}
