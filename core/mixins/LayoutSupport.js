/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */

import {applyMixin} from '@xh/hoist/utils/js';
import {pick, isNumber, isString, forOwn, omit} from 'lodash';
import PT from 'prop-types';

/**
 * This mixin provides support for flexbox related styles that are set as top-level properties
 * on a component.
 *
 * The following properties will be supported:
 *     margin, marginTop, marginRight, marginBottom, marginLeft,
 *     padding, paddingTop, paddingRight, paddingBottom, paddingLeft,
 *     height, minHeight, maxHeight, width, minWidth, maxWidth,
 *     flex, flexBasis, flexDirection, flexGrow, flexShrink, flexWrap,
 *     alignItems, alignSelf, alignContent, justifyContent,
 *     overflow, overflowX, overflowY,
 *     top, left, position, display
 *
 * This mixin also promises that the Component will respect and respond to these properties.
 * Components will typically delegate this responsibility to a child component that also
 * implements LayoutSupport. `Box` is typically the Component that is ultimately rendered
 * and will handle this by outputting a div with appropriate styles.
 */
export function LayoutSupport(C) {
    return applyMixin(C, {
        name: 'LayoutSupport',

        provides: {

            /**
             * Return all layout related props found in props.
             *
             * This method implements some minor translations, to allow a more user friendly
             * specification than that afforded by the underlying flexbox styles.
             *
             * In particular, it accepts flex and sizing props as raw numbers rather than strings.
             */
            getLayoutProps() {

                // Harvest all keys of interest
                const ret = pick(this.props, allKeys);

                // flexXXX: convert raw number to string
                const flexConfig = pick(ret, flexKeys);
                forOwn(flexConfig, (v, k) => {
                    if (isNumber(v)) ret[k] = v.toString();
                });

                // Dimensions: translate numbers / bare strings into pixels.
                const dimConfig = pick(ret, dimKeys);
                forOwn(dimConfig, (v, k) => {ret[k] = toPx(v)});

                // Extra handling for margin and padding to support TLBR multi-value strings.
                if (ret.margin) ret.margin = toTlbrPx(ret.margin);
                if (ret.padding) ret.padding = toTlbrPx(ret.padding);

                return ret;
            },


            /**
             * Return all non-layout related props found in props.
             */
            getNonLayoutProps() {
                return omit(this.props, allKeys);
            }

        }
    });
}

/** Available to spread into the propTypes of LayoutSupport enabled components. */
export const layoutSupportProps = {
    margin: PT.oneOfType([PT.number, PT.string]),
    marginTop: PT.oneOfType([PT.number, PT.string]),
    marginRight: PT.oneOfType([PT.number, PT.string]),
    marginBottom: PT.oneOfType([PT.number, PT.string]),
    marginLeft: PT.oneOfType([PT.number, PT.string]),
    padding: PT.oneOfType([PT.number, PT.string]),
    paddingTop: PT.oneOfType([PT.number, PT.string]),
    paddingRight: PT.oneOfType([PT.number, PT.string]),
    paddingBottom: PT.oneOfType([PT.number, PT.string]),
    paddingLeft: PT.oneOfType([PT.number, PT.string]),
    height: PT.oneOfType([PT.number, PT.string]),
    minHeight: PT.oneOfType([PT.number, PT.string]),
    maxHeight: PT.oneOfType([PT.number, PT.string]),
    width: PT.oneOfType([PT.number, PT.string]),
    minWidth: PT.oneOfType([PT.number, PT.string]),
    maxWidth: PT.oneOfType([PT.number, PT.string]),
    flex: PT.oneOfType([PT.number, PT.string]),
    flexBasis: PT.oneOfType([PT.number, PT.string]),
    flexDirection: PT.string,
    flexGrow: PT.number,
    flexShrink: PT.number,
    flexWrap: PT.string,
    alignItems: PT.string,
    alignSelf: PT.string,
    alignContent: PT.string,
    justifyContent: PT.string,
    overflow: PT.string,
    overflowX: PT.string,
    overflowY: PT.string,
    top: PT.oneOfType([PT.number, PT.string]),
    left: PT.oneOfType([PT.number, PT.string]),
    position: PT.string,
    display: PT.string
};

//-------------------------
// Keys to be processed
//-------------------------
const dimKeys = [
    'margin', 'marginTop', 'marginRight', 'marginBottom', 'marginLeft',
    'padding', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
    'height', 'minHeight', 'maxHeight',
    'width', 'minWidth', 'maxWidth'
];
const flexKeys = ['flex', 'flexBasis', 'flexDirection', 'flexGrow', 'flexShrink', 'flexWrap'];
const alignKeys = ['alignItems', 'alignSelf', 'alignContent', 'justifyContent'];
const overflowKeys = ['overflow', 'overflowX', 'overflowY'];
const otherKeys = ['top', 'left', 'position', 'display'];
const allKeys = [...dimKeys, ...flexKeys, ...alignKeys, ...overflowKeys, ...otherKeys];


//------------------------
// Implementation
//------------------------
const toPx = (v) => {
    // Note isFinite() is native JS - not _.isFinite() - true for numbers + numbers-strings.
    return isFinite(v) ? `${v}px` : v;
};

const toTlbrPx = (v) => {
    return isString(v) ? v.split(' ').map(side => toPx(side)).join(' ') : toPx(v);
};
