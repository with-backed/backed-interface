import { CreateFormData } from 'components/CreatePageHeader/CreateFormData';

export type LoanFormData = Omit<CreateFormData, 'denomination'>;
