import { z } from "zod";

export const RoleSchema = z.enum(["ADMIN", "MANAGER", "MECHANIC", "CLIENT", "SIEGE", "AGENCE"]);

export const UserSchema = z.object({
  usr_id: z.string(),
  usr_name: z.string(),
  usr_email: z.string().email(),
  usr_password: z.string().optional(),
  newPassword: z.string().optional(),  
  usr_role: RoleSchema,

  usr_clientId: z.string().nullable(),
  usr_baseId: z.string().nullable(),

  usr_createdAt: z.string().datetime().optional(),
  usr_updatedAt: z.string().datetime().optional(),

  usr_client: z.object({ 
    cli_name: z.string()
  }).nullable().optional(),

  usr_base: z.object({ 
    bas_location: z.string()
  }).nullable().optional(),
});

export type User = z.infer<typeof UserSchema>;
export type Role = z.infer<typeof RoleSchema>;
