export type WorkflowStep = 'hesudhar' | 'romanizer' | 'poetry-details' | 'couplets' | 'transliterate';

export interface HesudharEntry {
	id: number;
	word: string;
	correct: string;
}

export interface RomanWordEntry {
	id: number;
	word_sd: string;
	word_roman: string;
}

export interface PoetOption {
	id: string;
	poet_id: number;
	sindhi_name: string;
	english_name: string;
	english_laqab?: string;
	file_url?: string;
}

export interface CategoryOption {
	id: string;
	slug: string;
	contentStyle: string;
	englishName: string;
	sindhiName: string;
	englishPlural: string;
	sindhiPlural: string;
	englishDetails: string;
	sindhiDetails: string;
	languages: string[];
	summary: string;
	title: string;
}

export interface CoupletItem {
	id: string;
	text: string;
	slug: string;
	tags: string[];
}

export interface TransliteratedCoupletItem {
	id: string;
	sindhiText: string;
	romanText: string;
	slug: string;
	tags: string[];
}


