import { NEON_CONSOLE_HOST } from '../../constants.js';
import { NotFoundError } from '../../server/errors.js';
export var CONSOLE_URLS;
(function (CONSOLE_URLS) {
    CONSOLE_URLS["ORGANIZATION"] = "/app/:orgId/projects";
    CONSOLE_URLS["PROJECT"] = "/app/projects/:projectId";
    CONSOLE_URLS["PROJECT_BRANCH"] = "/app/projects/:projectId/branches/:branchId";
})(CONSOLE_URLS || (CONSOLE_URLS = {}));
export function generateConsoleUrl(url, params) {
    const link = url.replace(/:([a-zA-Z0-9_]+)/g, (_, key) => {
        if (params[key] === undefined) {
            throw new NotFoundError(`Missing parameter '${key}' for url '${url}'`);
        }
        return encodeURIComponent(String(params[key]));
    });
    return new URL(link, NEON_CONSOLE_HOST).toString();
}
