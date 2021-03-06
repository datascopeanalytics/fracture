/**
 * Returns a random integer between min (inclusive) and max (inclusive)
 * Using Math.round() will give you a non-uniform distribution!
 * thanks to http://stackoverflow.com/a/1527820/892506
 */
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

var datascope_colors = [
  new Color(255 / 255, 96 / 255, 0 / 255),
  new Color(0 / 255, 142 / 255, 245 / 255),
  new Color(255 / 255, 21 / 255, 171 / 255),
  new Color(243 / 255, 237 / 255, 0 / 255),
  new Color(0 / 255, 204 / 255, 102 / 255),
];

if (Math.random() > 0.5) {
  var get_sub_color = function () {
    return datascope_colors[Math.floor(Math.random()*datascope_colors.length)];
  }
  var get_stroke_color = function () {
    return 'white';
  }
  var get_stroke_width = function () {
    return 1;
  }
} else {
  var get_sub_color = function () {
    return 'white';
  }
  var get_stroke_color = function () {
    return datascope_colors[Math.floor(Math.random()*datascope_colors.length)];
  }
  var get_stroke_width = function () {
    return 2;
  }
}

// This takes a polygon and returns the centroid. See:
// https://en.wikipedia.org/wiki/Centroid#Centroid_of_polygon
function centroid(polygon) {
  var area = 0;
  var c_x = 0;
  var c_y = 0;
  _.each(polygon.curves, function (curve) {
    var p1 = curve.point1;
    var p2 = curve.point2;
    var z = (p1.x * p2.y - p2.x * p1.y);
    c_x += (p1.x + p2.x) * z;
    c_y += (p1.y + p2.y) * z;
    area += z;
  });
  area /= 2;
  c_x /= (6 * area);
  c_y /= (6 * area);
  return new Point(c_x, c_y);
}

// This function takes a polygon, and return "center" Point. The
// "center" in this case means the center of the rectangular bounding
// box.
var find_center = function (polygon) {
  return centroid(polygon);
}

// This function finds the Point at which a ray (desribed by it's
// starting point and angle) intersects a polygon.
var find_intercept = function (polygon, starting_point, angle) {

  // create a path for the ray that we can use to compute the
  // intersection. No way the radius of the line needs to be longer
  // than the perimeter of the polygon. So, we'll do two times just in
  // case :)
  var hack_radius = 2 * polygon.length;
  var x = starting_point.x + hack_radius * Math.cos(angle);
  var y = starting_point.y + hack_radius * Math.sin(angle);
  var sweep_line = new Path.Line(starting_point, new Point(x, y));

  // getIntersections returns a list. TODO: There should always be
  // one, but there is not. Why does this happen? I think it's a bug
  // in paper.js! see
  // https://github.com/paperjs/paper.js/issues/477. I was able to
  // hack fix it by making the sweep line a closed polygon...
  sweep_line.closed = true;
  var intersections = polygon.getIntersections(sweep_line);
  var first_point = intersections[0].point;
  return first_point;
};

// return angle in radians between the "zero horizontal" and the ray
// defined by vertex and center. atan2 returns angle between -pi and
// pi, and we want the angle between 0 and 2*pi, so if it's
// negative, add two pi.
var angle_from_origin = function (vertex, center) {
  var result = Math.atan2(vertex.y - center.y, vertex.x - center.x);
  if (result < 0) {
    return 2 * Math.PI + result;
  }
  else {
    return result;
  }
}

var sub_polygons = function (polygon, n) {

  // find center of parent polygon
  var center = find_center(polygon);

  // get angles of subdividing lines
  var angles = _.map(_.range(n), function (i) {
    return 2 * Math.PI * i / n;
  });

  // find where "sweep lines" intersect the polygon
  var new_vertices = _.map(angles, function (angle) {
    return find_intercept(polygon, center, angle);
  });

  // every new vertex represents a new sub-polygon, we'll make them
  // here and return them.
  var result = _.map(new_vertices, function(vertex, index) {

    // get the lower and upper bound angles for this region that we
    // are sweeping. For the last one that wraps around, use 2pi as
    // the angle instead of zero, so that the comparison is easier
    // later.
    var angle_lo = angles[index];
    var angle_hi = angles[(index+1) % angles.length];
    if (angle_hi < angle_lo) {
      angle_hi += 2 * Math.PI;
    }

    // new polygon always starts with center, and goes to the first
    // new vertex.
    var polylist = [center, vertex];

    // now add all of the old parent vertices that are between the
    // sweep angles. need to make sure that they are sorted in order
    // of increasing angle!
    var parent_vertices = [];
    _.each(polygon.segments, function(segment, i) {
      var angle = angle_from_origin(segment.point, center);
      if (angle >= angle_lo && angle <= angle_hi) {
    parent_vertices.push([angle, segment.point]);
      }
    });

    // sort in order of increasing angle and append to polylist
    parent_vertices.sort();
    _.each(parent_vertices, function (decorated_vertex) {
      polylist.push(decorated_vertex[1]);
    });

    // new polygon always ends with next vertex
    var next_vertex = new_vertices[(index + 1) % new_vertices.length];
    polylist.push(next_vertex);

    // make the sub polygon, steez it up, and return it.
    // var sub_color = new Color(Math.random(), Math.random(), Math.random());
    var sub_polygon = new Path(polylist);
    sub_polygon.strokeColor = get_stroke_color();
    sub_polygon.strokeWidth = get_stroke_width();
    sub_polygon.fillColor = get_sub_color();
    sub_polygon.closed = true;
    return sub_polygon
  });

  // return the list of sub-polygons
  polygon.remove();
  return result;
}

// make rectangle
var border = new Rectangle(
  new Point(0, 0),
  new Point(1500, 1500)
);
  // new Point(1262, 685)
var box = new Path.Rectangle(border);
// box.fillColor = 'cornflowerblue';


// takes a list of polygons and a list of integers
// depth-first splits each polygon using the first number in the
// split list (and pops off that number before calling its children
function recursive_draw(polygons, split_list) {
    // make a copy of the passed list - js passes by reference by default
    var list_copy = split_list.slice();
    var split_num = list_copy.shift();
    _.each(polygons, function (poly) {
        if(split_num !== undefined) {
            recursive_draw(sub_polygons(poly, split_num),
                           list_copy);
        }
    });
}

// functions like recursive_draw, but instead of a list of integers it
// takes a list of ranges of integers and randomly samples from those
// ranges at each level
function recursive_random_draw(polygons, split_ranges){
    var ranges_copy = split_ranges.slice();
    var split_range = ranges_copy.shift();
    _.each(polygons, function(poly) {
        if(split_range !== undefined) {
            var sub = sub_polygons(poly, getRandomInt(split_range[0],
                                                      split_range[1]))
            recursive_random_draw(sub, ranges_copy);
        }
    });
}

// recursive_draw([box],[11,9,7])
recursive_random_draw([box],[[7,13],[5,11],[3,9],[3,7]])
// recursive_random_draw([box],[[7, 3], [7, 3], [7, 3]])
