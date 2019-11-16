import { WhereFilterOp } from '@google-cloud/firestore';

const operators: { [key: string]: WhereFilterOp } = {
	lt: '<',
	lte: '<=',
	gt: '>',
	gte: '>=',
	in: 'in',
	eq: '=='
};

export default Object.freeze(operators);
