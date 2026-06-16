import { ChatContainer } from '@/components/chat/chat-container';

export default function Home() {
  return (
    <main className="flex flex-col flex-1 min-h-0 h-dvh max-w-lg mx-auto w-full">
      <ChatContainer />
    </main>
  );
}
