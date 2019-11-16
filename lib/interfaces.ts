export interface IFilter {
	where?: any;
	order?: string | string[];
	limit?: number;
	fields?: IField;
	skip?: number;
}

export interface IField {
	[key: string]: boolean;
}

export interface IDataSource {
	settings?: { [key: string]: any };
	connector?: any;
	projectId?: string;
	clientEmail?: string;
	privateKey?: string;
}

export type ICallback = (error: Error | null, result?: any) => void;
