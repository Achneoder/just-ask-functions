import { Language } from '../language.enum';

export interface Question {
  title: string;
  content: string;
  language: Language;
}
