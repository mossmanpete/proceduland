# proceduland
Chuck loader and procedural terrain generation

A web worker compute chunk by chunk the necessary level of detail
and return buffers with only the necessary vertices / faces to display

the 2d height map is generated by some harmonic perlin noise but could be replaced by anything else,
a black and white height map png for example could be used.

# Features :
* Chunks generation in separated thread with a dedicated webworker
* LOD (https://fr.wikipedia.org/wiki/Level_of_detail)
* Moving around with WASD will refreash all necessary chunks with new appropriate LOD
* Procedural terrain generation (simplex2)
* Fast reload, Worker store in buffers only whats needed where and when it is. (reload 2km diametre zone in less than one seconde with a tesselation ground's precision of 25cm)
* UV mapping generated

# To do :
* Finish tesselation cracks and parents / neigbour detection algo (While breaking diagonals, N S E W are diplayed. it should't)
* Jumbo chunks (chunks with size doubled for less number of mesh's objects)
* Vertices morphing for eye smooth replacement chunks
* Normal's map generation
* Texture splatting with bumpmap
* JSM it

# Screenshot
![Alt text](/screenshot/0.png?raw=true "Optional Title")
![Alt text](/screenshot/1.png?raw=true "Optional Title")
![Alt text](/screenshot/2.png?raw=true "Optional Title")
LOD by distance
![Alt text](/screenshot/3.png?raw=true "Optional Title")
Loading and refresh partial content.
![Alt text](/screenshot/4.png?raw=true "Optional Title")
User can move in the world.
![Alt text](/screenshot/5.png?raw=true "Optional Title")

LOD by distance and relief optimisation

- Vertices ----------  
Left    : 1 175 310  
Right   :   499 344  
Display :        42%  
Gain    :       235%  
- Faces -------------  
Left    : 2 279 424  
Right   :   952 794  
Display :        41%  
Gain    :       239%  
---------------------  

![Alt text](/screenshot/6.png?raw=true "Optional Title")
![Alt text](/screenshot/7.png?raw=true "Optional Title")
