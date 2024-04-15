export default interface XHRBaseInterceptor {
    interceptSend(xhr: XMLHttpRequest, url: string, sendArgs: IArguments): IArguments | null;
}
