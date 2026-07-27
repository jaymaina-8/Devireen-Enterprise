import { z } from 'zod';

export const deliveryFormSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name is too long'),
  phone: z
    .string()
    .min(9, 'Please enter a valid phone number')
    .max(20, 'Phone number is too long')
    .regex(/^[\+\d\s\-\(\)]+$/, 'Phone number contains invalid characters'),
  email: z.string().email('Please enter a valid email address'),
  deliveryAddress: z
    .string()
    .min(5, 'Please enter a full delivery address')
    .max(500, 'Address is too long'),
  county: z
    .string()
    .min(2, 'Please select your county / area')
    .max(100, 'County name is too long'),
  courierService: z
    .string()
    .min(1, 'Please select a courier service'),
  deliveryNotes: z.string().max(500, 'Notes are too long').optional(),
});

export const pickupFormSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name is too long'),
  phone: z
    .string()
    .min(9, 'Please enter a valid phone number')
    .max(20, 'Phone number is too long')
    .regex(/^[\+\d\s\-\(\)]+$/, 'Phone number contains invalid characters'),
  email: z.string().email('Please enter a valid email address'),
});

export type DeliveryFormData = z.infer<typeof deliveryFormSchema>;
export type PickupFormData = z.infer<typeof pickupFormSchema>;

export const KENYA_COUNTIES = [
  'Baringo',
  'Bomet',
  'Bungoma',
  'Busia',
  'Elgeyo-Marakwet',
  'Embu',
  'Garissa',
  'Homa Bay',
  'Isiolo',
  'Kajiado',
  'Kakamega',
  'Kericho',
  'Kiambu',
  'Kilifi',
  'Kirinyaga',
  'Kisii',
  'Kisumu',
  'Kitui',
  'Kwale',
  'Laikipia',
  'Lamu',
  'Machakos',
  'Makueni',
  'Mandera',
  'Marsabit',
  'Meru',
  'Migori',
  'Mombasa',
  'Murang\'a',
  'Nairobi',
  'Nakuru',
  'Nandi',
  'Narok',
  'Nyamira',
  'Nyandarua',
  'Nyeri',
  'Samburu',
  'Siaya',
  'Taita-Taveta',
  'Tana River',
  'Tharaka-Nithi',
  'Trans Nzoia',
  'Turkana',
  'Uasin Gishu',
  'Vihiga',
  'Wajir',
  'West Pokot',
];

export const COURIER_SERVICES = [
  'G4S',
  'DHL Kenya',
  'Sendy',
  'Fargo Courier',
  'Wells Fargo',
  'Aramex Kenya',
  'EMS / Kenya Post',
  'Uber Connect',
  'Porter',
  'Glovo Courier',
  'Own Transport',
];

