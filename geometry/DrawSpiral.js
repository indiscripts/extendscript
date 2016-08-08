/***********************************************************************/
/*                                                                     */
/*      DrawSpiral ::  Draw an Archimedean spiral in InDesign          */
/*                     A dialog box allows to specify settings         */
/*                                                                     */
/*      [Ver: 1.001]  [Author: Marc Autret]         [Modif: 08/08/16]  */
/*      [Lang: EN]    [Req: InDesign CS4-CC]        [Creat: 08/06/16]  */
/*                                                                     */
/*      Installation:                                                  */
/*                                                                     */
/*      1) Place the current file into Scripts/Scripts Panel/          */
/*                                                                     */
/*      2) Run InDesign, open or create a document                     */
/*                                                                     */
/*      3) Create a circle (template area) and select it               */
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

#targetengine 'DrawSpiral'

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

var setPoint = function(/*[x,y]&*/p, /*[x,y]*/q)
// -------------------------------------
{
	p[0] = q[0];
	p[1] = q[1];
	return p;
};

var setBoxCoords = function(/*[x,y][3][]&*/a,/*uint*/NQ, i,theta,cosT,sinT,slopeT,radius,t,d,dx,dy,x,y)
// -------------------------------------
// a  :: destination path point array (should be empty.)
// NQ :: number of π/4 steps.
{
	// Avoid calling Math.cos and Math.sin.
	// ---
	const SQ2_2 = .5*Math.SQRT2;
	const COS_SIN = [[1,0],[+SQ2_2,+SQ2_2],[0,1],[-SQ2_2,+SQ2_2],[-1,0],[-SQ2_2,-SQ2_2],[0,-1],[+SQ2_2,-SQ2_2]];
	
	const K_TAN = (4*Math.tan(Math.PI/16))/3; // 4/3tan(π/16)

	// We need the factor K so that the radius at the maximal angle NQ*π/4
	// be exactly 1/2 (max radius in uv space). K = maxRadius / maxTheta.
	// ---
	const K = 2 / (NQ*Math.PI);
	
	// Set NQ points, incl. slope controls, in uv space.
	// ---
	for( i=1 ; i <= NQ ; ++i )
	{
		// Current angle (in radians) and slope at theta.
		// ---
		theta = (i/4)*Math.PI;
		cosT = COS_SIN[i%8][0];
		sinT = COS_SIN[i%8][1];
		// --- Derivative of the spiral at theta (in uv space.)
		slopeT = (sinT + theta*cosT) / (cosT - theta*sinT);

		// => radius and x,y in uv space.
		// ---
		radius = K*theta;
		x = 0.5 + radius*cosT;
		y = 0.5 + radius*sinT;
		
		// Determining the slope points. Using K_TAN to get the Bezier weight
		// is somehow empirical. K_TAN is based on the factor 4/3*tan(dTheta/4)*radius
		// used in arc approx--cf http://pomax.github.io/bezierinfo/#circles_cubic
		// So we regard the curve between two sample points as if it was almost an
		// arc, but each point is managed with respect to its associated radius.
		// And this seems to work :-)
		// ---
		d = radius*K_TAN;

		// In fact, d is just the module of the tangent vectors based on slope, so we
		// also need to find an algebric sign here. Although there is probably a more
		// elegant approach, I determine the sign of dx (and therefore of dy) based
		// on the solution that leads to the minimal distance with the previous point.
		// ---
		dx = d / Math.sqrt(1+slopeT*slopeT);
		if( 1 < i )
		{
			t = a[a.length-1][1][0];
			if( Math.abs(x+dx-t) < Math.abs(x-dx-t) ) dx*=-1;
		}
		// ---
		dy = dx*slopeT;
		
		a.push( [ i > 1 ? [x-dx,y-dy] : [x,y], [x,y],  i < NQ ? [x+dx,y+dy] : [x,y] ] );
	}

	return a;
};


