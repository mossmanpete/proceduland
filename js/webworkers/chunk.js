let Chunk = function(x, z, hypo, bone)
{
  this.x = x;
  this.z = z;

  this.bone = bone;
  this.info = this.bone.info;

  this.vue_vertices_x = this.bone.vue_vertices_x;
  this.vue_vertices_z = this.bone.vue_vertices_z;

  last = this.info[this.info.length - 1];
  nb_v = last.v.offset + last.v.nb;
  nb_f = last.f.offset + last.f.nb;

  let vertices_y = new ArrayBuffer(nb_v * 4);
  this.vue_vertices_y = new Float32Array(vertices_y);

  let colors = new ArrayBuffer(nb_v * 3);
  this.vue_colors = new Uint8Array(colors);

  for (let i = 0, j = 0; i < nb_v; i++, j += 3)
  {
    pro = procedural(
      this.vue_vertices_x[i] + this.x,
      this.vue_vertices_z[i] + this.z
    );

    this.vue_vertices_y[i] = pro.height;

    this.vue_colors[j + 0] = pro.color.r;
    this.vue_colors[j + 1] = pro.color.g;
    this.vue_colors[j + 2] = pro.color.b;
  }
}

Chunk.prototype = {

  send: function()
  {
    postMessage({
      type : "chunk_refresh",
      position : {
        x : 0,
        z : 0
      },
      data : {
        vertices: this.send_vertices,
        faces: this.faces,
        vertex_normals: this.send_normals,
        colors: this.send_colors
      },
      chunk : {
        x : this.x,
        z : this.z
      }
    });
  },

  break1: function(l, x, z)
  {
    let i = this.info[l];
    let indice = i.indice;

    decalage = i.v.offset + x + (z * indice);
    dec_f_1 = (x + z * indice) * 4;

    if ( this.breaked_bitmap[l][dec_f_1 + 0]
      && this.breaked_bitmap[l][dec_f_1 + 1]
      && this.breaked_bitmap[l][dec_f_1 + 2]
      && this.breaked_bitmap[l][dec_f_1 + 3])
    return;

    // CHILDREN && NEIGNBOUR
    this.breaked_bitmap[l][dec_f_1 + 0] = 1; // NORTH
    this.breaked_bitmap[l][dec_f_1 + 1] = 1; // WEST
    this.breaked_bitmap[l][dec_f_1 + 2] = 1; // EAST
    this.breaked_bitmap[l][dec_f_1 + 3] = 1; // SOUTH

    if (l > 1)
    {
      x = Math.floor(x/2);
      z = Math.floor(z/2);

      // if (((x % 2) + (z % 2)) % 2)
      this.break2(l - 1, x, z, 1)
      this.break2(l - 1, x, z, 2)
      this.break2(l - 1, x, z, 0)
      this.break2(l - 1, x, z, 3)
    }

  },

  break2: function(l, x, z, o)
  {
    let indice = this.info[l].indice;

    dec_f_1a = (x + (z * indice * 2)) * 4;
    dec_f_1b = (x + (z * indice * 2) + indice) * 4;

    if (o == 0)
    {
      c1 = dec_f_1a + 0;
      c2 = dec_f_1a + 2;
    }
    else if (o == 1)
    {
      c1 = dec_f_1a + 1;
      c2 = dec_f_1b + 0;
    }
    else if (o == 2)
    {
      c1 = dec_f_1a + 3;
      c2 = dec_f_1b + 2;
    }
    else if (o == 3)
    {
      c1 = dec_f_1b + 3;
      c2 = dec_f_1b + 1;
    }

    if (this.breaked_bitmap[l][c1] && this.breaked_bitmap[l][c2])
      return

    this.breaked_bitmap[l][c1] = 1; // Right 
    this.breaked_bitmap[l][c2] = 1; // Left 

    // BREAK PARENT
    this.break1(l - 1, x, z);

    // BREAK NEIGNBOUR

    if (o == 0)
    {
      if (z - 1 < 0)
        return
      else
        this.break2(l, x, z - 1, 3);
    }
    else if (o == 1)
    {
      if (x - 1 < 0)
        return
      else
        this.break2(l, x - 1, z, 2);
    }
    else if (o == 2)
    {
      if (x + 1 >= indice)
        return
      else
        this.break2(l, x + 1, z, 1);
    }
    else if (o == 3)
    {
      if (z + 1 >= indice)
        return
      else
        this.break2(l, x, z + 1, 0);
    }
},

  does_break: function(hypo, real, v)
  {
    virtual = (
      this.vue_vertices_y[parents_faces[v + 1]]
      +
      this.vue_vertices_y[parents_faces[v + 2]]
    ) / 2;

    delta = Math.abs(virtual - this.vue_vertices_y[real]);
    if ( delta * 500 > hypo)
      return (true);
    return (false);
  },

  break_all: function(hypo, level)
  {
    this.breaked_bitmap = [];
    let breaked = new ArrayBuffer(nb_f);

    for (let l = 0; l <= level; l++)
    {
      i = this.info[l];
      this.breaked_bitmap[l] = new Uint8Array(breaked, i.f.offset, i.f.nb);
    }

    first = this.breaked_bitmap[0];

    for (let i = 0; i < first.length; i++)
      first[i] = 1;

    for (let l = level; l > 0; l--)
    {
      parents_faces = this.info[l - 1].f.data;
      i = this.info[l];
      let indice = i.indice;
      if (l % 2)
      {
        for (let z = 0; z < indice; z++) {
          for (let x = 0; x < indice; x++) {
            decalage = i.v.offset + x + (z * indice);

            dec_f_2b = (x + z * indice) * 2;
            dec_f_2 = dec_f_2b * 3;

            if ( this.does_break(hypo, decalage, dec_f_2))
              this.break1(l, x, z);
          }
        }
      }
      else
      {
        let ligne1 = (1 * indice);
        let ligne2 = (2 * indice) + 1;

        for (let z = 0; z < indice; z++) {
          for (let x = 0; x < indice; x++) {

            let decalage = i.v.offset + x + (z * ligne2);
            let dec_f_2 = (x + z * indice) * 4 * 3;

            if (this.does_break(hypo, decalage, dec_f_2))
              this.break2(l, x, z, 0);

            if (this.does_break(hypo, decalage + ligne1, dec_f_2 + 3))
              this.break2(l, x, z, 1);

            if (this.does_break(hypo, decalage + ligne1 + 1, dec_f_2 + 6))
              this.break2(l, x, z, 2);

            if (this.does_break(hypo, decalage + ligne2, dec_f_2 + 9))
              this.break2(l, x, z, 3);

          }
        }
      }
    }
  },

  clean: function(level)
  {
    for (let l = 1; l <= level; l++)
    {
      last_i = this.info[l - 1];
      i = this.info[l];

      let indice = i.indice;

      if (l % 2)
      {
        for (let z = 0; z < indice; z++)
        {
          for (let x = 0; x < indice; x++)
          {
            dec_f_1 = x + z * indice;
            dec_f_1 *= 4;

            dec_f_2 = x + z * indice;
            dec_f_2 *= 3 * 2;

            // set parents
            // set self
            if ( this.breaked_bitmap[l][dec_f_1 + 0] || this.breaked_bitmap[l][dec_f_1 + 1]
              || this.breaked_bitmap[l][dec_f_1 + 2] || this.breaked_bitmap[l][dec_f_1 + 3])
            {
              this.breaked_bitmap[l - 1][dec_f_2 / 3] = 0;
              this.breaked_bitmap[l - 1][dec_f_2 / 3 + 1] = 0;
            }
          }
        }
      }
      else
      {
        let ligne1 = (1 * indice);
        let ligne2 = (2 * indice) + 1;

        for (let z = 0; z < indice; z++)
        {
          for (let x = 0; x < indice; x++)
          {
            decalage = i.v.offset + x + (z * ligne2);

            dec_f_2 = x + z * indice;
            dec_f_2 *= 3 * 4;

            dec_f_1a = x + z * indice * 2;
            dec_f_1a *= 4;

            dec_f_1b =  x + z * indice * 2 + indice;
            dec_f_1b *= 4;

            if (this.breaked_bitmap[l][dec_f_1a + 0] || this.breaked_bitmap[l][dec_f_1a + 2])
              this.breaked_bitmap[l - 1][dec_f_2 / 3] = 0;
            if (this.breaked_bitmap[l][dec_f_1a + 1] || this.breaked_bitmap[l][dec_f_1b + 0])
              this.breaked_bitmap[l - 1][dec_f_2 / 3 + 1] = 0;
            if (this.breaked_bitmap[l][dec_f_1a + 3] || this.breaked_bitmap[l][dec_f_1b + 2])
              this.breaked_bitmap[l - 1][dec_f_2 / 3 + 2] = 0;
            if (this.breaked_bitmap[l][dec_f_1b + 3] || this.breaked_bitmap[l][dec_f_1b + 1])
              this.breaked_bitmap[l - 1][dec_f_2 / 3 + 3] = 0;
          }
        }
      }
    }
  },

  realoc: function()
  {

    let new_vertice = []; // DYNAMIQUE ARRAY KILL PERFORMANCES (300%)


    let nb_v = 0;
    let f = 0;
    let nb_f = 0;

    for (let i = 0; i < this.breaked_bitmap.length; i++)
      for (let j = 0; j < this.breaked_bitmap[i].length; j++)
        if (this.breaked_bitmap[i][j])
          nb_f++;
    this.faces = new Uint32Array(nb_f * 3 );


    for (let l = 0; l < this.breaked_bitmap.length; l++)
    {
      let data = this.info[l].f.data;
      for (let i = 0; i < this.breaked_bitmap[l].length; i++)
      {
        if (this.breaked_bitmap[l][i])
        {
          let b = i * 3;

          if (new_vertice[data[b + 0]] == undefined)
            new_vertice[data[b + 0]] = nb_v++;
          if (new_vertice[data[b + 1]] == undefined)
            new_vertice[data[b + 1]] = nb_v++;
          if (new_vertice[data[b + 2]] == undefined)
            new_vertice[data[b + 2]] = nb_v++;

          this.faces[f + 0] = new_vertice[data[b + 0]];
          this.faces[f + 1] = new_vertice[data[b + 1]];
          this.faces[f + 2] = new_vertice[data[b + 2]];

          f += 3;
        }
      }
    }

    this.send_vertices = new Float32Array(nb_v * 3);
    this.send_normals = new Float32Array(nb_v * 3);
    this.send_colors = new Uint8Array(nb_v * 3);

    for (let i = 0; i < new_vertice.length; i++)
    {
      if (new_vertice[i] != undefined )
      {
        let pos = new_vertice[i] * 3;
        this.send_vertices[pos + 0] = this.vue_vertices_x[i];
        this.send_vertices[pos + 1] = this.vue_vertices_y[i];
        this.send_vertices[pos + 2] = this.vue_vertices_z[i];

        this.send_colors[pos + 0] = this.vue_colors[i * 3];
        this.send_colors[pos + 1] = this.vue_colors[i * 3 + 1];
        this.send_colors[pos + 2] = this.vue_colors[i * 3 + 2];

        this.send_normals[pos + 0] = 0;
        this.send_normals[pos + 1] = 1;
        this.send_normals[pos + 2] = 0;
      }
    }
  }


};
