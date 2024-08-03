export default class ReactHelper {
    static closestProps(
        elem: HTMLElement,
        propKeys: string[],
        maxDepth: number
    ): Record<string, unknown> | null {
        let currentParent: HTMLElement | null = elem;
        do {
            const reactFiberKey = this.getReactFiberKey(currentParent);

            if (reactFiberKey && this.isReactFiber(currentParent[reactFiberKey])) {
                const memoizedProps = (currentParent[reactFiberKey] as unknown as ReactFiber).memoizedProps,
                    matchingProps = this.closestPropsRecursive(memoizedProps, propKeys);

                if (matchingProps) {
                    return matchingProps;
                }
            }

            currentParent = currentParent.parentElement;
            maxDepth--;
        } while (currentParent && maxDepth > 0);

        return null;
    }

    private static closestPropsRecursive(props: ReactProps, propKeys: string[]): Record<string, unknown> | null {
        if (
            "props" in props &&
            propKeys.filter((e) => e in props.props).length === propKeys.length
        ) {
            return props.props;
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

    private static getReactFiberKey<T extends object>(elem: T): keyof T | null {
        const objKeys = Object.keys(elem) as (keyof T)[];

        return objKeys.find((e) => (e as string).startsWith("__reactFiber")) || null;
    }

    private static isReactFiber(obj: unknown): obj is ReactFiber {
        return Boolean(typeof obj === "object" && obj && !Array.isArray(obj) &&
            "memoizedProps" in obj && typeof obj.memoizedProps === "object" && !Array.isArray(obj.memoizedProps) && obj.memoizedProps &&
            "children" in obj.memoizedProps && typeof obj.memoizedProps.children === "object");
    }
}

type ReactFiber = {
    memoizedProps: ReactProps;
};
type ReactProps = {
    children?: ReactProps | ReactProps[];
    props: Record<string, unknown> & ReactProps;
};
