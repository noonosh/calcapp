"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Clock,
  Copy,
  History as HistoryIcon,
  Sparkles,
} from "lucide-react";

type HistoryEntry = {
  id: string;
  expression: string;
  result: string;
  evaluatedAt: string;
};

type ExampleGroup = {
  label: string;
  items: string[];
};

const HISTORY_STORAGE_KEY = "calcapp:history";

const exampleGroups: ExampleGroup[] = [
  {
    label: "Standard Math",
    items: [
      "2 + 2 * 3",
      "sqrt(144)",
      "sin(pi / 2)",
      "10^3",
      "log(100)",
      "abs(-42)",
    ],
  },
  {
    label: "Natural Language",
    items: [
      "10% of 5",
      "square root of 144",
      "25 plus 17",
      "area of a circle with radius 5",
      "convert 45 degrees to radians",
    ],
  },
];

const operations = [
  { symbol: "+", description: "Addition" },
  { symbol: "-", description: "Subtraction" },
  { symbol: "×", description: "Multiplication" },
  { symbol: "÷", description: "Division" },
  { symbol: "^", description: "Exponentiation" },
  { symbol: "sqrt()", description: "Square root" },
  { symbol: "log()", description: "Logarithm (base 10)" },
  { symbol: "sin()", description: "Sine (radians)" },
  { symbol: "cos()", description: "Cosine (radians)" },
  { symbol: "tan()", description: "Tangent (radians)" },
  { symbol: "abs()", description: "Absolute value" },
  { symbol: "()", description: "Parentheses grouping" },
];

