/*
 * JSON-Object-Element Mapper for jquery
 *
 * Copyright 2008 Alan Kang
 *  - mailto:jania902@gmail.com
 *  - http://jania.pe.kr
 *
 */
(function($) {
	// Simple Javascript Templating from http://ejohn.org/blog/javascript-micro-templating/
	var _template_cache = {};
	var _template = function(str, data) {
		// Figure out if we're getting a template, or if we need to
		// load the template - and be sure to cache the result.
		var fn = !/\W/.test(str) ?
				_template_cache[str] = _template_cache[str] ||
				_template(document.getElementById(str).innerHTML) :

				// Generate a reusable function that will serve as a template
				// generator (and which will be cached).
				new Function("obj",
					"var p=[],print=function(){p.push.apply(p,arguments);};" +
					// Introduce the data as local variables using with(){}
					"with(obj){p.push('" +
					// Convert the template into pure JavaScript
					str
						.replace(/[\r\t\n]/g, " ")
						.split("<@").join("\t")
						.replace(/((^|@>)[^\t]*)'/g, "$1\r")
						.replace(/\t=(.*?)@>/g, "',$1,'")
						.split("\t").join("');")
						.split("@>").join("p.push('")
						.split("\r").join("\\'")
					+ "');}return p.join('');");

		// Provide some basic currying to the user
		return data ? fn( data ) : fn;
	};
	
	
	
	var _camelize = function(str) {
		return str.substring(0, 1).toUpperCase() + str.substring(1);
	};
	var _toObjs = {
		'string': function(value) {return value;},
		'number': function(value) {return Number(value);}
	};
	var _toDoms = {
		'string': function(value) {return value;},
		'number': function(value) {return value.toString();}
	};
	var _interpreteDefExpression = function(def) {
		var result = {};
		
		// parse expression
		var m = def.match(/^(.+?)(?:\s*\[\[(.+)\]\])?(?:\s*\{\{(.+)\}\})?$/);
		var selector = m[1];
		var attrName = m[2];
		var type = m[3] || 'string';
		
		// set selector
		result.select = function($e) {return $e.find(selector);};

		// set accessor & converter
		result.toObj = _toObjs[type];
		result.toDom = _toDoms[type];
		
		if(type.indexOf('array<') === 0) {
			// if it's an array, change accessors appropriately
			var classId = type.match(/array<(.+)>/)[1];
			result.toObj = function(value) {return value.toObj(classId, true);};
			result.toDom = function(value) {
				if(value.constructor !== Array) return value.isAttached() ? value.$e : $(value.toHtml());
				
				return $(value).map(function() {
					return this.isAttached() ? this.$e : $(this.toHtml());
				});
			};
			result.get = function($e) {return $e.children();};
			result.set = function($e, value) {$e.empty(); value.appendTo($e);};
			
			// and define additional array operations
			result.arrayInsert = function($e, index, value) {
				$($e.children().get(index)).before(value);
			};
			result.arrayDelete = function($e, index) {
				var target = $e.children().get(index);
				target.parentNode.removeChild(target);
			};
			result.arrayAppend = function($e, value) {
				$($e).append(value);
			};
			result.arrayPrepend = function($e, value) {
				$($e).prepend(value);
			};
			result.arrayReplace = function($e, index, value) {
				$($e.children().get(index)).replaceWith(value);
			};
		} else if(!result.toObj) {
			// if there's no converter, it's an composited object
			result.toObj = function(value) {return value.toObj(type);};
			result.toDom = function(value) {return value;};
			result.get = function($e) {return $e;};
			result.set = function($e, value) {value.isAttached() ? $e.replaceWith(value.$e) : value.attach($e);};
		} else if(attrName) {
			// if attrName is specified, use attribute
			result.get = function($e) {return $e.attr(attrName);};
			result.set = function($e, value) {$e.attr(attrName, value);};
		} else {
			// if attrName is not specified, use innerHTML
			result.get = function($e) {return $e.html();};
			result.set = function($e, value) {$e.html(value);};
		}
		
		// set type
		result.type = type;
		
		// done!
		return result;
	};
	var _generateProperty = function(instanceMembers, key, def) {
		if(typeof def === 'function') {
			instanceMembers[key] = def;
			return;
		}
		
		if(typeof def === 'string') def = _interpreteDefExpression(def);
		
		var defaultDefs = {
			toObj: function(value) {return value;},
			toDom: function(value) {return value;},
			select: function($e) {return $e.find('.' + key);},
			get: function($e) {return $e.html();},
			set: function($e, value) {$e.html(value);},
			type: 'string'
		}
		
		def = $.extend(defaultDefs, def);
		
		var accessor = function(optValue) {
			if(arguments.length === 0) {
				return this.isAttached() ?
					def.toObj(def.get(def.select(this.$e))) : 
					this._args[key];
			} else {
				this.isAttached() ? 
					def.set(def.select(this.$e), def.toDom(optValue)) :
					this._args[key] = optValue;
			}
		};
		accessor.def = def;
		
		instanceMembers[key] = accessor;
		
		// for array, generate additional array operations
		if(def.type.indexOf('array<') === 0) {
			var camelizedKey = _camelize(key);
			
			instanceMembers['insert' + camelizedKey] = function(index, value) {
				this.isAttached() ?
					def.arrayInsert(def.select(this.$e), index, def.toDom(value)) :
					this._args[key].splice(index, 0, value);
			};
			instanceMembers['delete' + camelizedKey] = function(index) {
				this.isAttached() ?
					def.arrayDelete(def.select(this.$e), index) :
					this._args[key].splice(index, 1);
			};
			instanceMembers['append' + camelizedKey] = function(value) {
				this.isAttached() ?
					def.arrayAppend(def.select(this.$e), def.toDom(value)) :
					this._args[key].push(value);
			};
			instanceMembers['prepend' + camelizedKey] = function(value) {
				this.isAttached() ?
					def.arrayPrepend(def.select(this.$e), def.toDom(value)) :
					this._args[key].splice(0, 0, value);
			};
			instanceMembers['replace' + camelizedKey] = function(index, value) {
				this.isAttached() ?
					def.arrayReplace(def.select(this.$e), index, def.toDom(value)) :
					this._args[key].splice(index, 1, value);
			};
		}
	};
	var _generateClass = function(classId, propertyDefs, template) {
		// make prototype
		var instanceMembers = {
			isAttached: function() {return !!this.$e;},
			attach: function($e) {
				if(this.isAttached()) throw "already attached";
				if(!$e) throw "should provide an element to be attached";
				
				// this._args should be removed in order to
				// make following accessors to work in detached mode
				var args = this._args;
				delete this._args;
				
				// write all properties to $e
				this.$e = $e;
				for(var key in args) {
					var value = args[key];
					
					// recursive attaching is performed automatically
					// when following accessor is called
					this[key](value);
				}
			},
			detach: function() {
				if(!this.isAttached()) throw "already detached";
				
				// read all properties from $e
				this._args = {};
				for(var key in propertyDefs) {
					if(typeof propertyDefs[key] === 'function') continue;
					
					var value = this[key]();
					
					// recursively detach composited objects
					if(value.__joe__) value.detach();
					if(value.constructor === Array) {
						for(var i = 0; i < value.length; i++) if(value[i].__joe__) value[i].detach();
					}
					
					this._args[key] = value;
				}
				
				// remove $e
				delete this.$e;
			},
			toHtml: function() {
				if(!template) throw "template has not been provided when the class was defined";
				return _template(template, this);
			},
			toJson: function() {
				var json = {};
				for(var key in propertyDefs) {
					if(typeof propertyDefs[key] === 'function') continue;

					var value = this[key]();
					if(value.__joe__) value = value.toJson();
					if(value.constructor === Array) {
						for(var i = 0; i < value.length; i++) if(value[i].__joe__) value[i] = value[i].toJson();
					}
					json[key] = value;
				}
				
				return json;
			},
			__joe__: true
		};
		
		// assign properties to prototype
		for(var key in propertyDefs) _generateProperty(instanceMembers, key, propertyDefs[key]);
		
		// make class
		var clazz = function() {
			var arg0 = arguments[0];
			if(arg0.__json__) {
				// create detached object from JSON
				// TODO
				throw 'Not implemented';
			} else if(arg0.jquery) {
				// create attached object
				this.$e = arg0;
			} else {
				// create detached object
				var i = 0;
				this._args = {};
				for(var key in propertyDefs) {
					if(typeof propertyDefs[key] === 'function') continue;
					this._args[key] = arguments[i++];
				}
			}
		}
		clazz.prototype = instanceMembers;
		
		// assign class members
		clazz.fromJson = function(json) {
			json.__json__ = true;
			return new $.joe[classId](json);
		}
		
		return clazz;
	};
	
	
	
	$.joe = {
		def: function(classId, propertyDefs, template) {
			if(!classId || typeof classId !== 'string') throw '[classId] should be non empty string';
			if(!propertyDefs || typeof propertyDefs !== 'object') throw '[propertyDefs] should be an dictionary';
			
			$.joe[classId] = _generateClass(classId, propertyDefs, template);
		}
	};
	
	$.fn.toObj = function(classId, forceArray) {
		if(!classId || typeof classId !== 'string') throw '[classId] should be non empty string';
		
		var clazz = $.joe[classId];
		if(!clazz) throw 'Class not found: [' + classId + ']';
		
		if(!forceArray && this.length === 1) {
			return new clazz(this);
		} else {
			var mos = [];
			this.each(function() {mos.push(new clazz($(this)));});
			return mos;
		}
	}
})(jQuery);