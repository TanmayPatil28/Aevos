import { clients, tokens, refreshTokens, authorizationCodes, } from './kv-store.js';
class Model {
    getClient = async (clientId) => {
        return clients.get(clientId);
    };
    saveClient = async (client) => {
        await clients.set(client.id, client);
        return client;
    };
    saveToken = async (token) => {
        await tokens.set(token.accessToken, token);
        return token;
    };
    deleteToken = async (token) => {
        return tokens.delete(token.accessToken);
    };
    saveRefreshToken = async (token) => {
        await refreshTokens.set(token.refreshToken, token);
        return token;
    };
    deleteRefreshToken = async (token) => {
        return refreshTokens.delete(token.refreshToken);
    };
    validateScope = (user, client, scope) => {
        // For demo purposes, accept all scopes
        return Promise.resolve(scope);
    };
    verifyScope = () => {
        // For demo purposes, accept all scopes
        return Promise.resolve(true);
    };
    getAccessToken = async (accessToken) => {
        const token = await tokens.get(accessToken);
        return token;
    };
    getRefreshToken = async (refreshToken) => {
        return refreshTokens.get(refreshToken);
    };
    saveAuthorizationCode = async (code) => {
        await authorizationCodes.set(code.authorizationCode, code);
        return code;
    };
    getAuthorizationCode = async (code) => {
        return authorizationCodes.get(code);
    };
    revokeAuthorizationCode = async (code) => {
        return authorizationCodes.delete(code.authorizationCode);
    };
}
export const model = new Model();
