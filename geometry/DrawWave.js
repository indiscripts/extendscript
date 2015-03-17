/***********************************************************************/
/*                                                                     */
/*      DrawWave ::  Draw a sine wave in InDesign                      */
/*                   See params in the drawWave() function below       */
/*                                                                     */
/*      [Ver: 1.001]  [Author: Marc Autret]         [Modif: 03/17/15]  */
/*      [Lang: EN]    [Req: InDesign CS4-CC]        [Creat: 03/17/15]  */
/*                                                                     */
/*      Installation:                                                  */
/*                                                                     */
/*      1) Place the current file into Scripts/Scripts Panel/          */
/*                                                                     */
/*      2) Run InDesign, open or create a document                     */
/*                                                                     */
/*      3) Create a rectangle (canvas area) and select it              */
/*                                                                     */
/*      4) Exec the script from your scripts panel:                    */
/*           Window > Automation > Scripts   [CS4]                     */
/*           Window > Utilities > Scripts    [CS5/CS6/CC]              */
/*         + double-click on the script file name                      */
/*                                                                     */
/*      Bugs & Feedback : marc{at}indiscripts{dot}com                  */
/*                        www.indiscripts.com                          */
/*                                                                     */
/***********************************************************************/

var parentSpread = function F(/*DOM*/o)
//----------------------------------
// Return the parent spread of an object, if any
{
	var p = o && o.parent; // NB: don't use o.properties.parent [CS6 bug]
	if( (!p) || (p instanceof Document) ) return null;
	return ( (p instanceof Spread) || (p instanceof MasterSpread) ) ? p : F(p);
};

var boxToRulerMatrix = function(/*PageItem*/o)
// -------------------------------------
// Given a page item, return a matrix that maps its box space (0..1, 0..1)
// into the current ruler system (considering custom units etc)
{
	const CS_BOARD = +CoordinateSpaces.PASTEBOARD_COORDINATES,
		  CS_INNER = +CoordinateSpaces.INNER_COORDINATES,
		  BB_GEO = +BoundingBoxLimits.GEOMETRIC_PATH_BOUNDS,
		  AP_TOP_LEFT = +AnchorPoint.TOP_LEFT_ANCHOR;

	var spd = parentSpread(o),
		ref = spd && spd.pages[0],
		bo, bs, ro, rs, mx;

	if( !ref ) return 0;

	// Box origin --> CS_INNER (trans)
	// ---
	bo = o.resolve([[0,0],BB_GEO,CS_INNER], CS_INNER)[0];

	// Box (u,v) --> CS_INNER (scaling)
	// ---
	bs = o.resolve([[1,1],BB_GEO,CS_INNER], CS_INNER)[0];
	bs[0] -= bo[0];
	bs[1] -= bo[1];

	// Ruler origin --> CS_BOARD (trans)
	// ---
	ro = ref.resolve([[0,0],AP_TOP_LEFT], CS_BOARD, true)[0];
	
	// Ruler (u,v) --> CS_BOARD (scaling)
	// ---
	rs = ref.resolve([[1,1],AP_TOP_LEFT], CS_BOARD, true)[0];
	rs[0] -= ro[0];
	rs[1] -= ro[1];

	return app.transformationMatrices.add()	// Identity
		.scaleMatrix(bs[0],bs[1])			// Box => Inner (unit scaling)
		.translateMatrix(bo[0],bo[1])		// Box => Inner (trans)
		.catenateMatrix(o.transformValuesOf(CS_BOARD)[0]) // Inner => Board
		.translateMatrix(-ro[0],-ro[1])		// Board => Ruler (trans)
		.scaleMatrix(1/rs[0], 1/rs[1]);		// Board => Ruler (unit scaling)
};

var findRoot = function(/*fct*/f, /*target=0*/r)
// -------------------------------------
// f must be monotone in [0,1]
{
	const mABS = Math.abs;

	r||(r=0);

	var e = .00001,
		tt = [0,1],
		vv = [f(0)-r,f(1)-r],
		t, v, i;

	if( e > mABS(vv[0]) ) return 0;
	if( e > mABS(vv[1]) ) return 1;

	while( e <= mABS(v=f(t=(tt[0]+tt[1])/2)-r) )
		{
		i = +(0 < vv[1]*v);
		vv[i] = v;
		tt[i] = t;
		}

	return t;
};

var setPoint = function(/*[x,y]&*/p, /*[x,y]*/q)
// -------------------------------------
{
	p[0] = q[0];
	p[1] = q[1];
	return p;
};


