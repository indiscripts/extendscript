/***********************************************************************/
/*                                                                     */
/*   ScanRefs  ::  Scan ExtendScript Memory References (snippet)       */
/*                                                                     */
/*   [Ver: 1.0]     [Author: Marc Autret]     [Modif: 01/27/15]        */
/*   [Lang: EN]     [Req: InDesign CS4-CC]    [Creat: 09/29/14]        */
/*   [Type: FREE]                                                      */
/*                                                                     */
/*      Note:                                                          */
/*      The function below helps you visualize how obj/func            */
/*      references are internally connected at a specific point of     */
/*      your script. Might be helpful to investigate on memory leaks,  */
/*      garbage collection issues and related topics.                  */
/*                                                                     */
/*      Bugs & Feedback : marc{at}indiscripts{dot}com                  */
/*                        www.indiscripts.com                          */
/*                                                                     */
/***********************************************************************/

$.scanRefs = function scanRefs(/*0|1*/showAll)
// ---------------------------------------------------------
{
	var s = $.list(),
		p = (!showAll) && s.indexOf('[toplevel]'),
		a = ((!showAll) ? s.substr(0,10+p) : s).split(/[\r\n]+/),
		n = a.length,
		// --- Address:1     L:2  Rf:3   Pp:4  Type:5  Name:6
		re = /^([0-9a-z]{8}) (.) +(\d+) +(\d+) (.{10}) (.{1,17})/,
		reTrim = / +$/,
		i, t, k, m,
		refBy, type, name, tag, rest, rfCount, props, j,
		o = {},
		// ---
		TYPES = {'Function':"FCT", 'Object':"OBJ", 'Array':"ARR", 'RegExp':"REG"};

	for( i=2, refBy=0 ; i < n ; ++i )
		{
		s=a[i];

		while( s && m=s.match(re) )
			{
			k = '&'+m[1].toUpperCase();
			rfCount = parseInt(m[4],10);
			rest = s.substr(m[0].length);
			type = m[5].replace(reTrim,'');
			name = m[6].replace(reTrim,'');
			
			if( 0x5B==rest.charCodeAt(0) )
				{
				p = rest.indexOf(']');
				tag = rest.substr(0,1+p);
				rest = rest.substr(1+p);
				}
			else
				{
				tag = '';
				}
			
			if( 0x20==rest.charCodeAt(0) )
				{
				rest=rest.substr(1);
				}

			if( p=!(rest.indexOf("referenced by:")) )
				{
				rest = rest.substr(14);
				}

			o[k] || (o[k] = {
				locked:		+('L'==m[2]),
				rfCount:	parseInt(m[3],10),
				ppCount:	rfCount,
				type:		TYPES[type]||type,
				name:		name,
				tag:		tag,
				from:		[],
				order:		-1,
				});

			if( 0 < refBy )
				{
				if( p || !rest ){ throw "Unable to parse references." }
				props = rest.split(' ');
				refBy -= (j=props.length);
				while( j-- ) t.from.push([k,props[j]]);
				(props.length=0)||(props=null);
				rest = '';
				}
			else
				{
				refBy = rfCount;
				if( p != !!refBy )
					{
					if( p ){ throw "Unable to parse references."; }
					refBy = 0;
					}
				(t = o[k]).order = n - i;
				}

			(m.length=0)||(m=null);
			s = rest;
			}
		}

	a.length=i=0;
	for( k in o )
		{
		if( !o.hasOwnProperty(k) ) continue;
		a[i++] = k;
		}
	a.sort( function(x,y){return o[x].order-o[y].order;} );
	//a.sort( function(x,y){return parseInt(x.substr(1),16)-parseInt(y.substr(1),16);} );

	var u,
		pngLock = "\x89PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x0E\x00\x00\x00\x0E\b\x06\x00\x00\x00\x1FH-\xD1\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\x9A\x9C\x18\x00\x00\x01VIDAT(\xCF\xA5\x91\xB1j\xC2P\x14\x86\x93\xD6\x94\x98\xA4\xB5\xA5\x85\x0E-R\xAF\xA5\xB8\xF4\x1D\xAA\xEF\x10_B\x9C\xDD\x0B]\xA4o`C\xE9$B\x1C\xCD\x10\x10C6\x05q\td\xA9%\x83d2\x83O\xF0\xF7\xDCp#i\xB5\x1D\xDA\xC0\xC7\xB97\xE7|\xF7\xDC\xCB\x91\x00H\x7FA\xFA\xB7\x98\xFF\xAA\xD5\xEA\x0B\x855\xC1\x13k\xDA\xBF\xEA\x9A\xA6\x9C\x18\xC6\xC1\xB6\xE8\xBBHE\x16\x85w\xC6\xD8\xE3\x91\xA2\xDCQ|\xA2\xFD\x07\xC57\xADXT\x8B\xAAz\xB8#\x8A\x13\xD7\xBC\xD8\xD0\xB4kC\xD7\x19q\xCB*\x95g\xFA\x9FP\xD7\x0B\x8A\n!oE.\xB5Z-\xEC\xA3\xD9l\xA2\xFEP\x07\x1D\xC8;\x18D!/\x16x\x91\xEF\xFBX.\x97\xD8l6H\x92$]O\xA7S\x8CF#\x887\x9F\x13j^T\xB9\xD8\xE9t0\x99L\x10\xC71V\xAB\x15\x82 \xC0\xD0\x1E\xA2\xDDng\xE2\x15q\x9C\x175.:\x8E\x83\xC5b\x81(\x8A \xCB2\xE6\xF39\\\u00D7E\xBF\xDF\xCF\xC4\x1B\xE24/\x1A\\\u00ECv\xBB\xF0<\x0Fa\x18\xA2\xD1h`<\x1E\xC3\xB2,\x98\xA6\x99\x89\x8C8\xDB\x11\x07\x83AzU\xDEu6\x9B\xA5\xA2m\xDB\xE8\xF5z?\x8B4\xC3,\xF9\x1B_E1\x9F\x12Q&j\xC4\xFD\x1Ej\"_\xCA\x8B\x051\xA3K\x91d{(\x8B\xBC\xFE\t\xC1TI!\xE3L\x03\x7F\x00\x00\x00\x00IEND\xAEB`\x82",
		pngNop = "\x89PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x0E\x00\x00\x00\x0E\b\x03\x00\x00\x00(\x96\xDD\xE3\x00\x00\x00\x03PLTE\x00\x00\x00\xA7z=\xDA\x00\x00\x00\x01tRNS\x00@\xE6\xD8f\x00\x00\x00\x15IDATx\xDA\xDD\xC1\x01\x01\x00\x00\x00\x80\x90\xFE\xAF\xF6#\xDA\x01\x00\xD2\x00\x01\xCC \x10\x14\x00\x00\x00\x00IEND\xAEB`\x82",
		w = new Window('dialog', " ExtendScript Memory"),
		p1 = w.add('panel', u, "References"),
		lRefs = p1.add('listbox', u, "",
			{
			numberOfColumns: 4,
			showHeaders: true,
			columnTitles: ["Address", "Type", "Name", "Refs"],
			columnWidths: [90,60,120,36],
			}),
		g = w.add('group'),
		pFrom = g.add('panel', u, "From"),
		lFrom = pFrom.add('listbox', u, "",
			{
			numberOfColumns: 4,
			showHeaders: true,
			columnTitles: ["Address", "Type", "Name", "Property"],
			columnWidths: [90,60,120, 120],
			}),
		pTo = g.add('panel', u, "To"),
		lTo = pTo.add('listbox', u, "",
			{
			numberOfColumns: 4,
			showHeaders: true,
			columnTitles: ["Property", "Address", "Type", "Name"],
			columnWidths: [120,90,60, 120],
			});
	
	g.orientation = 'column';
	w.orientation = 'row';
	w.alignChildren = ['left','top'];

	lRefs.maximumSize = lRefs.minimumSize = [330,450];
	lFrom.maximumSize = lFrom.minimumSize = [420,120];
	lTo.maximumSize = lTo.minimumSize = [420,220];
	
	lRefs.onChange = function()
	{
		lFrom.removeAll();
		lTo.removeAll();
		lFrom.parent.text = "From";
		lTo.parent.text = "To";
		if( !this.selection ) return;

		var key = '&'+this.selection.text,
			t = o[key],
			from = t.from,
			i = from.length,
			k;

		lFrom.parent.text = "["+key.substr(1)+"] is reachable from " + t.ppCount + (1<t.ppCount ? " properties" : " property");
		
		if( t.ppCount && !i )
			{
			with( lFrom.add('item', '--------') )
				{
				image = pngNop;
				subItems[0].text = '';
				subItems[1].text = '<UNKNOWN REFERRER>';
				subItems[2].text = '';
				}
			}

		while( i-- )
			{
			k = from[i][0];
			t = o[k];
			with( lFrom.add('item', k.substr(1)) )
				{
				image = t.locked ? pngLock : pngNop;
				subItems[0].text = t.type;
				subItems[1].text = t.name + ' ' + t.tag;
				subItems[2].text = from[i][1];
				}
			}

		for( k in o )
			{
			if( !o.hasOwnProperty(k) ) continue;
			t = o[k];
			from = o[k].from;
			i = from.length;
			while( i-- )
				{
				if( from[i][0]!=key ) continue;

				with( lTo.add('item', from[i][1]) )
					{
					image = pngNop;
					subItems[0].text = k.substr(1);
					subItems[1].text = t.type;
					subItems[2].text = t.name + ' ' + t.tag;
					}
				}
			}

		lTo.parent.text = "["+key.substr(1)+"]'s properties had access to " + lTo.items.length + " addr.";

		from = t = null;
	};

	for( i=0, n=a.length ; i < n ; ++i )
		{
		t = o[k=a[i]];
		with( lRefs.add('item', k.substr(1)) )
			{
			image = t.locked ? pngLock : pngNop;
			subItems[0].text = t.type;
			subItems[1].text = t.name + ' ' + t.tag;
			subItems[2].text = t.ppCount + '/' + t.rfCount;
			}
		}

	w.show ();
};


// SAMPLE CODE
// ---
/*
var t;
var f = function MyFunc()
{
	(function MyInnerFunc(){})();
};
f = null;
$.scanRefs(0);
*/
