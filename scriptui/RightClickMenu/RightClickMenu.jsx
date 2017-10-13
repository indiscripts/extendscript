/*******************************************************************************

		Name:           Right Click Menu
		Desc:           Right-click menu loader for ScriptUI container.
		Path:           RightClickMenu.jsx
		Require:        Nothing (IdExtenso is not needed here.)
		Encoding:       ÛȚF8
		Kind:           Standalone Version.
		API:            {Window|Group|Panel}.addRightClickMenu(...)
		DOM-access:     app.version
		Todo:           Testing on various platforms!
		Created:        171012 (YYMMDD)
		Modified:       171013 (YYMMDD)

*******************************************************************************/

	//==========================================================================
	// IMPLEMENTATION NOTES
	//==========================================================================

	/*

	This implementation is inspired from Loïc Aigon's snippet at
	<http://bit.ly/2yIVKyF>
	
	Some changes and enhancements have been made to allow a more
	generic use of the original idea.
	
	Given a ScriptUI container `myContainer` (typically a newly
	created Window instance), use the scheme

	      var ui = myContainer.addRightClickMenu({
	                  "key1": "Label1",
	                  "key2": "Label2",
	                  // etc
	                  });
	
	to attach the menu to `myContainer` area. The returned `ui` is
	a canvas (Group) where you can load your UI stuff as you would
	have done with the original container.
	
	Then, the selection of an item in the right-click menu will
	dispatch a custom 'menu' event that you can listen to from the
	window (or container):
	
	      myContainer.addEventListener('menu', myEventHandler);
	
	The 'menu' event bubbles and exposes two additional properties:
	
	      event.menuLabel  // The label of the selected menu item
	      event.menuKey    // The key of the selected menu item

	Note. - In case the menu component cannot fully display at the
	mouse location due to the bounds of the container, we try to
	reposition it accordingly.
	
	Known issues. - As the 'mouseout' event is not always clearly
	detected in some environments (in particular, CS4/CS5) the menu
	may remain while the mouse leaves the area. Anyway the user
	just has to click anywhere to discard the menu.
	
	Editable controls (`EditText`) are not masked by the menu. This
	is a ScriptUI bug.

	*/


// ScriptUI `stack` orientation flag.
// ---
;ScriptUI.MAC_STACK = +('W' != $.os[0] || 9 <= parseFloat(app.version) );

ScriptUI.setColor = function setColor(/*Widget*/x,/*uint24*/rgb,/*str*/k)
//--------------------------------------
// Brush/pen helper.
{
    if( !(x=x.graphics) ) return;

    rgb = [
        (0xFF&(rgb>>>16))/0xFF,
        (0xFF&(rgb>>> 8))/0xFF,
        (0xFF&(rgb>>> 0))/0xFF
        ];

    switch( k )
    {
        case 'foregroundColor':
        case 'disabledForegroundColor':
            x[k] = x.newPen(x.PenType.SOLID_COLOR,rgb,1);
            break;

        default:
            'disabledBackgroundColor'==k || (k='backgroundColor');
            x[k] = x.newBrush(x.BrushType.SOLID_COLOR,rgb.concat(1));
    }
};

ScriptUI.addRightClickMenu = function addRightClickMenu(/*{name=>label}*/o,  m,k,t,u)
// -------------------------------------
// Provide a right-click menu to `this` (Window object or container.)
// Return a new canvas (Group) where the actual UI should be loaded.
// [REM] The context MUST be either a Window, a Group, or a Panel.
{
    const DP = ScriptUI.MAC_STACK;

    // Prepare the container to receive a stacked menu.
    // ---
    const DEF = {
        orientation: this.orientation,
        alignChildren: this.alignChildren||['left','top'],
        margins: this.margins||0,
        spacing: this.spacing||0,
    };

    this.orientation = 'stack';
    this.margins = this.spacing = 0;
    this.rightClickMenuIndex = DP + this.children.length;

    m = [this.add('group'),this.add('group')][DP?'pop':'shift']();

    // Menu layout.
    // ---
    m.spacing = m.margins = 0;
    m.alignment = ['left','top'] ;
    m.alignChildren = ['fill','top'];
    m.orientation = 'column';
    m.visible = false;
    m.maximumSize = [200,1000];
    m.selected = false;
    m.itemSelector = ScriptUI.addRightClickMenu.itemSelector;

    // Create the menu items.
    // ---
    for( k in o )
    {
        if( !o.hasOwnProperty(k) ) continue;

        t = m.add('group',u,{ name:k, key:k, label:o[k], isMenuItem:1 });
        t.add('statictext',u,o[k]);
        t.margins = [6,4,6,4];
        m.itemSelector(t,0);
    }

    // Manage inner mouse events.
    // ---
    t = callee.onInnerMouse;
    m.addEventListener('mousedown', t, true);
    m.addEventListener('mouseover', t, true);
    m.addEventListener('mouseout', t, true);

    // Manage outer mouse events.
    // ---
    t = callee.onOuterMouse;
    this.addEventListener('click', t);
    this.addEventListener('mouseout', t);

    // Return the canvas with default settings.
    // ---
    t = this.children[this.children.length-1-DP];
    for( k in DEF ) DEF.hasOwnProperty(k) && (t[k]=DEF[k]);
    return t;
};

