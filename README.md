<h2 align='center'><strong>vite-plugin-multi-device</strong> 🚀</h2>

<p align='center'>One codebase, Multiple outputs</p>

<p align='center'>
<a href='https://www.npmjs.com/package/vite-plugin-multi-device'>
<img src='https://img.shields.io/npm/v/vite-plugin-multi-device?color=f75e5e&style=flat-square'>
</a>
</p>
<br>

# Vite plugin for multiple device builds 

> Build your application for multiple devices with [Vite](https://github.com/vitejs/vite)
> 
> and eliminate dead codes with [rollup](https://rollupjs.org/).


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

## Getting Started

There are two ways to code for different devices
- Using if/else branches
- Using separate files

### Using if/else branches

Simply use `Object.DEVICE.mobile` or `Object.DEVICE.desktop` variable to detect user device.

> You can configure to support more devices in `vite.config.js`.
> or you can change the identifier to something other than `Object.DEVICE`
> 
> We explain it later why we chose this identifier.

Example:

```html
<template>
    <!-- inside vue templates -->
    <div v-if="Object.DEVICE.mobile">This is mobile</div>

    <!-- VNode render branches will be eliminated by rollup and will not exist in final bundle, we explain it later -->
    <div v-if="Object.DEVICE.desktop">This is desktop</div>
</template>

<script>
export default {
    mounted() {
        if (Object.DEVICE.mobile) {
           console.log('Hi mobile user!')
        }
    }
}
</script>
```

Do not use Object.DEVICE directly or dynamically, cause it won't work on production.

```js
const myVar = 'mobile'

Object.DEVICE[myVar] // won't work

Object.DEVICE['mobile'] // won't work

Object.keys(Object.DEVICE) // won't work
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
- [https://github.com/vamplate/vite-plugin-voie](https://github.com/vamplate/vite-plugin-voie)
- [https://github.com/antfu/vite-plugin-components](https://github.com/antfu/vite-plugin-components)

## Building application

You should change your package.json build commands to something like the example below.
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

In dev server, Object.DEVICE will be set at runtime automatically and changes if you change your device (user-agent). you can use Chrome Devtools.

## Serving website

You could write your own Nodejs http server to serve the outputs to users based on regex, or use a configured nginx server.

## Configuration
```ts
const defaultOptions = {
    devices: {
        // Provide regex map for devices based on User Agent
        // regex for mobile detection
        mobile: /Mobile|iP(hone|od|ad)|Android|BlackBerry|IEMobile|Kindle|NetFront|Silk-Accelerated|(hpw|web)OS|Fennec|Minimo|Opera M(obi|ini)|Blazer|Dolfin|Dolphin|Skyfire|Zune/,

        // fallback to desktop
        desktop: true,
    },

    // Build for selected device, it uses DEVICE env variable
    buildFor: process.env.DEVICE || 'desktop',

    // Identifier to detect device
    id: 'Object.DEVICE',
};
``` 

## Caveats

The reason we chose `Object.DEVICE` identifier is that Vue by default,
prefix all the variables used in render function with `_ctx.DEVICE` or `this.DEVICE`.
This will prevent us to use `DEVICE` variable directly in templates.

You may think we could inject it somehow to our app global properties, like $device, but in this way rollup could not eliminate the dead code in render functions.

[https://github.com/vuejs/vue-next/blob/master/packages/shared/src/globalsWhitelist.ts](https://github.com/vuejs/vue-next/blob/master/packages/shared/src/globalsWhitelist.ts)

The link above shows the whitelisted objects that we can use inside template code, and there is no way to add our custom objects to it, yet.

## Other frameworks support

I did not test this on other frameworks but there is no Vue specific codes and it may work on apps using Vite with other frameworks

