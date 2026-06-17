import { ChatContainer } from '@/components/chat/chat-container';

export default function ChatPage() {
  return (
    <main className="flex flex-col flex-1 min-h-0 h-svh w-full lg:h-[calc(100svh-2rem)] lg:max-w-7xl lg:mx-auto lg:px-6 lg:py-4">
      <div className="flex flex-col flex-1 min-h-0 h-full lg:rounded-2xl lg:border lg:border-border/60 lg:bg-background/80 lg:shadow-xl lg:overflow-hidden lg:backdrop-blur-sm">
        <ChatContainer />
      </div>
    </main>
  );
}
