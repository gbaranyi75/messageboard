import { NextResponse } from "next/server";

import { createMessage, listMessages, normalizeMessageContent } from "@/lib/messages";

export async function GET() {
  try {
    const data = await listMessages();

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Az üzenetek betöltése sikertelen.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { content?: unknown };
    const content = normalizeMessageContent(body.content);
    const message = await createMessage(content);

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Az üzenet mentése sikertelen.";

    return NextResponse.json(
      { error: message },
      { status: message.startsWith("Az üzenet") ? 400 : 500 }
    );
  }
}