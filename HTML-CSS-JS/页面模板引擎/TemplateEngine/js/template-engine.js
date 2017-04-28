var TemplateEngine = function(tpl, data) {
	//magic here ...
	var re = /<%([^%>]+)?%>/g,
		reExp = /(^( )?(if|for|else|switch|case|break|{|}))(.*)?/g,
		code = 'var r=[];\n',
		cursor = 0,
		match;
	var add = function(line, js){
		js? code += line.match(reExp)? line + '\n' : 'r.push(' + line + ');\n' : 
			code += 'r.push("' + line.replace(/"/g,'\\"') + '");\n';
	}
	while(match = re.exec(tpl)){
		add(tpl.slice(cursor, match.index));
		add(match[1], true); //<!- say that this is actually valid js -->
		cursor = match.index + match[0].length;
	}
	add(tpl.substr(cursor, tpl.length - cursor));
	code += 'return r.join("");'; //<!-- return the result -->
	//console.log(code);
	return new Function(code.replace(/[\r\t\n]/g, '')).apply(data);
}

var template = 'My skills:' + 
	'<%if(this.showSkills) {%>' +
	    '<p>Hello, my name is <%this.name%>. I\'m <%this.profile.age%> years old.</p>' +
		'<%for(var index in this.skills) {%>' + 		
		'<a href="#"><%this.skills[index]%></a><br/>' +
		'<%}%>' +
	'<%} else {%>' +
		'<p>none</p>' +
	'<%}%>';

/*console.log(TemplateEngine(template, {
	name: "Krasimir Tsonev",
	profile: {
	    age: 29
	},
    skills: ["js", "html", "css"],
    showSkills: true
}));*/