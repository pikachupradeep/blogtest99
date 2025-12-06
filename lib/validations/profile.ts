import { z } from 'zod';

export const profileSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters'),
  
  phone: z.string()
    .optional()
    .nullable()
    .transform(val => val === '' ? null : val),
  
  dob: z.string()
    .optional()
    .nullable()
    .transform(val => val === '' ? null : val),
  
  img: z.instanceof(File)
    .optional()
    .nullable()
    .refine(
      (file) => !file || file.size === 0 || file.size <= 5 * 1024 * 1024, 
      'File size must be less than 5MB'
    )
    .refine(
      (file) => !file || file.size === 0 || file.type.startsWith('image/'), 
      'Must be an image file'
    ),
  
  author_id: z.string().min(1, 'Author ID is required'),
});

export type ProfileFormData = z.infer<typeof profileSchema>;