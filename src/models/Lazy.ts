export class Lazy<T> {
    private _value?: T;

    constructor(public valueFactory: () => T) {
    }

    public get value(): T {
        return (this._value ??= this.valueFactory());
    }
}
