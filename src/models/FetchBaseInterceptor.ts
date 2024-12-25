export type FetchArgs = [input: RequestInfo | URL, init?: RequestInit | undefined];

export default abstract class FetchBaseInterceptor {
    beforeFetch(url: string, args: FetchArgs): FetchArgs | null {
        return null;
    }

    interceptFetch(url: string, args: FetchArgs, response: Response): Response | null {
        return null;
    }
}
