import { Analytics } from '@segment/analytics-node';
import { ANALYTICS_WRITE_KEY } from '../constants.js';
let analytics;
export const initAnalytics = () => {
    if (ANALYTICS_WRITE_KEY) {
        analytics = new Analytics({
            writeKey: ANALYTICS_WRITE_KEY,
            host: 'https://track.neon.tech',
        });
    }
};
export const identify = (account, params) => {
    if (account) {
        analytics?.identify({
            ...params,
            userId: account.id,
            traits: {
                name: account.name,
                email: account.email,
                isOrg: account.isOrg,
            },
        });
    }
    else {
        analytics?.identify({
            ...params,
            anonymousId: 'anonymous',
        });
    }
};
export const track = (params) => {
    analytics?.track(params);
};
/**
 * Util for identifying the user based on the auth method. If the api key belongs to an organization, identify the organization instead of user details.
 */
export const identifyApiKey = async (auth, neonClient, params) => {
    if (auth.auth_method === 'api_key_org') {
        const { data: org } = await neonClient.getOrganization(auth.account_id);
        const account = {
            id: auth.account_id,
            name: org.name,
            isOrg: true,
        };
        identify(account, params);
        return account;
    }
    const { data: user } = await neonClient.getCurrentUserInfo();
    const account = {
        id: user.id,
        name: user.name,
        email: user.email,
        isOrg: false,
    };
    identify(account, params);
    return account;
};
