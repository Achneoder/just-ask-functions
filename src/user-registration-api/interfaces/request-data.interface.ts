import { CallbackURIRequest } from '../../core/interfaces/callback-uri-request.interface';
import { Language } from '../../core/language.enum';

export interface RequestData extends CallbackURIRequest {
  email: string;
  displayName: string;
  password: string;
  languages: Array<Language>;
}
