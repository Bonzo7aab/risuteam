import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

/**
 * Returns the first Zod error message from a ZodError (for forms/API).
 */
export function firstZodMessage(err: z.ZodError): string {
  const first = err.errors[0];
  return first?.message ?? "Wystąpił błąd walidacji.";
}

/**
 * Parse and validate request body with a Zod schema.
 * On failure returns a NextResponse with 400 and { error: string }.
 */
export async function parseBody<T>(
  req: NextRequest,
  schema: z.ZodSchema<T>
): Promise<{ data: T } | { error: NextResponse }> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return {
      error: NextResponse.json(
        { error: "Nieprawidłowy format JSON." },
        { status: 400 }
      ),
    };
  }

  const result = schema.safeParse(body);
  if (result.success) {
    return { data: result.data };
  }

  const message = firstZodMessage(result.error);
  return {
    error: NextResponse.json({ error: message }, { status: 400 }),
  };
}
