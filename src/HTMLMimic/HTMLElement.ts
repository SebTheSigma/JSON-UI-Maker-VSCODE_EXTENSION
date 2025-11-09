

export type M_HTMLElement = {
    tag?: string;
    class: string;
    dataset: { [key: string]: string };
    style: {
        top?: string;
        left?: string;
        width?: string;
        height?: string;
        zIndex?: string;
        [key: string]: string | number | undefined;
    };
    text?: string;
};
