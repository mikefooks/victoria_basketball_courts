from functools import reduce
import geojson
from geojson import FeatureCollection, Feature

layer_properties = [
    ( 'garry_oak_grid.json', 'garry_oak' ),
    ( 'horse_chestnut_grid.json', 'horse_chestnut' ),
    ( 'cherry_blossom_grid.json', 'cherry_blossom' )
]

raw_data = open('garry_oak_grid.json', 'r')
main_geo = geojson.loads(raw_data.read())
raw_data.close()

sorting_key = lambda feat: feat['properties']['id']
main_geo['features'].sort(key=sorting_key)

for grid_square in main_geo['features']:
    grid_square['properties']['id'] = int(grid_square['properties']['id'])
    del grid_square['properties']['NUMPOINTS']

for props in layer_properties:
    data = open(props[0], 'r')
    geo = geojson.loads(data.read())
    data.close()
    geo['features'].sort(key=sorting_key)

    for idx in range(len(main_geo['features'])):
        main_feat = main_geo['features'][idx]
        sub_feat = geo['features'][idx]
        assert main_feat['properties']['id'] == sub_feat['properties']['id']
        main_feat['properties'][props[1]] = int(sub_feat['properties']['NUMPOINTS'])

string_dump = geojson.dumps(main_geo)
print(string_dump)
