<template>
  <el-menu
    :unique-opened="true"
    default-active="2"
    class="el-menu-vertical-demo"
    :collapse="isCollapse"
    @open="handleOpen"
    @close="handleClose"
  >
    <template v-for="(item, index) in datas" :key="index">
      <el-sub-menu v-if="item.children.length > 0" :index="index + ''">
        <template #title>
          <el-icon v-if="item.icon" :class="item.icon"> </el-icon>
          <span>{{ item.title }}</span>
        </template>
        <el-menu-item-group>
          <el-menu-item
            v-for="(item1, index1) in item.children"
            :key="index + '-' + index1"
            :index="index + '-' + index1"
            @click="handleClick(item1)"
          >
            <el-icon v-if="item1.icon" :class="item1.icon"></el-icon>
            <template v-if="item1" #title>{{ item1.title }}</template>
          </el-menu-item>
        </el-menu-item-group>
      </el-sub-menu>

      <el-menu-item v-else :index="index + ''" @click="handleClick(item)">
        <el-icon v-if="item.icon" :class="item.icon"></el-icon>

        <template #title>{{ item.title }}</template>
      </el-menu-item>
    </template>
  </el-menu>
</template>

<script  lang="ts">
import { MxMapBox, init } from "@/mapbox";
import { MxFun } from "mxdraw";
import { defineComponent } from "vue";

