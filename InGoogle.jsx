/***********************************************************************/
/*                                                                     */
/*   InGoogle :: Invoke Google from InDesign, based on the selection   */
/*                                                                     */
/*   [Ver: 1.1]   [Author: M. Fisher & M. Autret]   [Modif: 01/13/15]  */
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


// Set the below param, FORCE_EXACT_MATCH, as follows:
// 1 <=> always send a "word1 word2 word3..." query to Google (exact match)
// 0 <=> send an exact-match query *only* if non-breaking spaces are used
// ---
const FORCE_EXACT_MATCH = 1;

const ENGINE = 'http://www.google.com/search?%1=%2&hl=%3&lr=lang_%3';

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


(function(s,lg,t,q,qType,url,doc,src,dst,hyper)
{
	// Language in 'xx' form (lowercase) based on the ID Locale
	// ---
	lg = LOC2LANG[(function(L,k){for( k in Locale )if( L==+Locale[k] ) return k.replace(/_LOCALE$/,'')})(+app.locale)]||'en';

	// Is there some (selected) text?
	// ---
	if( !s.length || !(s=s[0]).hasOwnProperty('baseline') || !s.characters.length )
		{
		alert( {
			fr: "Aucun texte s\xE9lectionn\xE9.",
			de: "Es wurde kein Text ausgew\xE4hlt",
			}[lg]||"No text selected." );
		return;
		}

	
	// Format the query string
	// ---
	t = s.texts[0].contents;
	qType = (FORCE_EXACT_MATCH || /[\u00A0\u202F]/.test(t)) ? 'as_epq' : 'q';
	q = t.split(/\s+/g).join('+');
	url = localize(ENGINE, qType, q, lg);
	
	// Create and call a 'ghost' hyperlink based on the url
	// ---
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
 	
 	// Cleanup
 	// ---
	hyper.remove();
	dst.remove();
	src.remove();

})(app.selection);