var drawWave = function(/*PageItem*/o, /*0..1*/x, /*1..*/w)
// -------------------------------------
// o :: the rectangle (or spline item) used as a 'canvas' for drawing
// x :: left side location in [0..1[, where 1 represents 2π
//      e.g.  x=0.25  makes the sine wave start at π/2
// w :: right side location (>1), where 1 represents 2π
//      e.g.  w=2.5  makes the sine wave ends at 5π
{
	// Optimal control points based on this discussion:
	// http://stackoverflow.com/questions/13932704/how-to-draw-sine-waves-with-svg-js
	// ---
	const X0 = 815329483711422,		// (z0/2pi)e+16
		  X1 = 904768223813822,		// (z1/2pi)e+16
		  Y0 = .2438566883717,		// .5-(z0/2)
		  Y1 = .7561433116283,		// .5+(z0/2)
		  Y = [0,Y0,.5,Y1,1],
		  K = 1e16/4;
	
	// Bezier stuff
	// ---
	const F1 = "return (u=t-1),(t*t*t*%4 - 3*t*t*u*%3 + 3*t*u*u*%2 - u*u*u*%1)",
		  F2 = "return (u=t-1),(t*t*%4 - 2*t*u*%3 + u*u*%2)";

	// DOM attributes for the spline
	// ---
	const NONE_STYLE_NAME = app.objectStyles.itemByName("$ID/[None]").name,
		  CORNER_NONE = +CornerOptions.NONE,
		  ITEM_RESET = {
			appliedObjectStyle: 	NONE_STYLE_NAME,
			endCap:					+EndCap.BUTT_END_CAP,
			endJoin:				+EndJoin.MITER_END_JOIN,
			fillColor:				'None',
			fillTint:				-1,
			leftLineEnd: 			+ArrowHead.NONE,
			localDisplaySetting: 	+DisplaySettingOptions.DEFAULT_VALUE,
			locked:					false,
			miterLimit:				4,
			rightLineEnd:			+ArrowHead.NONE,
			strokeColor:			'Black',
			strokeTint:				-1,
			visible:				true,
			cornerOption: 			CORNER_NONE,
			bottomRightCornerOption:CORNER_NONE,
			bottomLeftCornerOption:	CORNER_NONE,
			topRightCornerOption:	CORNER_NONE,
			topLeftCornerOption:	CORNER_NONE,
			};

	// Normalizing inputs
	// ---
	x = Math.abs(x||0)%1;
	w = Math.max(Math.abs(w||1),1);

	// Variables
	// ---
	var d = (w-x)*1e16,
		xMax = d+K,
		a = [],
		z = 0,
		i = (.25<=x)+(.5<=x)+(.75<=x), // 0..3
		x, dj, dx, j, t, xy,
		mx = boxToRulerMatrix(o),
		fx,fy,P1,P2,P3,P4;

	if( !mx ){ alert("Please, provide a page item."); return 0; }

	// Set the wave points in box coordinates
	// ---
	for( x=K*(i-4*x) ; xMax > x ; x+=K, i=(1+i)%4 )
		{
		dj = (i%2) ? 0 : (i-1);
		dx = dj ? X0 : X1;
		j = 2*(dj?1:(i-1));
		a[z++] = [ [(x-dx)/d, Y[j-dj]], [x/d,Y[j]], [(x+dx)/d,Y[j+dj]] ];
		}
	
	// ---
	// Refine extrema in case they don't match k(pi/2)
	// Cf http://pomax.github.io/bezierinfo/#matrixsplit
	// ---
	
	// Init point
	// ---
	P1 = a[0][1]; P2 = a[0][2]; P3 = a[1][0]; P4 = a[1][1];
	fx = Function('t','u', localize(F1, P1[0], P2[0], P3[0], P4[0]));
	t = findRoot(fx,0);
	if( t > 0 )
		{
		fy = Function('t','u', localize(F1, P1[1], P2[1], P3[1], P4[1]));
		setPoint(P1, [fx(t),fy(t)]);

		fx = Function('t','u', localize(F2, '', P2[0], P3[0], P4[0]));
		fy = Function('t','u', localize(F2, '', P2[1], P3[1], P4[1]));
		setPoint(P2, [fx(t),fy(t)]);

		setPoint(P3, [t*P4[0]-(t-1)*P3[0], t*P4[1]-(t-1)*P3[1]]);
		}
	setPoint(a[0][0], P1);
	
	// End point
	// ---
	if( z > 2 && a[z-1][1][0] >= 1 )
		{
		P1 = a[z-2][1]; P2 = a[z-2][2]; P3 = a[z-1][0]; P4 = a[z-1][1];
		fx = Function('t','u', localize(F1, P1[0], P2[0], P3[0], P4[0]));
		t = findRoot(fx,1);
		if( t < 1 )
			{
			fy = Function('t','u', localize(F1, P1[1], P2[1], P3[1], P4[1]));
			setPoint(P4, [fx(t),fy(t)]);

			fx = Function('t','u', localize(F2, '', P1[0], P2[0], P3[0]));
			fy = Function('t','u', localize(F2, '', P1[1], P2[1], P3[1]));
			setPoint(P3, [fx(t),fy(t)]);

			setPoint(P2, [t*P2[0]-(t-1)*P1[0], t*P2[1]-(t-1)*P1[1]]);
			}
		setPoint(a[z-1][2], P4);
		}

	// Converts box coords into ruler system
	// ---
	while( z-- )
		{
		for( i=(t=a[z]).length ; i-- ; )
			{
			xy = mx.changeCoordinates(t[i]);
			t[i][0] = xy[0];
			t[i][1] = xy[1];
			}
		}
	
	// Draw the sine wave
	// ---
	parentSpread(o).rectangles.add(ITEM_RESET).paths[0].properties = {
		entirePath: a,
		pathType:	+PathType.OPEN_PATH,
		};

};


// =====================================
// THIS IS A SAMPLE CODE
// =====================================
var o = app.selection && app.selection[0],
	i;
for( i=1 ; i <= 2 ; i+=.25 ) drawWave(o, 0, i);