export default defineComponent({
  name: "MyMenu",
  components: {},
  data() {
    return {
      isCollapse: false,
      datas: [
        {
          title: "综合示例",
          icon: "iconfont icon-ercikaifashili",
          cmd: "",
          children: [
            {
              title: "人员定位与数据监控",

              cmd: "Mx_Personnel_positioning",
            },
            {
              title: "城市3d",
              icon: "",
              cmd: "Mx_city_3d",
            },
            {
              title: "CAD GIS",
              icon: "",
              cmd: "Mx_CADGISDemo",
              autoinit:false
            },
          ],
        },
        {
          title: "threejs对象",
          icon: "iconfont icon-ercikaifashili",
          cmd: "",
          children: [
            {
              title: "四棱锥标注动画",
              cmd: "Mx_Three_Diamond_Tag",
            },
            {
              title: "波动光圈",
              cmd: "Mx_Three_Diffusion_Halo",
            },
            {
              title: "飞线线",
              cmd: "Mx_Three_Fly_Line",
            },
            {
              title: "雷达扫描",
              cmd: "Mx_Three_Radar",
            },
            {
              title: "径向渐变球",
              cmd: "Mx_Three_Radial_Gradient_Sphere",
            },
            {
              title: "立体光墙",
              cmd: "Mx_Three_Stereo_Light_Wall",
            },
            {
              title: "波动光墙",
              cmd: "Mx_Three_Wave_Light_Wall",
            },
            {
              title: "模型动画",
              cmd: "Mx_Load_GLTF_model",
            },
            {
              title: "拉伸模型",
              cmd: "Mx_Stretching_Model",
            },
            {
              title: "three图层",
              cmd: "Mx_Three_layer",
            },
          ],
        },
        {
          title: "deck图层",
          icon: "",
          cmd: "",
          children: [
            {
              title: "弧线图层",
              cmd: "Mx_Deck_Arc_Layer",
            },
            {
              title: "散点图层",
              cmd: "Mx_Deck_Scatterplot_Layer",
            },
            {
              title: "等线值图层",
              cmd: "Mx_Deck_Contour_Map_Layer",
            },
            {
              title: "线动画图层",
              cmd: "Mx_Deck_LineAnimation_Layer",
            },
            {
              title: "图案填充图层",
              cmd: "Mx_Deck_Filling_Pattern_Layer",
            },
            {
              title: "点云图层",
              cmd: "Mx_Deck_Point_Cloud_Layer",
            },
            {
              title: "场景图层",
              cmd: "Mx_Deck_Scenario_Layer",
            },
            {
              title: "网格图层",
              cmd: "Mx_Deck_Grid_Layer",
            },
            {
              title: "模型图层",
              cmd: "Mx_Deck_Model_Layer",
            },
            {
              title: "路径流动图层",
              cmd: "Mx_Deck_Flow_Path_Layer",
            },
            {
              title: "复合图层",
              cmd: "Mx_Deck_CompositeLayer"
            }
          ],
        },
        {
          title: "L7图层",
          cmd: "",
          icon: "",
          children: [
            {
              title: "光柱和路径动画",
              cmd: "Mx_L7_Beam_Path_Animation",
            },
            {
              title: "飞线线动画",
              cmd: "Mx_L7_Flight_Line_Animation",
            },
            {
              title: "蜂窝图3D",
              cmd: "Mx_L7_Figure3d_Honeycomb",
            },
            {
              title: "渐变柱状图",
              cmd: "Mx_L7_Gradient_Histogram",
            },
            {
              title: "等值线图层",
              cmd: "Mx_L7_Contour",
            },
            {
              title: "网格热力图",
              cmd: "Mx_L7_Grid_Diagram",
            },
            {
              title: "气泡动画",
              cmd: "Mx_L7_Bubble_Animation"
            }
          ],
        },
        {
          title: "互联网地图",
          icon: "",
          cmd: "",
          children: [
            {
              title: "百度矢量",
              cmd: "Mx_Internet_Map_bdsl",
            },
            {
              title: "百度影像",
              cmd: "Mx_Internet_Map_bdyx",
            },
            {
              title: "高德矢量",
              cmd: "Mx_Internet_Map_gdsl",
            },
            {
              title: " 高德矢量,无注记版",
              cmd: "Mx_Internet_Map_gdslwzj",
            },
            {
              title: "高德影像",
              cmd: "Mx_Internet_Map_gdyx",
            },
            {
              title: "GeoQ普通地图",
              cmd: "Mx_Internet_Map_geoq",
            },
            {
              title: "GeoQ浅色地图",
              cmd: "Mx_Internet_Map_geoqGray",
            },
            {
              title: "GeoQ深蓝色地图",
              cmd: "Mx_Internet_Map_geoqPurplishBlue",
            },
            {
              title: "GeoQ暖色调地图",
              cmd: "Mx_Internet_Map_geoqWarm",
            },
            {
              title: "OSM地图",
              cmd: "Mx_Internet_Map_osm",
            },
            {
              title: "天地图地形",
              cmd: "Mx_Internet_Map_tdtdx",
            },
            {
              title: "加载天地图普通地图",
              cmd: "Mx_Internet_Map_tdtsl",
            },
            {
              title: "天地图影像",
              cmd: "Mx_Internet_Map_tdtyx",
            },
          ],
        },
        {
          title: "控件",
          cmd: "",
          icon: "",
          children: [
            {
              title: "小地图控件",
              cmd: "addMinMpaContorl",
            },
            {
              title: "mapbox基础控件",
              cmd: "addMapContorl",
            },
            {
              title: "添加绘制控件",
              cmd: "addDrawTool",
            },
          ],
        },
        {
          title: "几何计算",
          cmd: "",
          icon: "",
          children: [
            {
              title: "求最近点",
              cmd: "strivesForTheClosestPoint",
            },
            {
              title: "计算最短路径",
              cmd: "computingTheShortestPath",
            },
            {
              title: "等值线分析",
              cmd: "isolineAnalyzing"
            },
            {
              title: "缓冲区计算",
              cmd: "bufferCalculation"
            }
          ],
        },
        {
          title: "图层",
          cmd: "",
          icon: "",
          children: [
            {
              title: "背景遮罩层",
              cmd: "backgroundLayer",
            },
            {
              title: "自定义水印背景",
              cmd: "customWatermarkBackgroundLayer",
            },
            {
              title: "热力图",
              cmd: "heatmapLayer",
            },
            {
              title: "栅格图像图层",
              cmd: "radarLayer",
            },
            {
              title: "天空图层",
              cmd: "skyLayer",
            },
          ],
        },
        {
          title: "动画",
          cmd: "",
          icon: "",
          children: [
            {
              title: "圆动画",
              cmd: "circleAnimate",
            },
            {
              title: "圆环动画",
              cmd: "annulusAnimation"
            },
            {
              title: "拉伸动画",
              cmd: "stretchAnimation"
            },
            {
              title: "虚线路径动画",
              cmd: "dottedLinePathAnimation"
            },
            {
              title: "线图案路径动画",
              cmd: "linePatternPathAnimation"
            },
            {
              title: "多段线拉伸",
              cmd: "multiSegmentStretchAnimation"
            },
            {
              title: "图标路径动画",
              cmd: "iconPathAnimation"
            },
            {
              title: "自定义图标动画",
              cmd: "customIconAnimation"
            }
          ]
        },
        {
          title: "图形",
          icon: "",
          cmd: "",
          children: [
            {
              title: "圆",
              cmd: "MxCircleTest"
            },
            {
              title: "曲线",
              cmd: "MxCurveTest"
            },
            {
              title: "椭圆",
              cmd: "MxEllipseTest"
            }
          ]
        },
        {
          title: "点标记",
          icon: "",
          cmd: "",
          children: [
            {
              title: "呼吸的光圈",
              cmd: "apertureOfBreath"
            },
            {
              title: "扩散的点",
              cmd: "diffusionDot"
            },
            {
              title: "荧光点",
              cmd: "phosphorDot"
            },
            {
              title: "发光的光环",
              cmd: "glowingHalo"
            },
            {
              title: "旋转的光环",
              cmd: "rotatingHalo"
            },
            {
              title: "旋转的文本框",
              cmd: "rotatedTextBox"
            },
            {
              title: "缩放级别可见",
              cmd: "zoomTag"
            },
            {
              title: "地图视区可见",
              cmd: "mapViewDisplayTag"
            },
            {
              title: "不重叠解决方法",
              cmd: "overlapTag"
            },
            {
              title: "点符号聚合",
              cmd: "pointSymbolAggregation"
            },
            {
              title: "聚合自定义图标",
              cmd: "dotSymbolsAggregateCustomIcons"
            },
            {
              title: "点标记Marker聚合",
              cmd: 'pointMarkerAggregation'
            }
          ]
        },
        {
          title: "右键菜单",
          cmd: "rightClickMenu",
          icon: "",
          children: []
        },
        {
          title: "设置标记或弹框高度",
          cmd: "setHeight",
          icon: "",
          children: []
        }
      ],
      isLoad: true,
    };
  },
  mounted() {},

  methods: {
    handleOpen(key: string, keyPath: string[]) {
      console.log(key, keyPath);
    },
    handleClose(key: string, keyPath: string[]) {
      console.log(key, keyPath);
    },
    async handleClick(item: any) {
      let key = item.cmd;
      let autoinit = item.autoinit;

      if (key) {
        if (!this.isLoad) {
          return;
        }
        this.isLoad = false;
        // 每次执行命令 都先删除map地图
        MxMapBox.getMap().remove();
        if(!(autoinit === false))
        {
            // 重新初始化mapbox
            init(key);
        }
        else{
            // 执行触发对应的命令事件
            MxFun.sendStringToExecute(key);
        }
        
        this.isLoad = true;
      }
    },
  },
});
</script>

<style>
.el-menu-vertical-demo:not(.el-menu--collapse) {
  width: 200px;
  height: 100%;
}
</style>