import nodeFetch, { Headers as NodeHeaders, Request as NodeRequest, Response as NodeResponse, } from 'node-fetch';
if (!global.fetch) {
    global.fetch = nodeFetch;
    global.Headers = NodeHeaders;
    global.Request = NodeRequest;
    global.Response = NodeResponse;
}
