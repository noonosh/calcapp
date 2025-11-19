"use client";

import Link from "next/link";
import { Calculator, Sparkles } from "lucide-react";

import { ModeToggle } from "./mode-toggle";

export default function Header() {
	return (
		<header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur">
			<div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 md:px-8">
				<Link
					href="/"
					className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/70 px-4 py-2 text-sm font-medium shadow-sm transition hover:border-primary/40"
				>
					<span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
						<Calculator className="size-4" />
					</span>
					<span className="flex flex-col leading-none">
						<span className="text-base font-semibold tracking-tight">calc</span>
						<span className="text-xs text-muted-foreground">
							Powered by califi
						</span>
					</span>
				</Link>
				<div className="flex items-center gap-2">
					<div className="hidden items-center gap-2 rounded-full border border-border/60 bg-card/70 px-3 py-1 text-xs text-muted-foreground shadow-sm sm:flex">
						<Sparkles className="size-3 text-primary" />
						<span>AI-native math engine</span>
					</div>
					<ModeToggle />
				</div>
			</div>
		</header>
	);
}
