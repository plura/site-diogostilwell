function setVars( params = {} ) {

	const obj = { ...params };
	
	Object.entries(obj).forEach( ([key, value]) => {

		const obj = typeof value === 'object' ? value : {target: document.body, value: value};	

		obj.target.style.setProperty(`--ds-${ key }`, obj.value);

	} );

}
