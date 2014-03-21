function segDist2(/*seg1*/x1,y1,x2,y2, /*seg2*/x3,y3,x4,y4)
//----------------------------------
// Return the squared distance between segments seg1 and seg2
// Based on http://geomalgorithms.com/a07-_distance.html
{
    const EPSILON = 1e-8;

    var a = (x2-=x1)*x2 + (y2-=y1)*y2,
        b = (x4-=x3)*x4 + (y4-=y3)*y4,
        c = (x1-=x3)*x2 + (y1-=y3)*y2,
        d = x1*x4 + y1*y4,
        e = x2*x4 + y2*y4;

    null===(y3=EPSILON>(x3=a*b-e*e)?(x3=1,null):(e*d-b*c)) ||
        (0>y3 && (y3=0,1)) ||
        (y3>x3 && (y3=x3,d+=e,1)) ||
        (d=a*d-e*c,b=x3);
    
    ((0>d && (d=0,e=-c,1))||(d>b && (d=b,e-=c,1))) &&
        y3 = +(0<=e)&&(e>a?x3:((x3=a),e));

    x3 = +(EPSILON<=(0>y3?-y3:+y3)) && y3/x3;
    y3 = +(EPSILON<=(0>d?-d:+d)) && d/b;

    x1 += (x3*x2 - y3*x4);
    y1 += (x3*y2 - y3*y4);

    return +(EPSILON<a=x1*x1+y1*y1) && a;
}

// ---
// Sample code -- select two lines first
// ---
var sel = app.selection,
    s1 = sel[0].paths[0].pathPoints.everyItem().anchor,
    s2 = sel[1].paths[0].pathPoints.everyItem().anchor,
    dd = segDist2(
        s1[0][0], s1[0][1],
        s1[1][0], s1[1][1],
        s2[0][0], s2[0][1],
        s2[1][0], s2[1][1]
        );

alert( "Distance: " + Math.sqrt(dd) );
