import { z } from 'zod';

/**
 * Auth Zod Schemas
 * @SecOps - Tüm auth inputları mutlaka validate edilmeli!
 */

export const LoginSchema = z.object({
    email: z.string().email('Geçerli bir email adresi girin'),
    password: z.string().min(1, 'Şifre gerekli'),
});

export const RegisterSchema = z.object({
    email: z.string().email('Geçerli bir email adresi girin'),
    password: z
        .string()
        .min(8, 'Şifre en az 8 karakter olmalı')
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            'Şifre en az bir büyük harf, bir küçük harf ve bir rakam içermeli',
        ),
    name: z
        .string()
        .min(2, 'İsim en az 2 karakter olmalı')
        .max(100, 'İsim en fazla 100 karakter olabilir'),
});

export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
