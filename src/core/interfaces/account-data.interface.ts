import { Language } from '../language.enum';

export interface AccountData {
  email: string;
  displayName: string;
  languages: Array<Language>;
}
