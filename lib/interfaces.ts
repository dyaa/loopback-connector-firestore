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
