# node-proxygenerator

[![Build Status](https://travis-ci.org/mrpapercut/node-proxygenerator.svg?branch=master)](https://travis-ci.org/mrpapercut/node-proxygenerator)
[![Coverage Status](https://coveralls.io/repos/github/mrpapercut/node-proxygenerator/badge.svg?branch=master)](https://coveralls.io/github/mrpapercut/node-proxygenerator?branch=master)

## Introduction
This module is meant to create a wrapper around ES6 classes so we can trace all actions that are performed on this class, such as constructing the class, function calls, setters, getters etc. It achieves this by wrapping the target class in a Proxy Object.

The [Proxy Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) is an ES6 object that allows us to catch and/or modify how Javascript works. Other than tracing, what this module does, the Proxy object can also be used to implement things such as [case-insensitive functions](https://mrpapercut.com/blog/2016-11-30-case-insensitive-functions-in-javascript-with-proxy) in Javascript.

## Installation
**node-proxygenerator** can be found on [npm](https://www.npmjs.com/package/node-proxygenerator).

```$ npm install node-proxygenerator```

## Purpose
This Proxy-generator can be wrapped around common ES6 classes, so you can see exactly which functions and properties are being called/used/modified. This can be useful for analysis of JS classes. The reason why the Proxy object is used is that it does not modify the original code at all. It simply logs what is happening, and forwards the requests as if the Proxy wasn't even there.

## Limitations
For now, it can only generate a Proxy around 1 class, excluding extended or inherited classes. So if you want to track multiple classes, they each need to be wrapped in their own Proxy

## Usage
```js
const ProxyGenerator = require('node-proxygenerator');

// Create a simple class
class MyClass {
  constructor(msg) {
    this.msg = msg || '';
  }
  
  getMessage() {
    return this.msg;
  }
  
  setMessage(msg) {
    this.msg = msg;
  }
}

// Create a Proxy version of the class
// The first argument for ProxyGenerator is always the class that you want to wrap
const MyProxyClass = new ProxyGenerator(MyClass);

// MyProxy behaves exactly as MyClass, so it can be initialized like this:
const myClass = new MyProxyClass('Foo');
myClass.setMessage('Bar');

// See if myClass.msg has been correctly set
myClass.getMessage(); // "Bar"
```
This will log the following entries, in order:
```
> CONSTRUCT new MyClass("Foo")
> CALL MyClass.setMessage("Bar")
> SET MyClass.msg = "Bar"
> CALL MyClass.getMessage()
> GET MyClass.msg
< "Bar"
```

## Custom logging
By default, this module will log everything that happens inside a class, with the exception of calling native functions (such as .toString or .call) because these will return in nearly infinite loops. Javascript calls these functions all the time, for example when accessing or setting properties.

`console.log` is the default function used for logging, but this can be overwritten by supplying your own logfunction.
```js
const logArr = [];
const logger = msg => logArr.push(msg);

const MyProxyClass = new ProxyGenerator(MyClass, {
  logFunction: logger
});

const myClass = new MyProxyClass('Foo');
myClass.setMessage('Bar');
myClass.getMessage();
```
Now all log entries are pushed the array instead of logged to console:
```
[ '> CONSTRUCT new MyClass("Foo")',
  '> CALL MyClass.setMessage("Bar")',
  '> SET MyClass.msg = "Bar"',
  '> CALL MyClass.getMessage()',
  '> GET MyClass.msg',
  '< "Bar"' ]
```
