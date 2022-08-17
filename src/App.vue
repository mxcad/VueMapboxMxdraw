<template>
  <hello-world />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import HelloWorld from "./components/HelloWorld.vue";

export default defineComponent({
  name: "App",
  components: {
    HelloWorld,
  },
});
</script>

<style>
@import url(./icon/iconfont.css);
#app {
  width: 100%;
  height: 100%;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
html,
body {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
}
.none {
  display: none;
}
.flex {
  display: flex;
}
.mx_popup .mapboxgl-popup-tip{
  border-top-color: #000
}
.mx_popup .mapboxgl-popup-content {
   background: #000;
   color: #fff;
}

.mapboxgl-ctrl-group .mapbox-gl-draw_ctrl-draw-btn+.mapbox-gl-draw_ctrl-draw-btn {
  border-top: 1px solid #ddd;
}
:root {
  --from: 0px;
  --to: 80px;
  --s: 1s;
}
.run {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  opacity: 0.5;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  border: 4px solid #00c1de;
  background: #ff0000;
  -moz-animation: mymove var(--s) infinite; /* Firefox */
  -webkit-animation: mymove var(--s) infinite; /* Safari and Chrome */
  -o-animation: mymove var(--s) infinite; /* Opera */
}

@keyframes mymove {
  from {
    width: var(--from);
    height: var(--from);
    opacity: 0.5;
  }
  to {
    width: var(--to);
    height: var(--to);
    opacity: 0.1;
  }
}

@-moz-keyframes mymove /* Firefox */ {
  from {
    width: var(--from);
    height: var(--from);
    opacity: 0.5;
  }
  to {
    width: var(--to);
    height: var(--to);
    opacity: 0.1;
  }
}

@-webkit-keyframes mymove /* Safari and Chrome */ {
  from {
    width: var(--from);
    height: var(--from);
    opacity: 0.5;
  }
  to {
    width: var(--to);
    height: var(--to);
    opacity: 0.1;
  }
}

@-o-keyframes mymove /* Opera */ {
  from {
    width: var(--from);
    height: var(--from);
    opacity: 0.5;
  }
  to {
    width: var(--to);
    height: var(--to);
    opacity: 0.1;
  }
}
</style>
