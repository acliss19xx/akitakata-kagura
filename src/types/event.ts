export interface Event {
  id: string | number;
  groupName: string;
  eventName: string;
  date: string;
  time: string;
  location: string;
  mapUrl: string;
  program: string;
  fee: string;
  conditions: string;
  infoUrl: string;
  notes: string;
  contactInfo: string,
  sponsored: string,
  headerImageUrl?: string;
  imageUrl: string[]; // Changed to string array
  etcImageUrl?: string[]; // Changed to string array
  isPublished: string;
  category?: string;
}
