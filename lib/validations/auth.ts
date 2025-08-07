import * as z from "zod"

export const loginSchema = z.object({
  email: z.string().min(1, "E-mailadres is verplicht").email("Ongeldig e-mailadres"),
  password: z.string().min(1, "Wachtwoord is verplicht").min(6, "Wachtwoord moet minimaal 6 tekens bevatten"),
})

export const registerSchema = z.object({
  name: z.string().min(1, "Naam is verplicht").min(2, "Naam moet minimaal 2 tekens bevatten"),
  email: z.string().min(1, "E-mailadres is verplicht").email("Ongeldig e-mailadres"),
  password: z.string().min(1, "Wachtwoord is verplicht").min(6, "Wachtwoord moet minimaal 6 tekens bevatten"),
  confirmPassword: z.string().min(1, "Bevestig je wachtwoord"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Wachtwoorden komen niet overeen",
  path: ["confirmPassword"],
})

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, "E-mailadres is verplicht").email("Ongeldig e-mailadres"),
})

export const resetPasswordSchema = z.object({
  password: z.string().min(1, "Wachtwoord is verplicht").min(6, "Wachtwoord moet minimaal 6 tekens bevatten"),
  confirmPassword: z.string().min(1, "Bevestig je wachtwoord"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Wachtwoorden komen niet overeen",
  path: ["confirmPassword"],
})

export type LoginFormValues = z.infer<typeof loginSchema>
export type RegisterFormValues = z.infer<typeof registerSchema>
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>