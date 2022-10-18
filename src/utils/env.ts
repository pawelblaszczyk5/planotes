import { type TypeOf, z } from 'zod';

const isDevelopmentEnvironment = import.meta.env.DEV;

const withDevelopmentDefault = <ZodType extends z.ZodTypeAny>(schema: ZodType, defaultValue: TypeOf<ZodType>) =>
	isDevelopmentEnvironment ? schema.default(defaultValue) : schema;

const environmentSchema = z.object({
	APP_URL: withDevelopmentDefault(z.string().url(), 'http://localhost:3000'),
	COOKIE_DOMAIN: withDevelopmentDefault(z.string(), 'localhost'),
	DATABASE_URL: withDevelopmentDefault(z.string().url(), 'postgresql://postgres:postgres@localhost:5432/planotes'),
	DKIM_PRIVATE_KEY: withDevelopmentDefault(z.string(), 'dkim_key'),
	DKIM_SELECTOR: withDevelopmentDefault(z.string(), 'dkim_selector'),
	MAGIC_IDENTIFIER_SECRET: withDevelopmentDefault(z.string(), 'MAGIC_IDENTIFIER_SECRET_XXX'),
	SESSION_SECRET: withDevelopmentDefault(z.string(), 'SESSION_SECRET_XXX'),
	SMTP_HOST: withDevelopmentDefault(z.string(), 'localhost'),
	SMTP_PASSWORD: withDevelopmentDefault(z.string(), 'hard_password_123'),
	SMTP_USER: withDevelopmentDefault(z.string().email(), 'magic@planotes.xyz'),
});

const result = environmentSchema.safeParse(import.meta.env);

if (!result.success) {
	throw new Error('❌ Invalid or missing env variables');
}

export const env = result.data;