export default function Home() {
  const [expression, setExpression] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [hasHydrated, setHasHydrated] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    try {
      const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (stored) {
        const parsed: HistoryEntry[] = JSON.parse(stored);
        setHistory(parsed);
      }
    } catch (error) {
      console.warn("Failed to load history from storage", error);
    }
  }, [hasHydrated]);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
      console.warn("Failed to persist history", error);
    }
  }, [history, hasHydrated]);

  const examples = useMemo(
    () =>
      exampleGroups.map((group) => ({
        ...group,
        items: group.items.slice(0, 6),
      })),
    []
  );

  const handleEvaluate = async () => {
    if (!expression.trim()) {
      toast.error("Please enter an expression to evaluate.");
      return;
    }

    setIsEvaluating(true);

    try {
      const response = await fetch("/api/evaluate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ expression }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof payload?.error === "string"
            ? payload.error
            : "Something went wrong while evaluating the expression."
        );
      }

      const evaluated = String(payload.result ?? "").trim();

      if (!evaluated) {
        throw new Error("Received an empty response from califi.");
      }

      setResult(evaluated);

      const entry: HistoryEntry = {
        id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36),
        expression: expression.trim(),
        result: evaluated,
        evaluatedAt: new Date().toISOString(),
      };

      setHistory((prev) => [entry, ...prev].slice(0, 25));
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message || "Unable to evaluate expression."
          : "Unable to evaluate expression.";
      toast.error(message);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleExampleSelect = (value: string) => {
    setExpression(value);
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.setSelectionRange(value.length, value.length);
    }, 0);
  };

  const handleHistorySelect = (entry: HistoryEntry) => {
    setExpression(entry.expression);
    setResult(entry.result);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const clearHistory = () => {
    setHistory([]);
    toast.success("History cleared.");
  };

  const copyResultToClipboard = async () => {
    if (!result) return;

    try {
      await navigator.clipboard.writeText(result);
      toast.success("Result copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy to clipboard.");
    }
  };

  return (
    <div className="relative flex-1 overflow-y-auto">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(15,23,42,0.08),transparent_60%)] dark:bg-[radial-gradient(circle_at_top,rgba(148,163,184,0.14),transparent_65%)]" />
      <main className="relative mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 pb-16 pt-12 md:px-8">
        <section className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/70 px-4 py-1.5 text-sm text-muted-foreground shadow-sm backdrop-blur">
            <Sparkles className="size-4 text-primary" />
            <span>Powered by califi · Natural & Symbolic Math</span>
          </div>
          <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            Mathematical Expression Evaluator
          </h1>
          <p className="mt-4 max-w-2xl text-pretty text-lg text-muted-foreground">
            Type a formula or ask in plain language. Califi interprets and
            solves expressions with clarity so you can stay focused on the math
            that matters.
          </p>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.75fr_1fr]">
          <div className="space-y-6">
            <Card className="border-border/70 shadow-md md:rounded-2xl">
              <CardHeader className="gap-4 px-6 pb-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="space-y-1 text-left">
                  <CardTitle className="text-2xl font-semibold">
                    Expression
                  </CardTitle>
                  <CardDescription>
                    Supports symbolic notation and conversational inputs.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-5 pb-6">
                <div className="space-y-2">
                  <Input
                    ref={inputRef}
                    value={expression}
                    onChange={(event) => setExpression(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        handleEvaluate();
                      }
                    }}
                    autoComplete="off"
                    spellCheck={false}
                    placeholder="e.g. 3 * (5 + sqrt(16)) or “What is 15% of 920?”"
                    className="h-12 text-base md:text-lg"
                  />
                  <p className="text-sm text-muted-foreground">
                    Try natural queries like{" "}
                    <span className="font-medium">
                      “integral of sin(x) from 0 to pi”
                    </span>{" "}
                    or <span className="font-medium">“5 plus 17 squared”</span>.
                  </p>
                </div>
                <div className="space-y-3 rounded-xl border border-border/80 bg-muted/30 p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <Sparkles className="size-4 text-primary" />
                      Result
                    </div>
                    <div className="flex items-center gap-2">
                      {isEvaluating ? (
                        <span className="text-xs text-muted-foreground">
                          Evaluating…
                        </span>
                      ) : null}
                      {result && (
                        <button
                          type="button"
                          onClick={copyResultToClipboard}
                          className="flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70"
                          title="Copy result to clipboard"
                        >
                          <Copy className="size-4" />
                          <span>Copy to Clipboard</span>
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="min-h-[80px]">
                    {result ? (
                      <p className="text-pretty text-3xl font-semibold tracking-tight">
                        {result}
                      </p>
                    ) : (
                      <p className="text-muted-foreground">
                        The evaluated answer will appear here.
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  disabled={isEvaluating || !expression.trim()}
                  onClick={handleEvaluate}
                  className="h-12 w-full text-base font-semibold"
                >
                  {isEvaluating ? (
                    <span className="flex items-center gap-2">
                      <span className="size-3 animate-ping rounded-full bg-primary" />
                      Evaluating with califi…
                    </span>
                  ) : (
                    <>
                      Evaluate
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border/60 shadow-sm md:rounded-2xl">
              <CardHeader className="px-6 pb-3">
                <CardTitle className="text-lg font-semibold">
                  Examples
                </CardTitle>
                <CardDescription>
                  Tap to populate the input and explore the evaluator.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 pb-6">
                {examples.map((group) => (
                  <div key={group.label} className="space-y-3">
                    <p className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                      {group.label}
                    </p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {group.items.map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => handleExampleSelect(item)}
                          className={cn(
                            "group rounded-xl border border-border/70 bg-card px-3.5 py-3 text-left text-sm shadow-xs transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70"
                          )}
                        >
                          <span className="block font-mono text-[0.95rem] text-foreground">
                            {item}
                          </span>
                          <span className="mt-1 block text-xs text-muted-foreground">
                            Tap to try with califi
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-border/70 shadow-md md:rounded-2xl">
              <CardHeader className="flex-row items-start justify-between gap-4 px-6 pb-4">
                <div>
                  <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                    <HistoryIcon className="size-5 text-primary" />
                    History
                  </CardTitle>
                  <CardDescription>
                    Your recent evaluations (saved locally).
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={!history.length}
                  onClick={clearHistory}
                  className="gap-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear
                </Button>
              </CardHeader>
              <CardContent className="pb-6">
                <div className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
                  {history.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-border/70 bg-muted/40 p-6 text-center text-sm text-muted-foreground">
                      No evaluations yet. Run your first expression to build a
                      history.
                    </div>
                  ) : (
                    history.map((entry) => (
                      <button
                        key={entry.id}
                        type="button"
                        onClick={() => handleHistorySelect(entry)}
                        className="w-full rounded-xl border border-transparent bg-muted/40 p-4 text-left transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-mono text-sm text-foreground">
                              {entry.expression}
                            </p>
                            <p className="font-mono text-lg font-semibold text-primary">
                              = {entry.result}
                            </p>
                          </div>
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="size-3.5" />
                            {new Date(entry.evaluatedAt).toLocaleTimeString(
                              [],
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60 shadow-sm md:rounded-2xl">
              <CardHeader className="px-6 pb-3">
                <CardTitle className="text-lg font-semibold">
                  Supported Operations
                </CardTitle>
                <CardDescription>
                  Califi understands symbolic operators and natural language.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 pb-6">
                {operations.map(({ symbol, description }) => (
                  <div
                    key={symbol}
                    className="flex items-center gap-3 rounded-xl border border-border/80 bg-card px-4 py-3 shadow-xs"
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 font-mono text-base font-semibold text-primary">
                      {symbol.replace("()", "")}
                    </span>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="text-sm font-semibold text-foreground">
                        {description}
                      </span>
                      <span className="truncate text-xs font-mono text-muted-foreground">
                        {symbol}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}
