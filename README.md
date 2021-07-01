<h2 align='center'><strong>vite-plugin-multi-device</strong> 🚀</h2>

<p align='center'>One codebase, Multiple outputs</p>

<p align='center'>
<a href='https://www.npmjs.com/package/vite-plugin-multi-device'>
<img src='https://img.shields.io/npm/v/vite-plugin-multi-device?color=f75e5e&style=flat-square'>
</a>
</p>
<br>

# Vite plugin for multiple device builds 

Build your application for multiple devices with [Vite](https://github.com/vitejs/vite)
and eliminate dead codes with [rollup](https://rollupjs.org/).


This plugin builds your project in two different directories, and after that you can serve these
directories based on user-agent header, subdomains or etc.


For ease of development, you can run the `vmd` command that runs
multiple vite servers simultaneously and automatically forwards
the request to one of them based on user agent.

## Features

- Framework aware (examples added with react, vuejs and svelte)
- Tree shakable code through rollup
- Configurable for adding more devices like **tablet**
- Separating based on filenames
- Separating based on If/else branches
- Testable code through mocking window.DEVICE
- Dev Server with device auto detection

## Installation

> This plugin only works with Vite >= 2

```bash
$ npm install -D vite-plugin-multi-device
// Or
$ yarn add -D vite-plugin-multi-device
```

Add to your `vite.config.js`:

```js
import vue from '@vitejs/plugin-vue';
import multiDevice from 'vite-plugin-multi-device';

export default {
  plugins: [vue(), multiDevice()],
};
```

Now you should define `DEVICE` environment variable before running your dev server to specify
which device are you willing to target.

For more ease of use, you can use `vmd` command to run a hybrid dev server to automatically detects the device based on user-agent

```js
// package.json
{
  "scripts": {
    "dev": "vmd", // This will run server with auto detection feature 
    "dev:desktop": "cross-env DEVICE=desktop vite",
    "dev:mobile": "cross-env DEVICE=mobile vite",
    "build:desktop": "cross-env NODE_ENV=production DEVICE=desktop vite build -m $MODE --outDir=dist/desktop",
    "build:mobile": "cross-env NODE_ENV=production DEVICE=mobile vite build -m $MODE --outDir=dist/mobile"
  }
}
```

## Getting Started

There are two ways to code for different devices
- Using if/else branches
- Using separate files

### Using if/else branches

Simply use `window.DEVICE.mobile` or `window.DEVICE.desktop` variable to detect user device.

> You can configure to support more devices in `vite.config.js`.
> or you can change the identifier to something other than `window.DEVICE.mobile` (eg: \_\_MOBILE\_\_)

React Example:

```jsx
export function App() {
    return (
      <div>This is { window.DEVICE.desktop ? 'Desktop device' : 'Mobile device' }</div>
    )
}
```

Vuejs Example:

```html
<template>
    <!-- inside vue templates -->
    <div v-if="DEVICE.mobile">This is mobile</div>

    <!-- VNode render branches will be eliminated by rollup and will not exist in final bundle, we explain it later -->
    <div v-if="DEVICE.desktop">This is desktop</div>
</template>

<script>
export default {
    mounted() {
        if (window.DEVICE.mobile) {
           console.log('Hi mobile user!')
        }
    }
}
</script>
```

Do not use DEVICE directly or dynamically.

```js
window.DEVICE.mobile // ok

const myVar = 'mobile'

window.DEVICE[myVar] // won't work

window.DEVICE['mobile'] // won't work

Object.keys(window.DEVICE) // won't work
```

### Using separate files

All files ending with `.{device}.{extension}` will take precedence to be used. eg: `MyComponent.mobile.js` or `MyStyle.desktop.css` 

```html
<!-- App.vue -->
<template>
   <div>
     <AppHeader />
   </div>
</template>

<script>
import AppHeader from './AppHeader.vue'

export default {
    components: {
        AppHeader
    }
}
</script>
```

# Vite plugin for multiple device builds 

Build your application for multiple devices with [Vite](https://github.com/vitejs/vite)
and eliminate dead codes with [rollup](https://rollupjs.org/).


This plugin builds your project in two different directories, and after that you can serve these
directories based on user-agent header, subdomains or etc.


For ease of development, you can run the `vmd` command that runs
multiple vite servers simultaneously and automatically forwards
the request to one of them based on user agent.


## Installation

> This plugin only works with Vite >= 2

```bash
$ npm install -D vite-plugin-multi-device
// Or
$ yarn add -D vite-plugin-multi-device
```

Add to your `vite.config.js`:

```js
import vue from '@vitejs/plugin-vue';
import multiDevice from 'vite-plugin-multi-device';

export default {
  plugins: [vue(), multiDevice()],
};
```

Now you can add these example scripts to your package.json to easily run dev server or build project.

`DEVICE` environment variable will define which device you are willing to target.

```js
// package.json
{
  "scripts": {
    "dev": "vmd", // This will run server with auto detection feature 
    "dev:desktop": "cross-env DEVICE=desktop vite",
    "dev:mobile": "cross-env DEVICE=mobile vite",
    "build:desktop": "cross-env NODE_ENV=production DEVICE=desktop vite build -m $MODE --outDir=dist/desktop",
    "build:mobile": "cross-env NODE_ENV=production DEVICE=mobile vite build -m $MODE --outDir=dist/mobile"
  }
}
```

## Getting Started

There are two ways to code for different devices
- Using if/else branches
- Using separate files

### Using if/else branches

Simply use `window.DEVICE.mobile` or `window.DEVICE.desktop` variable to detect user device.

> You can configure to support more devices in `vite.config.js`.
> or you can change the identifier to something other than `window.DEVICE.mobile` (eg: \_\_MOBILE\_\_)

Example:

```html
<template>
    <!-- inside vue templates -->
    <div v-if="DEVICE.mobile">This is mobile</div>

    <!-- VNode render branches will be eliminated by rollup and will not exist in final bundle, we explain it later -->
    <div v-if="DEVICE.desktop">This is desktop</div>
</template>

<script>
export default {
    mounted() {
        if (window.DEVICE.mobile) {
           console.log('Hi mobile user!')
        }
    }
}
</script>
```

Do not use DEVICE directly or dynamically.

```js
window.DEVICE.mobile // ok

const myVar = 'mobile'

window.DEVICE[myVar] // won't work

window.DEVICE['mobile'] // won't work

Object.keys(window.DEVICE) // won't work
```

### Using separate files

All files ending with `.{device}.{extension}` will take precedence to be used. eg: `MyComponent.mobile.js` or `MyStyle.desktop.css` 

```html
<!-- App.vue -->
<template>
   <div>
     <AppHeader />
   </div>
</template>

<script>
import AppHeader from './AppHeader.vue'

export default {
    components: {
        AppHeader
    }
}
</script>
```

```html
<!-- AppHeader.vue -->
<template>
   <div>
     Desktop Header
   </div>
</template>
```

```html
<!-- AppHeader.mobile.vue -->
<template>
   <div>
     <!-- This takes precendence on mobile build -->
     Mobile Header
   </div>
</template>
```

Also works with these packages:
- [https://github.com/hannoeru/vite-plugin-pages](https://github.com/hannoeru/vite-plugin-pages)
- [https://github.com/antfu/vite-plugin-components](https://github.com/antfu/vite-plugin-components)

## Building application

You can change your package.json build commands to something like the example below.
and use npm-run-all to build them in parallel 

```json
{
    "scripts": {
        "build:desktop": "cross-env NODE_ENV=production DEVICE=desktop vite build --outDir=dist/desktop",
        "build:mobile": "cross-env NODE_ENV=production DEVICE=mobile vite build --outDir=dist/mobile",
        "build": "npm-run-all -p build:*"
    }
}
```

## Serving website

You could write your own Nodejs http server to serve the outputs to users based on regex, or use a configured nginx server.

## Configuration
```ts
const defaultOptions = {
    devices: ['desktop', 'mobile'],

    // returns the identifiers that should be replaced. by default these two are considered
    replacement: (device) => ['DEVICE.' + device, 'window.DEVICE.' + device],

    // specifies how to transform a path to the device version path like: /src/app.js -> /src/app.mobile.js
    resolvePath: (path, device) => path.replace(/\.([^?/\\]+)(\?.*)?$/, `.${device}.$1$2`),

    // Environment variable to detect device (build command)
    env: 'DEVICE'
};
``` 
