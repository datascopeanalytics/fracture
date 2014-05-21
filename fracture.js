var find_center = function (polygon) {
  var bounding_rect = polygon.getBoundingClientRect(true);
  return new Two.Anchor(
    bounding_rect.left + bounding_rect.width / 2,
    bounding_rect.top + bounding_rect.height / 2
  );
}


var elem = document.getElementById('one');

var width = 300;
var height = 300;
var two = new Two({
  width: width,
  height: height,
  // type: Two.Types.canvas,
}).appendTo(elem);

console.log(two.width);
var upper_left = new Two.Anchor(0, 0);
var upper_right = new Two.Anchor(two.width, 0);
var lower_left = new Two.Anchor(0, two.height);
var lower_right = new Two.Anchor(two.width, two.height);
console.log('LR', lower_right);

// var box = new Two.Polygon([upper_left, upper_right, lower_right, lower_left], true, false, false);
var box = two.makePolygon([upper_left, upper_right, lower_right, lower_left], true, true);
// two.add(box);
box.fill = 'rgba(255, 0, 0, 0.5)';
box.stroke = 'rgba(255, 0, 0, 1.0)';
box.linewidth = 0;
console.log('bounding rect:', box.getBoundingClientRect(true));
console.log('bounding rect:', box.getBoundingClientRect(false));
console.log('vertices:', box.vertices);
console.log('WTF. Why do Anchors change?')

// _.each(_.range(10), function (i) {
//   var q = i / 10;
//   console.log(q, box.getPointAt(q));
// });

var a = box.getPointAt(0.0);
console.log(a);
var a1 = new Two.Anchor(a.x, a.y);
console.log(a1);
var b = box.getPointAt(0.4);
console.log(b);
var b1 = new Two.Anchor(b.x, b.y);
console.log(b1);
var c1 = new Two.Anchor(0, 0);
// var c1 = find_center(box);
console.log(c1);


var box2 = two.makePolygon([a1, b1, c1]);
console.log(box2);
box2.fill = 'rgba(255, 0, 0, 0.5)';
box2.stroke = 'rgba(0, 0, 0, 1.0)';
box2.linewidth = 1;

two.update();

// var iter_pairs = function (array) {
//   var result = [];
//   for (var i=0; i < array.length; i++) {
//     result.push([array[i], array[(i + 1) % array.length]]);
//   }
//   return result;
// };

// var find_intercept = function (vertex_a, vertex_b, center, angle) {
//   // vertexes and center are anchors. angle is the angle of the
//   // subdividing line in radians. returns null if lines are parallel,
//   // and returns an anchor with intercept otherwise.

//   // huzzah for wikipedia!
//   // http://en.wikipedia.org/wiki/Line%E2%80%93line_intersection
//   var x1 = vertex_a.x;
//   var y1 = vertex_a.y;
//   var x2 = vertex_b.x;
//   var y2 = vertex_b.y;
//   var x3 = center.x;
//   var y3 = center.y;
//   var hack_radius = 99999999999; // .99.99999.99999.999.999
//   var x4 = center.x + hack_radius * Math.cos(angle);
//   var y4 = center.y + hack_radius * Math.sin(angle);
//   var denominator = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
//   if (denominator !== undefined) {
//     var a = (x1 * y2 - y1 * x2);
//     var b = (x3 * y4 - y3 * x4);
//     var n_x = a * (x3 - x4) - (x1 - x2) * b;
//     var n_y = a * (y3 - y4) - (y1 - y2) * b;
//     return new Two.Anchor(n_x / denominator, n_y / denominator);
//   }
//   else {
//     return null;
//   }
// };

// var angle_from_origin = function (vertex, center) {
//   // return angle in radians between the "zero horizontal" and the ray
//   // defined by vertex and center. atan2 returns angle between -pi and
//   // pi, and we want the angle between 0 and 2*pi, so if it's
//   // negative, add two pi.
//   var result = Math.atan2(vertex.y, vertex.x);
//   if (result < 0) {
//     return 2 * Math.PI + result;
//   }
//   else {
//     return result;
//   }
// }

// var close_enough = function (angle, lower_bound, upper_bound) {
//   // the following:
//   // intercept_angle >= angle && intercept_angle < next_angle;
//   // is running into floating point errors.
//   // This does the same thing, but to lower precision on the lower
//   // bound side.
//   if (Math.abs(angle - lower_bound) < 0.000001) {
//     return true;
//   }
//   else {
//     return (angle >= lower_bound && angle < upper_bound);
//   }

// }

// var sub_polygons = function (polygon, n) {
//   var result = [];

//   // find center of parent polygon
//   var center = find_center(polygon);
//   console.log('center', center.x, center.y);

//   // get angles of subdividing lines
//   var angles = _.map(_.range(n), function (i) {
//     return 2 * Math.PI * i / n;
//   });

//   // find all new vertices
//   var sides = iter_pairs(polygon.vertices);
//   var new_vertices = [];

//   _.each(angles, function (angle, angle_index) {
//     var next_angle = angles[(angle_index + 1) % angles.length];

//     // find where the line created by angle+center intercepts each side
//     var side_intercepts = _.map(sides,function(side){
//       return find_intercept(side[0], side[1], center, angle);
//     });

//     // find the intercept inside the pie slice we're looking at (the
//     // sweep from this angle to next angle)
//     var good_intercept = _.find(side_intercepts, function (intercept) {      
//       if (intercept !== null) {
// 	var intercept_angle = angle_from_origin(intercept, center);
// 	return close_enough(intercept_angle, angle, next_angle);
//       } 
//       else {
// 	return false;
//       }
//     });     

//     new_vertices.push(good_intercept);
//   });
  
//   // every new vertex represents a shape
//   _.each(new_vertices, function(vertex,index){
//     var angle_a = angles[index];
//     var angle_b = angles[(index+1) % angles.length];
//     var polylist = [center,vertex];
//     _.each(polygon.vertices, function(anchor) {
//       var angle = angle_from_origin(anchor, center);
//       if (angle >= angle_a && angle <= angle_b) {
// 	polylist.push(anchor);
//       }
//     });
//     polylist.push(new_vertices[(index+1) % new_vertices.length]);
//     console.log('polylist', polylist);
//     var yeah = new Two.Polygon(polylist, true, false, true);
//     yeah.stroke = 'black';
//     yeah.linewidth = 2;
//     yeah.fill = 'white';
//     result.push(yeah);
//   });

//   return result;
// }

// // sub_polygons(box, 7);
// two.update();

// // two.bind('update', function(frameCount) {
// //   box.rotation += 0.005;
// // }).play();

