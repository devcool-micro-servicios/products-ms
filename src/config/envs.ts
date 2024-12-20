import 'dotenv/config';
import * as Joi from 'joi';

interface Envs {
  PORT: number;
  DATABASE_URL: string;
}

const envSchema = Joi.object({
  PORT: Joi.number().default(3000),
  DATABASE_URL: Joi.string().required(),
}).unknown(true);

const { error, value } = envSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const env: Envs = value;

export const envs = {
  ...env,
};
