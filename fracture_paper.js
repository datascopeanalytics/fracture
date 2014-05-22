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
  // one, but there is not. Why does this happen?
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
    if (angle_hi === 0) {
      angle_hi = 2 * Math.PI;
    }

    // new polygon always starts with center, and goes to the first
    // new vertex.
    var polylist = [center, vertex];

    // now add all of the old partent vertices that are between the
    // sweep angles
    _.each(polygon.segments, function(segment) {
      var angle = angle_from_origin(segment.point, center);
      if (angle >= angle_lo && angle <= angle_hi) {
	polylist.push(segment.point);
      }
    });
    
    // new polygon always ends with next vertex
    var next_vertex = new_vertices[(index + 1) % new_vertices.length];
    polylist.push(next_vertex);

    // make the sub polygon, steez it up, and return it.
    var sub_color = new Color(Math.random(), Math.random(), Math.random());
    var sub_polygon = new Path(polylist);
    sub_polygon.strokeColor = 'black';
    sub_polygon.fillColor = sub_color;
    sub_polygon.closed = true;
    return sub_polygon
  });

  // return the list of sub-polygons
  return result
}

// make rectangle
var border = new Rectangle(
  new Point(0, 0),
  new Point(400, 300)
);
var box = new Path.Rectangle(border);
// box.fillColor = 'cornflowerblue';

var a = sub_polygons(box, 7);

_.each(a, function(i) {
  _.each(sub_polygons(i, 5), function (j) {
    _.each(sub_polygons(j, 3), function (k) {
      // sub_polygons(k, 3);
    });
  });
});

