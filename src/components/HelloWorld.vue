<template>
    <el-header>Header</el-header>
    <el-container>
      <el-aside width="200px">
        <my-menu></my-menu>
      </el-aside>
      <el-main >
       <div id="map"></div>
      </el-main>
    </el-container>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { init as mapboxInit } from "@/mapbox/init";
import MyMenu from "./MyMenu.vue";
export default defineComponent({
  name: "HelloWorld",
  components: {
    'my-menu': MyMenu,
  },
  data() {
    return {};
  },
  mounted() {
    this.init();
  },

  methods: {
    init() {
      // mapbox 初始化入口
      mapboxInit();
    },
  },
});
</script>
<style>

#map {
  width: 100%;
  height: 100%;
}
.mapboxgl-ctrl-logo {
  display: none !important;
}
.el-container {
  height: calc(100% - 60px);
}

</style>
