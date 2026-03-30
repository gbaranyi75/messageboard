import { NextResponse } from "next/server";

import { deleteMessage } from "@/lib/messages";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const numericId = Number(id);

    if (!Number.isInteger(numericId) || numericId < 1) {
      return NextResponse.json({ error: "Érvénytelen azonosító." }, { status: 400 });
    }

    await deleteMessage(numericId);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "A törlés sikertelen.",
      },
      { status: 500 }
    );
  }
}