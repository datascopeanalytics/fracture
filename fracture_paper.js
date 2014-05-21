var find_center = function (polygon) {
  return polygon.position;
}

var iter_pairs = function (array) {
  var result = [];
  for (var i=0; i < array.length; i++) {
    result.push([array[i], array[(i + 1) % array.length]]);
  }
  return result;
};

var find_intercept = function (side, center, angle) {
  var hack_radius = 99999999999; // .99.99999.99999.999.999
  var x4 = center.x + hack_radius * Math.cos(angle);
  var y4 = center.y + hack_radius * Math.sin(angle);
  var sweep = new Path.Line(
    center,
    new Point(x4, y4)
  );
  var sidetest = new Path.Line(
    side.point1,
    side.point2
  );
  var b = sweep.getIntersections(sidetest);
  if (b[0]) {
    return b[0].point;
  }
  else {
    return null;
  }
};

var angle_from_origin = function (vertex, center) {
  // return angle in radians between the "zero horizontal" and the ray
  // defined by vertex and center. atan2 returns angle between -pi and
  // pi, and we want the angle between 0 and 2*pi, so if it's
  // negative, add two pi.
  var result = Math.atan2(vertex.y - center.y, vertex.x - center.x);
  if (result < 0) {
    return 2 * Math.PI + result;
  }
  else {
    return result;
  }
}

var close_enough = function (angle, lower_bound, upper_bound) {
  // the following:
  // intercept_angle >= angle && intercept_angle < next_angle;
  // is running into floating point errors.
  // This does the same thing, but to lower precision on the lower
  // bound side.
  if (Math.abs(angle - lower_bound) < 0.000001) {
    return true;
  }
  else {
    return (angle >= lower_bound && angle < upper_bound);
  };
}

var colors = ['black', 'red', 'blue'];

var sub_polygons = function (polygon, n) {
  var result = [];

  // find center of parent polygon
  var center = find_center(polygon);

  // get angles of subdividing lines
  var angles = _.map(_.range(n), function (i) {
    return 2 * Math.PI * i / n;
  });

  // find all new vertices
  var new_vertices = [];

  _.each(angles, function (angle, angle_index) {

    // find where the line created by angle+center intercepts each side
    var side_intercepts = _.map(polygon.curves, function(side){
      return find_intercept(side, center, angle);
    });
    var good_intercept = _.find(side_intercepts, function(i) {return i});

    new_vertices.push(good_intercept);
  });

  // every new vertex represents a shape
  _.each(new_vertices, function(vertex,index){
    var angle_a = angles[index];
    var angle_b = angles[(index+1) % angles.length];
    if (angle_b === 0) {
      angle_b = 2 * Math.PI;
    }
    var polylist = [center, vertex];
    _.each(polygon.segments, function(anchor) {
      var angle = angle_from_origin(anchor.point, center);
      if (angle >= angle_a && angle <= angle_b) {
	polylist.push(anchor.point);
      }
    });
    polylist.push(new_vertices[(index+1) % new_vertices.length]);
    var yeah = new Path(polylist);
    yeah.strokeColor = 'black';
    yeah.fillColor = new Color(Math.random(), Math.random(), Math.random());
    // yeah.strokeColor = colors[index]
    // yeah.strokeWidth = index + 1;
    yeah.closed = true;
    // yeah.selected = true;
    result.push(yeah);
  });

  return result;
}



// make rectangle
var border = new Rectangle(
  new Point(0, 0),
  new Point(800, 600)
);
var box = new Path.Rectangle(border);
// box.fillColor = 'cornflowerblue';

var a = sub_polygons(box, 7);

// sub_polygons(a[0], 3);
// sub_polygons(a[1], 5);
// sub_polygons(a[2], 7);
// sub_polygons(a[3], 5);
// sub_polygons(a[4], 9);
// sub_polygons(a[5], 5);
// sub_polygons(a[6], 5);
// sub_polygons(a[2], 3);


_.each(a, function(i) {
  _.each(sub_polygons(i, 7), function (j) {
    _.each(sub_polygons(j, 7), function (k) {
      // sub_polygons(k, 7);
    });
  });
});