var drawSpiralTarget = function(/*PageItem*/o,/*num>0*/turns,  a,mx,i,t,j)
// -------------------------------------
// turns :: number of turns, where 1 represents 2π (default is 2.)
//          e.g.  turns=2.5  makes the spiral ends at 5π
{
	// DOM attributes for the spline
	// ---
	const NONE_STYLE_NAME = app.objectStyles.itemByName("$ID/[None]").name,
		  CORNER_NONE = +CornerOptions.NONE,
		  ITEM_RESET = {
			appliedObjectStyle: 	NONE_STYLE_NAME,
			endCap:					+EndCap.ROUND_END_CAP,
			endJoin:				+EndJoin.MITER_END_JOIN,
			fillColor:				o.properties.fillColor || 'None',
			fillTint:				o.properties.fillTint || -1,
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

	// Normalize turns and set the uv coords.
	// [REM] Using Math.ceil(8*turns) regards `turns` as a multiple of 1/8,
	// which makes things really easier.
	// ---
	turns = Math.max(Math.abs(turns||2/*default*/),.5);
	
	setBoxCoords(a=[], Math.ceil(8*turns));

	// Converts box coords into ruler system.
	// ---
	mx = boxToRulerMatrix(o);
	for( i=a.length ; i-- ; )
	{
		t = a[i];
		for( j=t.length ; j-- ; setPoint(t[j],mx.changeCoordinates(t[j])) );
	}

	// Draw the sine wave
	// ---
	(t=parentSpread(o).rectangles.add(ITEM_RESET)).paths[0].properties = {
		entirePath: a,
		pathType:	+PathType.OPEN_PATH,
		};
	
	app.select([t.getElements()[0]]);
};

var uiDialog = function(/*obj&*/ss,/*bool*/prefs,  dlg,col,o,r)
// -------------------------------------
{
	dlg = app.dialogs.add({name:'DrawSpiral' + (prefs?' Preferences':'') + '  |  \xA9indiscripts.com', canCancel:true});

	col = dlg.dialogColumns.add().borderPanels.add().dialogColumns.add();
	
	o = {
		_0: prefs && col.dialogRows.add().dialogColumns.add().
			staticTexts.add({
			staticLabel: "This is the Preferences dialog.",
			}),
		_1: prefs && col.dialogRows.add().dialogColumns.add().
			staticTexts.add({
			staticLabel: "In order to generate a new spiral,",
			}),
		_2: prefs && col.dialogRows.add().dialogColumns.add().
			staticTexts.add({
			staticLabel: "select an oval first (or any page item.)",
			}),
		_3: prefs && col.dialogRows.add().dialogColumns.add().
			staticTexts.add({
			staticLabel: " ",
			}),
		turns: col.dialogRows.add().dialogColumns.add().
			staticTexts.add({
			staticLabel: "Number of cycles:",
			minWidth: 100,
			}).parent.parent.dialogColumns.add().
			realEditboxes.add({
			editValue: ss.turns,
			minimumValue: 0.5,
			maximumValue: 50,
			smallNudge: .125,
			largeNudge: 1,
			}),
		removeTpl: col.dialogRows.add().dialogColumns.add().
			checkboxControls.add({
			staticLabel: "Remove the template object",
			checkedState: 1==ss.removeTpl,
			}),
		hidePrefs: col.dialogRows.add().dialogColumns.add().
			checkboxControls.add({
			staticLabel: "Do not show this dialog when a selection is active",
			checkedState: 1==ss.hidePrefs,
			}),
	};

	if( r=dlg.show() )
	{
		ss.turns = +o.turns.editValue;
		ss.removeTpl = +o.removeTpl.checkedState;
		ss.hidePrefs = +o.hidePrefs.checkedState;
	}

	return r;
};

$.global.hasOwnProperty('DrawSpiral')||($.global.DrawSpiral = function F(  o)
// -------------------------------------
{
	F.settings || (F.settings={turns:2,hidePrefs:0,removeTpl:1});

	o = app.properties.selection && app.selection[0];
	if( o && !('paths' in o) ){ o=false; }
	
	if( (!o) || !F.settings.hidePrefs )
	{
		if( !uiDialog(F.settings, !o) ) return;
	}

	if( o )
	{
		drawSpiralTarget(o, F.settings.turns);
		if( F.settings.removeTpl ) o.remove();
	}
});

app.doScript('DrawSpiral()', ScriptLanguage.JAVASCRIPT, undefined, UndoModes.ENTIRE_SCRIPT, 'DrawSpiral');
