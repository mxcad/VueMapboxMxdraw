import * as gl__mapbox from "@danmarshall/deckgl-typings/deck.gl__mapbox"
import * as gl__layers from "@danmarshall/deckgl-typings/deck.gl__layers"
import * as gl__core from "@danmarshall/deckgl-typings/deck.gl__core"
import * as gl__aggregation_layers from "@danmarshall/deckgl-typings/deck.gl__aggregation-layers"
import * as gl__extensions from "@danmarshall/deckgl-typings/deck.gl__extensions"
import * as gl__mesh_layers from "@danmarshall/deckgl-typings/deck.gl__mesh-layers"
import * as gl__geo_layers from "@danmarshall/deckgl-typings/deck.gl__geo-layers"

declare module '@deck.gl/core' {
    export namespace gl__core {}
}

declare module '@deck.gl/mapbox' {
    export namespace gl__mapbox {}
}

declare module '@deck.gl/layers' {
    export namespace gl__layers {}
}

declare module '@deck.gl/aggregation-layers' {
    export namespace gl__aggregation_layers {}
}

declare module '@deck.gl/extensions' {
    export namespace gl__extensions {}
}

declare module '@deck.gl/mesh-layers' {
    export namespace gl__mesh_layers {}
}

declare module '@deck.gl/geo-layers' {
    export namespace gl__geo_layers {}
}