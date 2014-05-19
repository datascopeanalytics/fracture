var elem = document.getElementById('one');

var width = 600;
var height = 400;
var two = new Two({
  width: width,
  height: height,
  // type: Two.Types.canvas,
}).appendTo(elem);

var upper_left = new Two.Anchor(0, 0);
var upper_right = new Two.Anchor(two.width, 0);
var lower_left = new Two.Anchor(0, two.height);
var lower_right = new Two.Anchor(two.width, two.height);

var box = two.makePolygon([upper_left, upper_right, lower_right, lower_left]);
box.fill = 'rgba(255, 0, 0, 0.5)';
box.stroke = 'rgba(255, 0, 0, 1.0)';
box.linewidth = 0;

var find_center = function (polygon) {
  var bounding_rect = polygon.getBoundingClientRect(true);
  return new Two.Anchor(
    bounding_rect.left + bounding_rect.width / 2,
    bounding_rect.top + bounding_rect.height / 2
  );
}

var iter_pairs = function (array) {
  var result = [];
  for (var i=0; i <= array.length; i++) {
    result.push([array[i], array[(i + 1) % array.length]]);
  }
  return result;
};

var find_intercept(vertex_a, vertex_b, center, angle) {
  // vertexes and center are anchors. angle is the angle of the
  // subdividing line in radians. returns null if lines are parallel,
  // and returns an anchor with intercept otherwise.
  return null;
};

var angle_from_origin(vertex, center) {
  // return angle in radians between the "zero horizontal" and the ray
  // defined by vertex and center.
  return null;
}

var sub_polygons = function (polygon, n) {
  var result = [];

  // find center of parent polygon
  var center = find_center(polygon);

  // get angles of subdividing lines
  var angles = _.map(_.range(n), function (i) {
    return 2 * Math.PI * i / n;
  });

  // find all new vertices
  var sides = iter_pairs(polygon.vertices);
  var new_vertices = [];

  _.each(angles, function (angle, angle_index) {
    var next_angle = angles[(angle_index + 1) % angles.length];

    // find where the line created by angle+center intercepts each side
    var side_intercepts = _.map(sides,function(side){
      return find_intercept(side[0], side[1], center, angle);
    });

    // find the intercept inside the pie slice we're looking at (the
    // sweep from this angle to next angle)
    var good_intercept = _.find(side_intercepts, function (intercept) {      
      if (intercept !== null) {
	var intercept_angle = angle_from_origin(intercept, center);
	return (intercept_angle >= angle && intercept_angle < next_angle);
      } 
      else {
	return false;
      }
    });     

    new_vertices.push(good_intercept);
  });
  
  // every new vertex represents a shape
  _.each(new_vertices, function(vertex,index){
    var angle_a = angles[index];
    var angle_b = angles[(index+1) % angles.length];
    var polylist = [center,vertex];
    _.each(polygon.vertices, function(anchor) {
      var angle = angle_from_origin(anchor, center);
      if (angle >= angle_a && angle <= angle_b) {
	polylist.push(anchor);
      }
    });
    polylist.push(new_vertices[(index+1) % new_vertices.length]);
    result.push(two.makePolygon(polylist));
  });

  return result;
}

sub_polygons(box, 3);
two.update();

// two.bind('update', function(frameCount) {
//   box.rotation += 0.005;
// }).play();

