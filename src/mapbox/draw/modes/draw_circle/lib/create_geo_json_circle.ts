///////////////////////////////////////////////////////////////////////////////
//版权所有（C）2002-2022，成都梦想凯德科技有限公司。
//本软件代码及其文档和相关资料归成都梦想凯德科技有限公司
//应用包含本软件的程序必须包括以下声明
//在版权声明中：
//此应用程序与成都梦想凯德科技有限公司成协议。
//通过使用本软件、其文档或相关材料
///////////////////////////////////////////////////////////////////////////////



// 创建圆形 geojson数据
export function create_geo_json_circle(coordinates: number[], radius: number) {
    const degrees_between_points = 6.0;
    const number_of_points = Math.floor(360 / degrees_between_points);
    const dist_radians = radius / 6250;
    const center_lat_radians = coordinates[1] * Math.PI / 180;
    const center_lon_radians = coordinates[0] * Math.PI / 180;
    const polygon_coordinates = [];

    for (let index = 0; index < number_of_points; index++) {
        const degrees = index * degrees_between_points;
        const degree_radians = degrees * Math.PI / 180;
        const point_lat_radians = Math.asin(Math.sin(center_lat_radians) * Math.cos(dist_radians) + Math.cos(center_lat_radians) * Math.sin(dist_radians) * Math.cos(degree_radians));
        const point_lon_radians = center_lon_radians + Math.atan2(Math.sin(degree_radians) * Math.sin(dist_radians) * Math.cos(center_lat_radians), Math.cos(dist_radians) - Math.sin(center_lat_radians) * Math.sin(point_lat_radians));
        const point_lat = point_lat_radians * 180 / Math.PI;
        const point_lon = point_lon_radians * 180 / Math.PI;
        const point = [point_lon, point_lat];
        polygon_coordinates.push(point);
    }
    polygon_coordinates.push(polygon_coordinates[0]);
    return polygon_coordinates;
}

