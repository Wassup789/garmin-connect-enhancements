interface PropKeysObject {
    [key: string]: PropKeysArray | PropKeysObject;
}

type PropKeysArray = string[];
export type PropKeys = PropKeysObject | PropKeysArray;

export default class ReactHelper {
    static updateInput(elem: HTMLInputElement, value: string) {
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
            elem.constructor.prototype,
            "value"
        )!.set!;
        nativeInputValueSetter.call(elem, value);

        const e = new Event("input", { bubbles: true });
        elem.dispatchEvent(e);
    }

    static closestProps(
        elem: HTMLElement,
        propKeys: PropKeys,
        maxDepth: number
    ): Record<string, unknown> | null {
        let currentElement: HTMLElement | null = elem,
            currentReactFiber: ReactFiber | null = null,
            currentFiberDepth = maxDepth;

        do {
            const reactFiberKey = this.getReactFiberKey(currentElement);

            if (reactFiberKey && this.isReactFiber(currentElement[reactFiberKey])) {
                currentReactFiber = currentElement[reactFiberKey] as unknown as ReactFiber;
                break;
            }
            currentElement = currentElement.parentElement;
            maxDepth--;
        } while (currentElement && maxDepth > 0);

        if (currentReactFiber) {
            do {
                const memoizedProps = (currentReactFiber as unknown as ReactFiber).memoizedProps,
                    matchingProps = this.closestPropsRecursive(memoizedProps, propKeys);

                if (matchingProps) {
                    return matchingProps;
                }

                currentReactFiber = currentReactFiber.return;
                currentFiberDepth--;
            } while (currentReactFiber && currentFiberDepth > 0);
        }

        return null;
    }

    private static closestPropsRecursive(props: ReactProps, propKeys: PropKeys): Record<string, unknown> | null {
        if (
            "props" in props &&
            this.hasPropKeys(props.props, propKeys)
        ) {
            return props.props;
        }
        if (this.hasPropKeys(props, propKeys)) {
            return props;
        }

        if ("children" in props && props.children) {
            const childProps = Array.isArray(props.children) ? props.children : [props.children];

            for (const props of childProps) {
                if (typeof props === "object" && props && !Array.isArray(props)) {
                    const value = this.closestPropsRecursive(props, propKeys);

                    if (value) {
                        return value;
                    }
                }
            }
        }

        return null;
    }

    private static hasPropKeys(props: BaseReactProps, propKeys: PropKeys): boolean {
        if (Array.isArray(propKeys)) {
            return this.hasPropKeysArr(props, propKeys);
        } else {
            return this.hasPropKeysObject(props, propKeys);
        }
    }

    private static hasPropKeysObject(props: unknown, propKeysObject: PropKeysObject): boolean {
        if (!this.isValidBaseReactProps(props)) {
            return false;
        }

        const keys = Object.keys(propKeysObject);
        for (const key of keys) {
            if (!(key in props)) {
                return false;
            }

            const targetProps = propKeysObject[key];
            if (Array.isArray(targetProps)) {
                if (targetProps.length !== 0 && !this.hasPropKeysArr(props[key], targetProps)) {
                    return false;
                }
            } else {
                if (!this.hasPropKeysObject(props[key], targetProps)) {
                    return false;
                }
            }
        }

        return true;
    }
    private static hasPropKeysArr(props: unknown, propKeysArray: PropKeysArray): boolean {
        if (!this.isValidBaseReactProps(props)) {
            return false;
        }

        return propKeysArray.filter((e) => e in props).length === propKeysArray.length;
    }

    private static isValidBaseReactProps(props: unknown): props is BaseReactProps {
        return <boolean>props && typeof props === "object" && !Array.isArray(props);
    }

    private static getReactFiberKey<T extends object>(elem: T): keyof T | null {
        return this.getKeyStartsWith(elem, "__reactFiber");
    }

    private static getKeyStartsWith<T extends object>(elem: T, needle: string): keyof T | null {
        const objKeys = Object.keys(elem) as (keyof T)[];

        return objKeys.find((e) => (e as string).startsWith(needle)) || null;
    }

    private static isReactFiber(obj: unknown): obj is ReactFiber {
        return Boolean(typeof obj === "object" && obj && !Array.isArray(obj) &&
            "memoizedProps" in obj && typeof obj.memoizedProps === "object" && !Array.isArray(obj.memoizedProps) && obj.memoizedProps &&
            "children" in obj.memoizedProps && typeof obj.memoizedProps.children === "object");
    }
}

type ReactFiber = {
    memoizedProps: ReactProps;
    return: ReactFiber;
};
type ReactProps = {
    children?: ReactProps | ReactProps[];
    props: BaseReactProps & ReactProps;
};
type BaseReactProps = Record<string, unknown>;
