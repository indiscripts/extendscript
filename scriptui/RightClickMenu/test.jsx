#include 'RightClickMenu.jsx'

var testRightClickMenu = function(  w,ui,u)
{
    w = new Window('dialog', "Right Click Menu");
    
    ui = w.addRightClickMenu({
        item1: "Menu Item 1",
        item2: "A longer Menu Item 2",
        item3: "Item 3",
        item4: "This is the 4th Menu Item",
        item5: "Last one!",
    });

    ui.add('panel')
        .add('checkbox', u, 'This is chekbox 1').parent
        .add('checkbox', u, 'This is chekbox 2').parent
        .add('checkbox', u, 'This is chekbox 3');
    
    ui.add('panel')
        .add( 'button', u, "OK", {name:"OK"} ).parent
        .add( 'button', u, "Cancel", {name:"Cancel"} ).parent
        .orientation = 'row';

    var info = ui.add('statictext', u, "Please, give a try to the right-click...");
    info.preferredSize = [400,20];

    w.addEventListener('menu', function(ev)
    {
        info.text = 'Last selection: ' + ev.menuLabel + ' (' + ev.menuKey + ')';
    });

    w.show();
};

testRightClickMenu();