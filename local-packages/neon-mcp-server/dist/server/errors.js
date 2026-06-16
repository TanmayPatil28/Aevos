import { isAxiosError } from 'axios';
import { NeonDbError } from '@neondatabase/serverless';
import { logger } from '../utils/logger.js';
import { captureException } from '@sentry/node';
export class InvalidArgumentError extends Error {
    constructor(message) {
        super(message);
        this.name = 'InvalidArgumentError';
    }
}
export class NotFoundError extends Error {
    constructor(message) {
        super(message);
        this.name = 'NotFoundError';
    }
}
export function isClientError(error) {
    return (error instanceof InvalidArgumentError || error instanceof NotFoundError);
}
export function errorResponse(error) {
    return {
        isError: true,
        content: [
            {
                type: 'text',
                text: error instanceof Error
                    ? `${error.name}: ${error.message}`
                    : 'Unknown error',
            },
        ],
    };
}
export function handleToolError(error, properties) {
    if (error instanceof NeonDbError || isClientError(error)) {
        return errorResponse(error);
    }
    else if (isAxiosError(error) &&
        error.response?.status &&
        error.response?.status < 500) {
        return {
            isError: true,
            content: [
                {
                    type: 'text',
                    text: error.response.data.message,
                },
                {
                    type: 'text',
                    text: `[${error.response.statusText}] ${error.message}`,
                },
            ],
        };
    }
    else {
        logger.error('Tool call error:', {
            error: error instanceof Error
                ? `${error.name}: ${error.message}`
                : 'Unknown error',
            properties,
        });
        captureException(error, { extra: properties });
        return errorResponse(error);
    }
}
