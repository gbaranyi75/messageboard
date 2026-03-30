import { MessageBoard } from "@/components/message-board";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
      <MessageBoard />
    </main>
  );
}
