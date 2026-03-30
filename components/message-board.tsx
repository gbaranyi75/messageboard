"use client";

import { FormEvent, useEffect, useState, useTransition } from "react";

type Message = {
  id: number;
  content: string;
  created_at: string;
};

type MessageResponse = {
  data?: Message[];
  message?: Message;
  error?: string;
};

const MAX_LENGTH = 500;

function formatTimestamp(value: string) {
  const date = new Date(value);

  return new Intl.DateTimeFormat("hu-HU", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function MessageBoard() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("Kapcsolódás az adatbázishoz...");
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  async function loadMessages() {
    setIsLoading(true);

    try {
      const response = await fetch("/api/messages", { cache: "no-store" });
      const payload = (await response.json()) as MessageResponse;

      if (!response.ok || !payload.data) {
        throw new Error(payload.error ?? "Az üzenetek betöltése sikertelen.");
      }

      setMessages(payload.data);
      setStatus("");
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : "Ismeretlen hiba történt."
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadMessages();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedContent = content.trim();

    if (!trimmedContent) {
      setStatus("Az üzenet nem lehet üres.");
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch("/api/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content: trimmedContent }),
        });

        const payload = (await response.json()) as MessageResponse;

        if (!response.ok || !payload.message) {
          throw new Error(payload.error ?? "Az üzenet mentése sikertelen.");
        }

        setMessages((currentMessages) => [payload.message!, ...currentMessages]);
        setContent("");
        setStatus("Az üzenet mentve lett.");
      } catch (error) {
        setStatus(
          error instanceof Error ? error.message : "Ismeretlen hiba történt."
        );
      }
    });
  }

  async function handleDelete(id: number) {
    startTransition(async () => {
      try {
        const response = await fetch(`/api/messages/${id}`, {
          method: "DELETE",
        });

        const payload = (await response.json()) as MessageResponse;

        if (!response.ok) {
          throw new Error(payload.error ?? "A törlés sikertelen.");
        }

        setMessages((currentMessages) =>
          currentMessages.filter((message) => message.id !== id)
        );
        setStatus("Az üzenet törölve lett.");
      } catch (error) {
        setStatus(
          error instanceof Error ? error.message : "Ismeretlen hiba történt."
        );
      }
    });
  }

  const remainingCharacters = MAX_LENGTH - content.length;

  return (
    <section className="relative w-full max-w-5xl overflow-hidden rounded-[2rem] border border-border bg-surface shadow-[0_28px_80px_rgba(71,52,36,0.12)] backdrop-blur-xl">
      <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top,rgba(198,93,51,0.18),transparent_60%)]" />
      <div className="grid gap-8 p-5 sm:p-8 lg:grid-cols-[1.05fr_0.95fr] lg:p-10">
        <div className="relative flex flex-col justify-between rounded-[1.75rem] border border-border bg-surface-strong p-6 sm:p-8">
          <div className="space-y-6">
            <div className="space-y-4">
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-accent-strong">
                Public Messageboard
              </p>
              <h1 className="max-w-lg text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                Írj egy üzenetet, és azonnal megjelenik a falon.
              </h1>
              <p className="max-w-xl text-base leading-7 text-muted sm:text-lg">
                Next.js App Router, Supabase és Vercel környezetre szabott,
                minimál felületű interjúprojekt.
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-foreground">
                  Üzenet
                </span>
                <textarea
                  value={content}
                  onChange={(event) => setContent(event.target.value.slice(0, MAX_LENGTH))}
                  rows={6}
                  maxLength={MAX_LENGTH}
                  placeholder="Írj valamit, amit minden látogató látni fog..."
                  className="min-h-40 w-full resize-none rounded-[1.25rem] border border-border bg-white/70 px-4 py-3 text-base text-foreground outline-none transition focus:border-accent focus:ring-4 focus:ring-[rgba(198,93,51,0.12)]"
                />
              </label>

              <div className="flex items-center justify-between gap-3 text-sm text-muted">
                <span>{remainingCharacters} karakter maradt</span>
                <span>{isPending ? "Folyamatban..." : "Nyilvános mentés"}</span>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="inline-flex h-12 items-center justify-center rounded-full bg-accent px-6 text-sm font-semibold text-white transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPending ? "Mentés..." : "Mentés"}
              </button>
            </form>
          </div>

          <div className="mt-6 rounded-[1.25rem] border border-border bg-white/55 px-4 py-3 text-sm leading-6 text-muted">
            {status || "A fal publikus, az új bejegyzések a lista tetejére kerülnek."}
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-border bg-[#1f2420] p-6 text-[#f8f1e8] sm:p-8">
          <div className="mb-6 flex items-end justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-[#d8a58f]">
                Live Feed
              </p>
              <h2 className="mt-2 text-2xl font-semibold">Mentett üzenetek</h2>
            </div>
            <div className="rounded-full border border-white/10 px-3 py-1 text-sm text-white/70">
              {messages.length} db
            </div>
          </div>

          <div className="space-y-4">
            {isLoading ? (
              <div className="rounded-[1.25rem] border border-white/10 bg-white/5 px-4 py-6 text-sm text-white/70">
                Üzenetek betöltése...
              </div>
            ) : null}

            {!isLoading && messages.length === 0 ? (
              <div className="rounded-[1.25rem] border border-dashed border-white/15 bg-white/5 px-4 py-6 text-sm leading-6 text-white/70">
                Még nincs mentett üzenet. Az első bejegyzés a bal oldali űrlapból hozható létre.
              </div>
            ) : null}

            {messages.map((message) => (
              <article
                key={message.id}
                className="rounded-[1.25rem] border border-white/10 bg-white/6 p-4 shadow-[0_10px_30px_rgba(0,0,0,0.15)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <p className="whitespace-pre-wrap text-sm leading-7 text-[#fcf7f1]">
                    {message.content}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleDelete(message.id)}
                    disabled={isPending}
                    className="shrink-0 rounded-full border border-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#ffb59a] transition hover:border-[#ffb59a] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Törlés
                  </button>
                </div>
                <p className="mt-4 text-xs uppercase tracking-[0.2em] text-white/45">
                  {formatTimestamp(message.created_at)}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}