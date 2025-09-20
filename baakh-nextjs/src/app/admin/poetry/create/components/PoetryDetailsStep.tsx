"use client";

import { CheckCircle, AlertCircle, FileText, Plus, Type } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import type { PoetOption, CategoryOption } from "../types";

interface PoetryDetails {
	sindhiTitle: string;
	englishTitle: string;
	slug: string;
	detail: string;
	source: string;
	poetId: string;
	categoryId: string;
	contentStyle: string;
	tags: string;
}

interface TagOption {
	id: number;
	slug: string;
	label: string;
	tag_type: string;
	english: { title: string; details: string };
	sindhi: { title: string; details: string };
}

interface PoetryDetailsStepProps {
	poetryDetails: PoetryDetails;
	setPoetryDetails: (val: PoetryDetails) => void;
	poets: PoetOption[];
	categories: CategoryOption[];
	availableTags: TagOption[];
	selectedTags: string[];
	setShowTagModal: (val: boolean) => void;
	removeTag: (slug: string) => void;
	autoRomanizeTitle: (sindhi: string) => Promise<void>;
	removeDoubleSpaces: (t: string) => string;
}

export default function PoetryDetailsStep(props: PoetryDetailsStepProps) {
	const {
		poetryDetails,
		setPoetryDetails,
		poets,
		categories,
		availableTags,
		selectedTags,
		setShowTagModal,
		removeTag,
		autoRomanizeTitle,
		removeDoubleSpaces,
	} = props;

	return (
		<div className="max-w-4xl mx-auto">
			<Card className="bg-white border border-[#E5E5E5] rounded-lg shadow-sm mb-8">
				<CardHeader className="pb-4">
					<div className="text-center">
						<h2 className="text-2xl font-bold text-[#1F1F1F] mb-2">
							<FileText className="w-6 h-6 inline-block mr-2" />
							Poetry Details
						</h2>
						<p className="text-[#6B6B6B]">Add metadata and information about your poetry</p>
					</div>
				</CardHeader>
			</Card>

			<div className="space-y-6">
				<Card className="bg-white border border-[#E5E5E5] rounded-lg shadow-sm">
					<CardContent className="p-6">
						<div className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="sindhi-title" className="text-[#1F1F1F] font-medium">Sindhi Title</Label>
								<Input id="sindhi-title" placeholder="سنڌي ٽائيٽل شامل ڪريو..." value={poetryDetails.sindhiTitle} onChange={(e) => {
									const title = removeDoubleSpaces(e.target.value);
									setPoetryDetails({ ...poetryDetails, sindhiTitle: title });
								}} className="sindhi-input sindhi-rtl text-lg font-ambile border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] rounded-lg bg-white hover:bg-[#F4F4F5] transition-colors" dir="rtl" style={{ direction: 'rtl', textAlign: 'right' }} />
								<div className="flex gap-2">
									<Button onClick={() => autoRomanizeTitle(poetryDetails.sindhiTitle)} disabled={!poetryDetails.sindhiTitle.trim()} variant="outline" size="sm" className="border-[#E5E5E5] text-[#6B6B6B] hover:bg-[#F4F4F5] hover:border-[#E5E5E5] transition-colors">
										<Type className="w-4 h-4 mr-2" />
										Auto-Romanize Title
									</Button>
								</div>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div className="space-y-3">
									<Label htmlFor="poet" className="text-sm font-semibold text-gray-700">Poet</Label>
									<Select value={poetryDetails.poetId} onValueChange={(value) => setPoetryDetails({ ...poetryDetails, poetId: value })}>
										<SelectTrigger className="w-full h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 bg-white hover:bg-gray-50 transition-colors rounded-lg">
											<SelectValue placeholder={`Select a poet (${poets.length} available)`} />
										</SelectTrigger>
										<SelectContent className="max-h-[300px] bg-white border-gray-200 rounded-lg shadow-lg">
											{poets.map((poet) => (
												<SelectItem key={poet.id} value={poet.poet_id?.toString() || ''} className="hover:bg-gray-100 focus:bg-gray-100 py-3">
													<div className="flex items-center gap-3 w-full">
														<div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0">
															{poet.file_url ? <img src={poet.file_url} alt={poet.english_name} className="w-full h-full object-cover" /> : (
																<div className="w-full h-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center">
																	<span className="text-white text-sm font-semibold">{poet.english_name?.charAt(0)?.toUpperCase() || '?'}</span>
																</div>
															)}
														</div>
														<div className="flex flex-col min-w-0 flex-1">
															<span className="font-medium truncate text-gray-900 text-sm">{poet.english_laqab || poet.english_name}</span>
														</div>
													</div>
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>

								<div className="space-y-3">
									<Label htmlFor="category" className="text-sm font-semibold text-gray-700">Category</Label>
									<Select value={poetryDetails.categoryId} onValueChange={(value) => setPoetryDetails({ ...poetryDetails, categoryId: value })}>
										<SelectTrigger className="w-full h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 bg-white hover:bg-gray-50 transition-colors rounded-lg">
											<SelectValue placeholder={categories.length > 0 ? `Select a category (${categories.length} available)` : "Loading categories..."} />
										</SelectTrigger>
										<SelectContent className="max-h-[300px] bg-white border-gray-200 rounded-lg shadow-lg">
											{categories.map((category) => (
												<SelectItem key={category.id} value={category.id} className="hover:bg-gray-100 focus:bg-gray-100 py-3">
													<div className="flex flex-col w-full">
														<span className="font-medium text-gray-900 text-sm">{category.englishName || category.sindhiName || category.slug}</span>
													</div>
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="bg-white border border-[#E5E5E5] rounded-lg shadow-sm">
					<CardContent className="p-6">
						<div className="space-y-2">
							<Label htmlFor="poetry-detail" className="text-[#1F1F1F] font-medium">Detail</Label>
							<Textarea id="poetry-detail" placeholder="Enter poetry description or details..." value={poetryDetails.detail || ''} onChange={(e) => setPoetryDetails({ ...poetryDetails, detail: e.target.value })} className="min-h-[100px] font-ambile border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] rounded-lg bg-white hover:bg-[#F4F4F5] transition-colors" />
						</div>
					</CardContent>
				</Card>

				<Card className="bg-white border border-[#E5E5E5] rounded-lg shadow-sm">
					<CardContent className="p-6">
						<div className="space-y-2">
							<Label htmlFor="poetry-source" className="text-[#1F1F1F] font-medium">Source</Label>
							<Input id="poetry-source" placeholder="Enter source information..." value={poetryDetails.source || ''} onChange={(e) => setPoetryDetails({ ...poetryDetails, source: e.target.value })} className="font-ambile border-[#E5E5E5] focus:border-[#1F1F1F] focus:ring-[#1F1F1F] rounded-lg bg-white hover:bg-[#F4F4F5] transition-colors" />
						</div>
					</CardContent>
				</Card>

				<Card className="bg-white border border-[#E5E5E5] rounded-lg shadow-sm">
					<CardContent className="p-6">
						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<h4 className="font-medium text-[#1F1F1F]">Poetry Settings</h4>
								<div className="flex items-center gap-4 text-sm text-[#6B6B6B]">
									{poets.length > 0 && <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-green-600" />{poets.length} poets loaded</span>}
									{categories.length > 0 && <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-green-600" />{categories.length} categories loaded</span>}
								</div>
							</div>

							{(poets.length === 0 || categories.length === 0) && (
								<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
									<div className="flex items-start gap-3">
										<div className="text-yellow-600 mt-1"><AlertCircle className="w-4 h-4" /></div>
										<div className="space-y-2">
											<h5 className="font-medium text-yellow-800">Loading Data</h5>
											<div className="text-sm text-yellow-700 space-y-1">
												{poets.length === 0 && <p>⏳ Loading poets... ({poets.length}/46)</p>}
												{categories.length === 0 && <p>⏳ Loading categories... ({categories.length}/12)</p>}
											</div>
											<p className="text-xs text-yellow-600">💡 Please wait while we load the available poets and categories</p>
										</div>
									</div>
								</div>
							)}
						</div>
					</CardContent>
				</Card>

				<Card className="bg-white border border-[#E5E5E5] rounded-lg shadow-sm">
					<CardContent className="p-6">
						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<Label className="text-[#1F1F1F] font-medium">Tags</Label>
								<Button onClick={() => setShowTagModal(true)} variant="outline" size="sm" className="border-[#E5E5E5] text-[#6B6B6B] hover:bg-[#F4F4F5] hover:border-[#E5E5E5] transition-colors">
									<Plus className="w-4 h-4 mr-2" />
									Add New Tag
								</Button>
							</div>

							{selectedTags.length > 0 && (
								<div className="flex flex-wrap gap-2">
									{selectedTags.map((tagSlug) => (
										<span key={tagSlug} className="inline-flex items-center gap-2 bg-[#F4F4F5] text-[#1F1F1F] border border-[#E5E5E5] rounded-full px-3 py-1 text-sm">
											{availableTags.find(t => t.slug === tagSlug)?.english.title || tagSlug}
											<button onClick={() => removeTag(tagSlug)} className="ml-1 hover:text-red-600 transition-colors">×</button>
										</span>
									))}
								</div>
							)}

							<div className="space-y-3">
								<Label className="text-sm font-medium text-gray-700">Available Tags</Label>
								<div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
									{availableTags.map((tag, index) => {
										const isSelected = selectedTags.includes(tag.slug);
										const colors = ['bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200','bg-green-100 text-green-800 border-green-200 hover:bg-green-200','bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200','bg-pink-100 text-pink-800 border-pink-200 hover:bg-pink-200','bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200','bg-teal-100 text-teal-800 border-teal-200 hover:bg-teal-200','bg-indigo-100 text-indigo-800 border-indigo-200 hover:bg-indigo-200','bg-rose-100 text-rose-800 border-rose-200 hover:bg-rose-200'];
										const selectedColors = ['bg-blue-500 text-white border-blue-500 hover:bg-blue-600','bg-green-500 text-white border-green-500 hover:bg-green-600','bg-purple-500 text-white border-purple-500 hover:bg-purple-600','bg-pink-500 text-white border-pink-500 hover:bg-pink-600','bg-orange-500 text-white border-orange-500 hover:bg-orange-600','bg-teal-500 text-white border-teal-500 hover:bg-teal-600','bg-indigo-500 text-white border-indigo-500 hover:bg-indigo-600','bg-rose-500 text-white border-rose-500 hover:bg-rose-600'];
										const colorClass = isSelected ? selectedColors[index % selectedColors.length] : colors[index % colors.length];
										return (
											<div key={tag.id} className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 ${colorClass}`}>
												{tag.english.title}
											</div>
										);
									})}
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}


