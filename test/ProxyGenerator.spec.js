'use strict';

const chai = require('chai'),
    path = require('path'),
    expect = chai.expect,
    ProxyGenerator = require(path.join(__dirname, '..', 'src', 'ProxyGenerator'));

class TestClass {
    constructor(str) {
        this.msg   = str;
        this.index = 0;
        this.flag  = false;
        this.arr   = ['a', 1, null, undefined, [], {}];
        this.obj   = {a: 'a', b: 1, c: null, d: undefined, e: new Array(), f: new Object(), g: new Date()};
        this.nul   = null;
        this.und   = undefined;
    }

    setMsg(msg) {
        this.msg = msg;
    }

    getMsg() {
        return this.msg;
    }

    incrIndex() {
        this.index++;
    }

    toggleFlag() {
        this.flag = !this.flag;
    }

    getArr() {
        return this.arr;
    }

    getObj() {
        return this.obj;
    }

    getNull() {
        return this.nul === null ? null : null;
    }

    getUndefined() {
        return this.und;
    }

    getFn() {
        return () => {};
    }

    getDate() {
        return new Date();
    }
}

describe('ProxyGenerator', function() {
    describe('constructor()', function() {
        const myClass = new ProxyGenerator(TestClass);

        it('should return instanceof original class', () => {
            expect(myClass instanceof TestClass).to.be.true;
            expect(myClass.length).to.be.undefined;
            expect(myClass.constructor.name).to.equal('TestClass');
        });

        it('should be able to call functions', () => {
            expect(() => {
                myClass.setMsg('Hello world');
            }).to.not.throw(Error);

            expect(myClass.getMsg()).to.eql('Hello world');

            expect(() => {
                myClass.setMsg([]);
            }).to.not.throw(Error);

            expect(() => {
                myClass.setMsg({});
            }).to.not.throw(Error);

            expect(() => {
                myClass.incrIndex();
            }).to.not.throw(Error);

            expect(myClass.getArr() instanceof Array).to.be.true;
            expect(myClass.getObj() instanceof Object).to.be.true;
            expect(myClass.getDate() instanceof Date).to.be.true;

            expect(typeof myClass.getFn()).to.eql('function');
            expect(myClass.getUndefined()).to.eql(undefined);
            expect(myClass.getNull()).to.eql(null);
        });

        it('should catch native functions', () => {
            expect(myClass.hasOwnProperty('_name')).to.be.false;
        });

        it('should be able to access properties', () => {
            expect(myClass.index).to.not.be.undefined;
        });
    });
});
