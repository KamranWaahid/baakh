"use client";

import { Loader2, RefreshCw, Search, AlertCircle, Languages } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

interface RomanizerStepProps {
	loading: boolean;
	romanText: string;
	setRomanText: (val: string) => void;
	syncError: string | null;
	wordsNotInDictionary: string[];
	newRomanization: { [key: string]: string };
	setNewRomanization: (val: { [key: string]: string }) => void;
	syncRomanizerFile: () => void;
	checkRomanizer: () => void;
	refreshWordsNotInDictionary: () => void;
	addNewRomanization: (word: string, roman: string) => void;
}

export default function RomanizerStep(props: RomanizerStepProps) {
	const {
		loading,
		romanText,
		setRomanText,
		syncError,
		wordsNotInDictionary,
		newRomanization,
		setNewRomanization,
		syncRomanizerFile,
		checkRomanizer,
		refreshWordsNotInDictionary,
		addNewRomanization,
	} = props;

	return (
		<div className="max-w-4xl mx-auto">
			<Card className="bg-white border-[#E5E5E5] rounded-lg shadow-sm">
				<CardHeader className="pb-4">
					<CardTitle className="text-xl font-bold text-[#1F1F1F] flex items-center">
						<Languages className="w-5 h-5 mr-2 text-[#1F1F1F]" />
						Romanizer
					</CardTitle>
					<CardDescription className="text-[#6B6B6B]">Convert Sindhi text to romanized equivalents</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="space-y-3">
						<Label htmlFor="roman-text">Sindhi text for romanization</Label>
						<Textarea id="roman-text" placeholder="Enter Sindhi text to find roman equivalents..." value={romanText} onChange={(e) => setRomanText(e.target.value)} className="min-h-[120px] text-lg border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] rounded-lg bg-white hover:bg-[#F4F4F5] transition-colors" />
					</div>

					<div className="space-y-3">
						<div className="flex items-center justify-between">
							<div className="space-y-1">
								<p className="text-sm text-[#6B6B6B]">Dictionary Sync</p>
								<p className="text-xs text-[#6B6B6B]">Sync the latest romanizer mappings from the database</p>
							</div>
							<Button onClick={syncRomanizerFile} variant="outline" disabled={loading} size="sm" className="border-[#E5E5E5] text-[#6B6B6B] hover:bg-[#F4F4F5] hover:border-[#E5E5E5] transition-colors">
								{loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
								{loading ? 'Syncing...' : 'Sync'}
							</Button>
						</div>
					</div>

					<div className="flex gap-3">
						<Button onClick={checkRomanizer} disabled={loading || !romanText.trim()} className="flex-1 bg-[#1F1F1F] hover:bg-[#404040] text-white h-10 px-6 rounded-lg transition-colors" size="lg">
							{loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
							Check Romanizer
						</Button>
					</div>

					{syncError && (
						<div className="bg-red-50 border border-red-200 rounded-lg p-4">
							<div className="flex items-start gap-3">
								<div className="text-red-600 mt-1">
									<AlertCircle className="w-4 h-4" />
								</div>
								<div className="space-y-2">
									<h5 className="font-medium text-red-800">Sync Error</h5>
									<p className="text-sm text-red-700">{syncError}</p>
									<p className="text-xs text-red-600">💡 This usually means the romanizer sync service is not available in your current environment. You can still use the romanizer with existing mappings.</p>
								</div>
							</div>
						</div>
					)}

					{wordsNotInDictionary.length > 0 && (
						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<h4 className="font-medium flex items-center gap-2 text-[#1F1F1F]">
									<AlertCircle className="w-4 h-4" />
									Words Not in Dictionary ({wordsNotInDictionary.length})
								</h4>
								<Button onClick={refreshWordsNotInDictionary} variant="outline" size="sm" className="flex items-center gap-2 border-[#E5E5E5] text-[#6B6B6B] hover:bg-[#F4F4F5] hover:border-[#E5E5E5] transition-colors">
									<RefreshCw className="w-4 h-4" />
									Refresh List
								</Button>
							</div>
							<p className="text-sm text-[#6B6B6B]">Add romanizations for these words. After adding, they will be applied to your text.</p>
							<div className="space-y-3">
								{wordsNotInDictionary.map((word, index) => (
									<div key={index} className="flex items-center gap-3 p-3 bg-[#F4F4F5] rounded-lg border border-[#E5E5E5]">
										<span className="sindhi-text-base text-[#1F1F1F]" dir="rtl">{word}</span>
										<span className="text-[#6B6B6B] font-medium">→</span>
										<Input placeholder="Enter romanization..." value={newRomanization[word] || ''} onChange={(e) => setNewRomanization({ ...newRomanization, [word]: e.target.value })} className="flex-1 max-w-48 font-ambile border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] bg-white hover:bg-[#F9F9F9] transition-colors" />
										<Button onClick={() => addNewRomanization(word, newRomanization[word] || '')} disabled={!newRomanization[word]?.trim()} size="sm" variant="outline" className="border-[#E5E5E5] text-[#6B6B6B] hover:bg-[#F4F4F5] hover:border-[#E5E5E5] transition-colors">Add</Button>
									</div>
								))}
							</div>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}


