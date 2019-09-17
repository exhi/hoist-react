import {runInAction, toJS} from 'mobx';
import {applyMixin} from '../../utils/js';
import {XH} from '@xh/hoist/core';
import {isEmpty, sortBy, isEqual} from 'lodash';

export function RouteSupport({name, path, ...rest}) {
    return function(C) {
        console.debug('ADDING ROUTE', name);

        if (isEmpty(path)) {
            path = '/';
            if (name.includes('.')) {
                path += name.substring(name.lastIndexOf('.') + 1);
            } else {
                path += name;
            }
        }

        C.RouteName = name;

        if (!isEmpty(C.prototype._xhRouteParams)) {
            path += C.prototype._xhRouteParams.map(it => '?:' + it).join('');
        }

        const route = {
            name,
            path,
            ...rest
        };

        if (XH.router.isStarted()) {
            XH.routerModel.addRoutes([route]);
        } else {
            RouteSupport._xhRoutes = RouteSupport._xhRoutes || [];
            RouteSupport._xhRoutes.push(route);
        }

        RouteSupport.getRoutes = () => {
            if (!RouteSupport._xhRoutes) return [];
            return sortBy(RouteSupport._xhRoutes, 'name');
        };

        return applyMixin(C, {
            name: 'RouteSupport',

            init() {
                const paramNames = this._xhRouteParams;
                if (!paramNames) return;

                this.addReaction({
                    track: () => paramNames.map(it => this[it]),
                    run: (values) => {
                        const {routerState} = XH;
                        if (routerState.name.endsWith(name)) {
                            const newParams = {};
                            paramNames.forEach((prop, idx) => newParams[prop] = values[idx]);

                            if (!isEqual(routerState.params, newParams)) {
                                console.debug('UPDATING ROUTE PARAMS FOR', name, newParams);
                                XH.router.navigate(name, newParams, {replace: true});
                            }
                        }
                    }
                });

                this.addReaction({
                    track: () => XH.routerState,
                    run: (routerState) => {
                        if (routerState.name.endsWith(name)) {
                            console.debug('ROUTER STATE CHANGED FOR', name, toJS(routerState));
                            runInAction(() => {
                                paramNames.forEach(param => {
                                    // TODO: Look for a setter method?
                                    if (!isEqual(this[param], routerState[param])) this[param] = routerState.params[param];
                                });
                            });
                        }
                    },
                    fireImmediately: true
                });
            }
        });
    };
}

export function routeParam(target, property, descriptor) {
    target._xhRouteParams = target._xhRouteParams || [];
    target._xhRouteParams.push(property);

    // TODO: If not observable, make observable

    return descriptor;
}