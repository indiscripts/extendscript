(function(G, t)
{
	const	V = '',
			O = {'~':1,'*':2,'/':2,'%':2,'+':2,'-':2,'<<':2,'>>':2,'>>>':2,'&':2,'^':2,'|':2},
			S = 'toString',
			µ = function µ(x)
				{
					if( x && 'object'==typeof x  )
						{
						ENCODE(x);
						return µ;
						}

					return µ[x||(x=V)] ||
						(G[x]=µ[((µ[x]=function(x){return µ(x)}).__proto__=µ)[x].__name__=x]);
				};

	var OP2STR = function F(k)
	{
		if( k===(F.Q[k]||k) )return uneval(k);
		return F.CALLBACK(k[0], F.Q[k][0]&&F(F.Q[k][0]), F.Q[k][1]&&F(F.Q[k][1]) );
	};

	var ENCODE = function F(o)
	{
		var k, s;

		OP2STR.Q = µ[V][V];
		OP2STR.CALLBACK = F.OP_CALLBACK;

		for( k in o )
			{
			if( 'function' != typeof µ[k] ) continue;
			if( !µ[V][V].hasOwnProperty(s = o[k][S]()) ) continue;
			µ[k]=null; delete µ[k];
			µ[k] = new Function(F.OP_CALLBACK.CALLNAME, "return " + OP2STR(s) + ";");
			}
	};

	(ENCODE.OP_CALLBACK = function F(op,s1,s2)
	{
		return F.CALLNAME+"('" + op + "'" +
			(s1 ? (", " + s1) : '') +
			(s2 ? (", " + s2) : '') +
			")";
	}).CALLNAME = "f";

	µ[V] = function F(o,y,w, x)
	{
		if( !(o in O) )return µ;
		(µ===y)&&(y=x);
		(µ===this)||(x=this[S]());
		('undefined'==typeof y)||(y=''+(y&&y[S]()));
		(F[V]||(F[V]={}))[o+=F[V].__count__+(Math.random()*1e9)[S](32)]=[].concat((w?y:x)||[],(w?x:y)||[]);
		return µ(o);
	};
	
	µ[S] = function()
	{
		return this.__name__ || this.name || '';
	};

	for( t in O )(µ[t]=function F(y,w){return µ[V].call(this,F.__name__,y,!!w)}).__name__=t;
	
	G._ = µ;

})($.global);
