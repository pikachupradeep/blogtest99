export interface ProfileFormData {
  author_id: string; // same as auth userid
  name: string;
  dob: string;
  phone: string;
  image: File | null;
}
