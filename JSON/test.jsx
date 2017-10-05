#include 'json.jsx'

var obj = {
	myNumber: 12345678,
	myBool: true,
	myString: "Hello\tWorld\u00a0: This is fine!",
	myRegex: /[a-z\d]+/,
	myArray: [ ['this', 'is'], [1], ['array', 'of', 'arrays'] ],
	myObject: {a:1,b:2,c:3},
	myUnit: UnitValue(5,'mm'),
	myXML: <root><aaa xxx='yyy'>hello</aaa></root>,
	myDate: new Date,
	myFile: File("c:/test.txt"),
	myNativeObj: $.global,
	};

alert( JSON(obj,1) );