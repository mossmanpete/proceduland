# proceduland
Procedural terrain generation (three.js / perlin noise)

A web worker compute chunk by chunk the necessary level of detail of each polygon from a 2d height map (perlin)
and return buffers with only the necessary vertices / faces to display

the 2d height map is generated by some harmonic perlin noise but could be replaced by anything else,
a black and white earth height map png for example.
