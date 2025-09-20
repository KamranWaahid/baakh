"use client";

import { Loader2, CheckCircle, RefreshCw, BookOpen } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { HesudharEntry } from "../types";

interface HesudharStepProps {
	loading: boolean;
	hesudharText: string;
	setHesudharText: (val: string) => void;
	checkHesudhar: () => void;
	syncHesudharFile: () => void;
	resetHesudharStep: () => void;
	hesudharResults: HesudharEntry[];
}

export default function HesudharStep(props: HesudharStepProps) {
	const {
		loading,
		hesudharText,
		setHesudharText,
		checkHesudhar,
		syncHesudharFile,
		resetHesudharStep,
		hesudharResults,
	} = props;

	return (
		<div className="max-w-4xl mx-auto">
			<Card className="bg-white border border-[#E5E5E5] rounded-lg shadow-sm mb-8">
				<CardHeader className="pb-4">
					<div className="space-y-4">
						<div className="flex items-center gap-3">
							<Badge variant="secondary" className="rounded-full px-3 py-1 text-xs font-medium bg-[#F4F4F5] text-[#1F1F1F] border border-[#E5E5E5]">
								<BookOpen className="w-4 h-4 mr-2" />
								Text Validation
							</Badge>
						</div>
						<div className="space-y-2">
							<h1 className="text-3xl font-bold text-[#1F1F1F]">Hesudhar Check</h1>
							<p className="text-lg text-[#6B6B6B] max-w-2xl">
								Check your Sindhi text for spelling errors using our comprehensive hesudhar dictionary
							</p>
						</div>
					</div>
				</CardHeader>
			</Card>

			<div className="space-y-8">
				<Card className="bg-white border-[#E5E5E5] rounded-lg shadow-sm">
					<CardHeader className="pb-4">
						<CardTitle className="text-xl font-bold text-[#1F1F1F] flex items-center">
							<BookOpen className="w-5 h-5 mr-2 text-[#1F1F1F]" />
							Text Input
						</CardTitle>
						<CardDescription className="text-[#6B6B6B]">Enter your Sindhi poetry text for validation</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						<div className="space-y-3">
							<Label htmlFor="hesudhar-text" dir="rtl" className="sindhi-label sindhi-text-lg text-[#1F1F1F] font-medium">سنڌي شاعري شامل ڪريو</Label>
							<Textarea
								id="hesudhar-text"
								placeholder="سنڌي شاعري شامل ڪريو"
								value={hesudharText}
								onChange={(e) => setHesudharText(e.target.value)}
								className="min-h-[120px] text-lg text-right sindhi-textarea sindhi-rtl border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] rounded-lg bg-white hover:bg-[#F4F4F5] transition-colors"
								dir="rtl"
								style={{ direction: 'rtl', textAlign: 'right' }}
							/>
						</div>

						<div className="flex gap-3">
							<Button onClick={checkHesudhar} disabled={loading || !hesudharText.trim()} className="flex-1 bg-[#1F1F1F] hover:bg-[#404040] text-white h-10 px-6 rounded-lg transition-colors" size="lg">
								{loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
								Check & Correct
							</Button>
							<Button onClick={syncHesudharFile} variant="outline" disabled={loading} className="border-[#E5E5E5] text-[#6B6B6B] hover:bg-[#F4F4F5] hover:border-[#E5E5E5] h-10 px-4 rounded-lg transition-colors" size="sm">
								<RefreshCw className="w-4 h-4 mr-2" />
								Sync
							</Button>
							<Button onClick={resetHesudharStep} variant="outline" disabled={loading} className="border-[#E5E5E5] text-[#6B6B6B] hover:bg-[#F4F4F5] hover:border-[#E5E5E5] h-10 px-4 rounded-lg transition-colors" size="lg">
								Reset
							</Button>
						</div>
					</CardContent>
				</Card>

				{hesudharResults.length > 0 && (
					<Card className="bg-white border-[#E5E5E5] rounded-lg shadow-sm">
						<CardHeader className="pb-4">
							<CardTitle className="text-xl font-bold text-[#1F1F1F] flex items-center">
								<BookOpen className="w-5 h-5 mr-2 text-[#1F1F1F]" />
								Dictionary Entries
							</CardTitle>
							<CardDescription className="text-[#6B6B6B]">Found spelling suggestions and corrections</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-3">
								{hesudharResults.slice(0, 5).map((result) => (
									<div key={result.id} className="flex items-center justify-between p-4 bg-[#F4F4F5] rounded-lg border border-[#E5E5E5] hover:bg-[#F9F9F9] transition-colors">
										<span className="text-[#1F1F1F] sindhi-text-base" dir="rtl">{result.word}</span>
										<span className="text-[#1F1F1F] font-medium">→ </span>
										<span className="text-[#1F1F1F] font-medium sindhi-text-base" dir="rtl">{result.correct}</span>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				)}
			</div>
		</div>
	);
}