ScriptUI.addRightClickMenu.itemSelector = function itemSelector(/*Widget*/menuItem,/*bool=0*/SELECT,  b,p,k,s,t)
//--------------------------------------
// Item selector (from the menu widget.)
{
    b = 0xE0E0E0; // gray brush
    p = 0x0;      // dark pen

    k = menuItem.properties.key;

    // Some cleanup might help.
    // ---
    if( false !== (s=this.selected) && s != k )
    {
        t = this[s];
        ScriptUI.setColor(t,b,'backgroundColor');
        ScriptUI.setColor(t.children[0],p,'foregroundColor');
        this.selected = false;
    }

    if( SELECT )
    {
        b = 0x4F9DFB; // blue brush
        p = 0xFFFFFF; // white pen
    }

    ScriptUI.setColor(menuItem,b,'backgroundColor');
    ScriptUI.setColor(menuItem.children[0],p,'foregroundColor');
    this.selected = SELECT ? k : false;
};

ScriptUI.addRightClickMenu.onInnerMouse = function onInnerMouse(/*{target,type}*/ev,  t)
//--------------------------------------
// Handle mouse events listened from the menu widget.
{
    // Make sure we can handle a menu item.
    // ---
    t = ev.target;
    while( !(t.properties||0).isMenuItem )
    {
        t = t.parent;
        if( t===this || (!t) ) return;
    }

    switch( ev.type )
    {
        case 'mousedown':
            if( !this.visible ) return;
            this.visible = false;
            ev = new UIEvent('menu',true,true,t);
            ev.menuKey = t.properties.key;
            ev.menuLabel = t.properties.label;
            this.dispatchEvent(ev);
            return;

        case 'mouseover':
            this.itemSelector(t,1);
            break;

        case 'mouseout':
            this.itemSelector(t,0);
            break;

        default: return;
    }
};

ScriptUI.addRightClickMenu.onOuterMouse = function onOuterMouse(/*Event*/ev,  m,x,y,t)
//--------------------------------------
// Handle mouse events listened from the menu container (usually, a Window obj.)
{
    // Make sure a menu widget is attached to the listener.
    // ---
    m = this.rightClickMenuIndex;
    if( 'undefined'==typeof m || !(m=this.children[m]) ) return;

    switch( ev.type )
    {
        case 'click':
            // Right-click only.
            // ---
            if( m.visible ){ m.visible=false; break; }
            if( 2 != ev.button ) break;
            t = this.window.bounds;
            x = ev.screenX - t.x;
            y = ev.screenY - t.y;
            if( 'window' != this.type )
            {
                t = this.windowBounds;
                x -= t.x;
                y -= t.y;
            }
            m.location = [
                Math.min(x, t.width-m.size[0]),
                Math.min(y, t.height-m.size[1])
                ];
            m.visible = true;
            break;

        case 'mouseout':
            if( ev.target!==m || !m.visible ) break;
            m.visible = false;
            break;
        
        default:;
    }
};


// Attach the menu builder to any ScriptUI container.
// ---
Window.prototype.addRightClickMenu =
Group.prototype.addRightClickMenu  =
Panel.prototype.addRightClickMenu  = ScriptUI.addRightClickMenu;