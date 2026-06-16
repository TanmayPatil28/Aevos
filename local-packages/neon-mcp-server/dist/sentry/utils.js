import { setTags, setUser } from '@sentry/node';
export const setSentryTags = (context) => {
    setUser({
        id: context.account.id,
    });
    setTags({
        'app.name': context.app.name,
        'app.version': context.app.version,
        'app.transport': context.app.transport,
        'app.environment': context.app.environment,
    });
    if (context.client) {
        setTags({
            'client.id': context.client.id,
            'client.name': context.client.name,
        });
    }
};
