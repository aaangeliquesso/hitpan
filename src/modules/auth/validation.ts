import { z } from 'zod';

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(254, 'Email address is too long.')
  .email('Enter a valid email address.')
  .refine(
    (email) => !/[<>"'`\\\u0000-\u001F\u007F]/.test(email),
    'Email address contains unsupported characters.',
  );

export const authFormSchema = z
  .object({
    mode: z.enum(['login', 'signup']),
    email: emailSchema,
    password: z.string().min(1, 'Enter your password.'),
    confirmPassword: z.string().optional(),
  })
  .superRefine((values, context) => {
    if (values.mode !== 'signup') return;

    if (values.password.length < 8) {
      context.addIssue({
        code: 'custom',
        message: 'Use at least 8 characters.',
        path: ['password'],
      });
    }
    if (!/[0-9]/.test(values.password)) {
      context.addIssue({
        code: 'custom',
        message: 'Include at least one number.',
        path: ['password'],
      });
    }
    if (!/[^A-Za-z0-9]/.test(values.password)) {
      context.addIssue({
        code: 'custom',
        message: 'Include at least one special character.',
        path: ['password'],
      });
    }
    if (!values.confirmPassword) {
      context.addIssue({
        code: 'custom',
        message: 'Confirm your password.',
        path: ['confirmPassword'],
      });
    } else if (values.password !== values.confirmPassword) {
      context.addIssue({
        code: 'custom',
        message: 'Passwords do not match.',
        path: ['confirmPassword'],
      });
    }
  });

export type AuthFormValues = z.infer<typeof authFormSchema>;
