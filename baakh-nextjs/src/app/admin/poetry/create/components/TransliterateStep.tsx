"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, Loader2 } from "lucide-react";
import type { TransliteratedCoupletItem } from "../types";

interface TransliterateStepProps {
	loading: boolean;
	transliteratedCouplets: TransliteratedCoupletItem[];
	setTransliteratedCouplets: (val: TransliteratedCoupletItem[]) => void;
	availableTags: { id: number; slug: string; english: { title: string } }[];
	transliterationCompleted: boolean;
	transliterateAllCouplets: () => Promise<void> | void;
	saveTransliteratedCouplets: () => void;
}

export default function TransliterateStep(props: TransliterateStepProps) {
	const {
		loading,
		transliteratedCouplets,
		setTransliteratedCouplets,
		availableTags,
		transliterationCompleted,
		transliterateAllCouplets,
		saveTransliteratedCouplets,
	} = props;

	return (
		<div className="max-w-4xl mx-auto space-y-6">
			<Card className="bg-white border border-gray-200 rounded-lg shadow-sm">
				<CardHeader>
					<CardTitle className="text-xl font-bold text-[#1F1F1F]">Transliteration</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center gap-3">
						<Button onClick={() => transliterateAllCouplets()} disabled={loading} className="bg-[#1F1F1F] hover:bg-[#404040] text-white">
							{loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
							Transliterate Couplets
						</Button>
						<Button onClick={saveTransliteratedCouplets} variant="outline" disabled={!transliterationCompleted}>
							Save
						</Button>
					</div>
				</CardContent>
			</Card>

			{transliteratedCouplets.length > 0 && (
				<Card className="bg-white border border-gray-200 rounded-lg shadow-sm">
					<CardContent className="space-y-6">
						<div className="grid gap-6">
							{transliteratedCouplets.map((couplet, index) => (
								<div key={couplet.id} className="p-4 border border-gray-200 rounded-lg bg-white">
									<div className="flex items-center justify-between mb-4">
										<h5 className="text-lg font-semibold text-gray-900">Couplet #{index + 1}</h5>
									</div>

									<div className="space-y-4 mb-6">
										<div className="space-y-2">
											<Label htmlFor={`transliterated-text-${couplet.id}`} className="text-sm font-semibold text-gray-700">English/Roman Text</Label>
											<Textarea id={`transliterated-text-${couplet.id}`} placeholder="Edit transliterated text if needed..." value={couplet.romanText} onChange={(e) => {
												const updatedCouplets = transliteratedCouplets.map(c => c.id === couplet.id ? { ...c, romanText: e.target.value } : c);
												setTransliteratedCouplets(updatedCouplets);
											}} className="border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-lg text-lg" style={{ minHeight: '120px' }} />
										</div>

										<div className="space-y-2">
											<Label htmlFor={`transliterated-slug-${couplet.id}`} className="text-sm font-semibold text-gray-700">Couplet Slug</Label>
											<input id={`transliterated-slug-${couplet.id}`} value={couplet.slug} readOnly className="border-gray-300 bg-gray-50 cursor-not-allowed font-ambile rounded-lg px-3 py-2 w-full" />
										</div>
									</div>

									<div className="space-y-4">
										<div className="flex items-center justify-between">
											<Label className="text-sm font-semibold text-gray-700">Couplet Tags</Label>
											<span className="text-xs text-gray-500">{couplet.tags.length} tags selected</span>
										</div>
										{couplet.tags.length > 0 && (
											<div className="flex flex-wrap gap-2">
												{couplet.tags.map((tagSlug, i) => {
													const selectedColors = ['bg-blue-500 text-white border-blue-500 hover:bg-blue-600','bg-green-500 text-white border-green-500 hover:bg-green-600','bg-purple-500 text-white border-purple-500 hover:bg-purple-600','bg-pink-500 text-white border-pink-500 hover:bg-pink-600','bg-orange-500 text-white border-orange-500 hover:bg-orange-600','bg-teal-500 text-white border-teal-500 hover:bg-teal-600','bg-indigo-500 text-white border-indigo-500 hover:bg-indigo-600','bg-rose-500 text-white border-rose-500 hover:bg-rose-600'];
													const colorClass = selectedColors[i % selectedColors.length];
													return (
														<div key={tagSlug} className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 ${colorClass}`}>
															{availableTags.find(t => t.slug === tagSlug)?.english.title || tagSlug}
														</div>
													);
												})}
											</div>
										)}
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}


