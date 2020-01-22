/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2020 Extremely Heavy Industries Inc.
 */
/* eslint-disable react-hooks/exhaustive-deps */
import {useEffect, useRef} from 'react';
import ResizeObserver from 'resize-observer-polyfill';
import {isFinite, debounce} from 'lodash';

/**
 * Hook to run a function once after component has been mounted.
 * @param {function} fn
 */
export function useOnMount(fn) {
    useEffect(
        () => {fn(); return undefined},
        []
    );
}

/**
 * Hook to run a function once after component has been unmounted.
 * @param {function} fn
 */
export function useOnUnmount(fn) {
    useEffect(
        () => fn,
        []
    );
}

/**
 * Hook to run a function when component is resized.
 * This will not run the hook when the size is changed to 0 (i.e. the element is hidden) or when
 * the new size is the same as the previous size (e.g. when the element is set to visible)
 * @param {function} fn
 * @param {number} [delay] - milliseconds to debounce
 * @param {Ref} [ref] - existing ref to observe. If not provided, a ref will be created
 * @returns {Ref} - ref to be placed on target component
 */
export function useOnResize(fn, delay, ref) {
    if (!ref) ref = useRef(null);

    let prevWidth, prevHeight;

    const wrappedFn = (e) => {
        const {width, height} = e[0].contentRect;
        if (width != 0 && height != 0 && width != prevWidth && height != prevHeight) {
            prevWidth = width;
            prevHeight = height;
            fn(e);
        }
    };

    useEffect(() => {
        const {current} = ref;
        if (!current) return;

        const callbackFn = isFinite(delay) && delay >= 0 ? debounce(wrappedFn, delay) : wrappedFn,
            resizeObserver = new ResizeObserver(callbackFn);

        resizeObserver.observe(current);
        return () => resizeObserver.unobserve(current);
    }, [ref.current, delay]);

    return ref;
}
