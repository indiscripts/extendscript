/***********************************************************************/
/*                                                                     */
/*   InGoogle :: Invoke Google from InDesign, based on the selection   */
/*                                                                     */
/*   [Ver: 1.0]   [Author: M. Fisher & M. Autret]   [Modif: 01/13/15]  */
/*   [Lang: EN|FR|DE]   [Req: InDesign CS4-CC]      [Creat: 01/13/15]  */
/*   [Type: FREE]                                                      */
/*                                                                     */
/*   Based on Martin Fisher's googleSelection.jsx script (oct. 2010)   */
/*    http://bit.ly/1waenhR                                            */
/*   Details on Google search parameters:                              */
/*    http://bit.ly/1yd4lAP                                            */
/*                                                                     */
/*      Installation:                                                  */
/*                                                                     */
/*      1) Place the current file into the Scripts/Scripts Panel/      */
/*         folder                                                      */
/*                                                                     */
/*      2) Start InDesign, select some text in a document              */
/*                                                                     */
/*      3) Exec the script from Window>Automatisation>Scripts (CS4)    */
/*                           or Window>Utilities>Scripts (CS5/CS6/CC)  */
/*         + double-click on the script file name                      */
/*                                                                     */
/*      Bugs & Feedback : marc{at}indiscripts{dot}com                  */
/*                        www.indiscripts.com                          */
/*                                                                     */
/***********************************************************************/


const ENGINE = 'http://www.google.com/search?q=%1&hl=%2&lr=lang_%2';

const LOC2LANG = {
	ARABIC:					'ar',
	CZECH:					'cs',
	DANISH:					'da',
	ENGLISH:				'en',
	FINNISH:				'fi',
	FRENCH:					'fr',
	GERMAN:					'de',
	GREEK:					'el',
	HEBREW:					'he',
	HUNGARIAN:				'hu',
	INTERNATIONAL_ENGLISH: 	'en',
	ITALIAN:				'it',
	JAPANESE:				'ja',
	KOREAN:					'ko',
	POLISH:					'pl',
	PORTUGUESE:				'pt',
	ROMANIAN:				'ro',
	RUSSIAN:				'ru',
	SIMPLIFIED_CHINESE: 	'zh',
	SPANISH:				'es',
	SWEDISH:				'sv',
	TRADITIONAL_CHINESE: 	'zh',
	TURKISH:				'tr',
	UKRAINIAN:				'uk',
	};


(function(s,lg,q,url,doc,src,dst,hyper)
{
	lg = LOC2LANG[(function(L,k){for( k in Locale )if( L==+Locale[k] ) return k.replace(/_LOCALE$/,'')})(+app.locale)]||'en';

	if( !s.length || !(s=s[0]).hasOwnProperty('baseline') || !s.characters.length )
		{
		alert( {
			fr: "Aucun texte s\xE9lectionn\xE9.",
			de: "Es wurde kein Text ausgew\xE4hlt",
			}[lg]||"No text selected." );
		return;
		}

	q = s.texts[0].contents.split(/\s+/g).join('+');
	url = localize(ENGINE, q, lg);
	doc = app.properties.activeDocument;
	
	try {
		src = doc.hyperlinkTextSources.add({ sourceText:s });
		dst = doc.hyperlinkURLDestinations.add({ destinationURL:url });
		hyper = doc.hyperlinks.add({destination:dst, source:src});
		} 
	catch(e)
		{ 
		alert(e);
		return;
		}

 	hyper.showDestination();
	hyper.remove();
	dst.remove();
	src.remove();

})(app.selection);
