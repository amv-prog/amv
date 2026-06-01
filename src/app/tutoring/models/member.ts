export interface Member {
  id: string;
  type: 'RECIPIENT' | 'VOLUNTEER';
  firstName: string;
  lastName: string;
  phoneNumbers: string[];
  email: string | undefined;
  languages: string[];
  additionalInfo: string;
}
