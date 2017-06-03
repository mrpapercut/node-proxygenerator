class ProxyGenerator {
    constructor(_class, _config) {
        const self = this;

        this._class  = _class;
        this._config = _config || {
            logFunction: console.log
        };

        return class {
            constructor() {
                const args = [...arguments];
                self.initializedClass = new self._class(...args);
                self.log('CONSTRUCT', 'new ' + self.initializedClass.constructor.name, [...args]);

                return new Proxy(self.initializedClass, self.getProxyProps());
            }
        };
    }

    getProxyProps() {
        const self = this;

        return {
            get(target, propKey, receiver) {
                // Accessing properties
                if (target.hasOwnProperty(propKey)) {
                    self.log('GET', target.constructor.name + '.' + propKey, null, target[propKey]);

                // Calling functions
                } else if (typeof target[propKey] === 'function' && !self.isNative(target[propKey])) {
                    return new Proxy(target[propKey], {
                        apply(applyTarget, thisArg, args) {
                            self.log('CALL', thisArg.constructor.name + '.' + propKey, [...args]);

                            return Reflect.apply(applyTarget, thisArg, args);
                        }
                    });
                }

                return target[propKey];
            },
            set(target, propKey, value, receiver) {
                self.log('SET', target.constructor.name + '.' + propKey, [value]);
                return target[propKey] = value;
            }
        }
    }

    isNative(value) {
        const toString = Object.prototype.toString;

        const fnToString = Function.prototype.toString;

        const reHostCtor = /^\[object .+?Constructor\]$/;

        const reNative = RegExp('^'
            + String(toString)
            .replace(/[.*+?^${}()|[\]\/\\]/g, '\\$&')
            .replace(/toString|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?')
            + '$');

        // TODO: use isNative for native properties too
        // const type = typeof value;
        // return type === 'function' ? reNative.test(fnToString.call(value))
        // : (value && type === 'object' && reHostCtor.test(toString.call(value))) || false;

        return reNative.test(fnToString.call(value));

    }

    parseType(arg) {
        let res;

        switch (typeof arg) {
            case 'string':
                res = '"' + arg + '"';
                break;
            case 'number':
            case 'boolean':
            case 'function':
            case 'undefined':
                res = '' + arg;
                break;
            case 'object':
                if (arg === null) res = 'null';
                else if (arg.constructor.name === 'Array') res = '[' + arg.map(a => this.parseType(a)).join(', ') + ']';
                else if (arg.constructor.name === 'Object') {
                    let obj = [];
                    for (let val in arg) obj.push(`${val}: ${this.parseType(arg[val])}`);
                    res = `{${obj.join(', ')}}`;
                } else res = arg;
        }

        return res;
    }

    log(method, name, args, result) {
        args = args ? args.map(arg => this.parseType(arg)).join(', ') : '';
        if (method === 'CALL' || method === 'CONSTRUCT') args = `(${args})`;
        else if (method === 'SET') args = ` = ${args}`;

        this._config.logFunction(`> ${method} ${name}${args}`);
        if (result) this._config.logFunction(`< ${this.parseType(result)}`);
    }
}

module.exports = ProxyGenerator;
