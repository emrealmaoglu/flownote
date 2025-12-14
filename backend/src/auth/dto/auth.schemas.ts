import { z } from "zod";

/**
 * Auth Zod Schemas
 * @SecOps - Tüm auth inputları mutlaka validate edilmeli!
 */

/**
 * Login Schema
 * identifier: username veya email olabilir
 */
export const LoginSchema = z.object({
  identifier: z.string().min(1, "Kullanıcı adı veya email gerekli"),
  password: z.string().min(1, "Şifre gerekli"),
});

/**
 * Register Schema
 * Yeni kullanıcı kaydı için
 */
export const RegisterSchema = z.object({
  username: z
    .string()
    .min(3, "Kullanıcı adı en az 3 karakter olmalı")
    .max(50, "Kullanıcı adı en fazla 50 karakter olabilir")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Kullanıcı adı sadece harf, rakam ve alt çizgi içerebilir",
    ),
  email: z.string().email("Geçerli bir email adresi girin"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalı"),
  name: z
    .string()
    .min(2, "İsim en az 2 karakter olmalı")
    .max(100, "İsim en fazla 100 karakter olabilir"),
});

export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
