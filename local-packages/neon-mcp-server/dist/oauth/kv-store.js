import { KeyvPostgres } from '@keyv/postgres';
import { logger } from '../utils/logger.js';
import Keyv from 'keyv';
const SCHEMA = 'mcpauth';
const createKeyv = (options) => new Keyv({ store: new KeyvPostgres(options) });
export const clients = createKeyv({
    connectionString: process.env.OAUTH_DATABASE_URL,
    schema: SCHEMA,
    table: 'clients',
});
clients.on('error', (err) => {
    logger.error('Clients keyv error:', { err });
});
export const tokens = createKeyv({
    connectionString: process.env.OAUTH_DATABASE_URL,
    schema: SCHEMA,
    table: 'tokens',
});
tokens.on('error', (err) => {
    logger.error('Tokens keyv error:', { err });
});
export const refreshTokens = createKeyv({
    connectionString: process.env.OAUTH_DATABASE_URL,
    schema: SCHEMA,
    table: 'refresh_tokens',
});
refreshTokens.on('error', (err) => {
    logger.error('Refresh tokens keyv error:', { err });
});
export const authorizationCodes = createKeyv({
    connectionString: process.env.OAUTH_DATABASE_URL,
    schema: SCHEMA,
    table: 'authorization_codes',
});
authorizationCodes.on('error', (err) => {
    logger.error('Authorization codes keyv error:', { err });
});
export const apiKeys = createKeyv({
    connectionString: process.env.OAUTH_DATABASE_URL,
    schema: SCHEMA,
    table: 'api_keys',
});
apiKeys.on('error', (err) => {
    logger.error('API keys keyv error:', { err });
});
