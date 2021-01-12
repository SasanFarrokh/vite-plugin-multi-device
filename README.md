# Multiple builds per device


### Usage

Simply you can do checking in your code like these:

```html
<template>
    <!-- inside vue templates -->
    <div v-if="DEVICE.mobile">This is mobile</div>
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
