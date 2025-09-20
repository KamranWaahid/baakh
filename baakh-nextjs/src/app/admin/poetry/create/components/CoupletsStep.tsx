"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X, Quote } from "lucide-react";
import type { CoupletItem } from "../types";

interface CoupletsStepProps {
	couplets: CoupletItem[];
	addCouplet: () => void;
	removeCouplet: (id: string) => void;
	updateCouplet: (id: string, field: 'text' | 'slug' | 'tags', value: string | string[]) => void;
}

export default function CoupletsStep(props: CoupletsStepProps) {
	const { couplets, addCouplet, removeCouplet, updateCouplet } = props;

	return (
		<div className="max-w-4xl mx-auto">
			<Card className="bg-white border-[#E5E5E5] rounded-lg shadow-sm">
				<CardHeader>
					<CardTitle className="text-xl font-bold text-[#1F1F1F] flex items-center">
						<Quote className="w-5 h-5 mr-2 text-[#1F1F1F]" />
						Couplets
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="flex justify-end">
						<Button onClick={addCouplet} variant="outline" className="border-[#E5E5E5] text-[#1F1F1F] hover:bg-[#F4F4F5]">
							<Plus className="w-4 h-4 mr-2" /> Add Couplet
						</Button>
					</div>

					<div className="space-y-6">
						{couplets.map((couplet, index) => (
							<div key={couplet.id} className="p-4 border border-gray-200 rounded-lg bg-white">
								<div className="flex items-center justify-between mb-4">
									<h5 className="text-lg font-semibold text-gray-900">Couplet #{index + 1}</h5>
									<Button size="sm" variant="outline" onClick={() => removeCouplet(couplet.id)} className="text-red-600 border-red-200 hover:bg-red-50">
										<X className="w-4 h-4" />
									</Button>
								</div>

								<div className="space-y-4">
									<div className="space-y-2">
										<Label htmlFor={`couplet-text-${couplet.id}`} className="text-sm font-semibold text-gray-700">Sindhi Text</Label>
										<Textarea id={`couplet-text-${couplet.id}`} placeholder="سنڌي شعر..." value={couplet.text} onChange={(e) => updateCouplet(couplet.id, 'text', e.target.value)} className="border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-lg sindhi-rtl text-lg" dir="rtl" style={{ direction: 'rtl', textAlign: 'right', minHeight: '100px' }} />
									</div>

									<div className="space-y-2">
										<Label htmlFor={`couplet-slug-${couplet.id}`} className="text-sm font-semibold text-gray-700">Slug</Label>
										<Input id={`couplet-slug-${couplet.id}`} placeholder="auto-generated from text..." value={couplet.slug} onChange={(e) => updateCouplet(couplet.id, 'slug', e.target.value)} className="border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-lg" />
									</div>
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}


