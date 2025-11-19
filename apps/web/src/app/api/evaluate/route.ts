import { NextRequest, NextResponse } from "next/server";
import { cf } from "califi";
import { z } from "zod";

const PayloadSchema = z.object({
  expression: z
    .string()
    .trim()
    .min(1, "Expression is required.")
    .max(512, "Expression is too long."),
});

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const { expression } = PayloadSchema.parse(json);

    const result = await cf(expression);

    return NextResponse.json({ result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: error.issues[0]?.message ?? "Invalid request payload.",
        },
        { status: 400 }
      );
    }

    const message =
      error instanceof Error
        ? error.message || "Failed to evaluate expression."
        : "Failed to evaluate expression.";

    console.error("[califi] evaluation failed", message);

    return NextResponse.json(
      { error: "Unable to evaluate expression at this time." },
      { status: 500 }
    );
  }
}
