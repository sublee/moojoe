MooJoe = {
	Class: new Class({
		initialize: function(rules, properties) {
			properties = $H(properties);

			rules = $H(rules).map(function(rule, name) {
				var selector, property = 'html', type = String, plural = false;

				var isType = function(item) {
					return [Native, Class, Function].some(function(type) {
						return type.type(item);
					});
				}

				if(String.type(rule)) selector = rule;

				else if(Array.type(rule)) {
					selector = rule.shift();

					rule = rule.link({
						property: String.type,
						type: function(item) {
							return isType(item) || (
								Array.type(item) && isType(item[0])
							);
						}
					});

					property = rule.property || property;
					plural = Array.type(rule.type);
					type = (plural ? rule.type[0] : rule.type) || type;
				}

				return {
					selector: selector,
					property: property,
					type: type,
					plural: plural
				};
			});

			var mjclass = new Class({

				initialize: function() {
					this.properties = $H(), this.attached = [];
					var parameters = rules.getKeys();

					this.isEmpty = !arguments.length;

					$A(arguments).each(function(argument, i) {
						this.set(parameters[i], argument);
					}, this);
				},

				attach: function(element) {
					element = $(element);

					var old = element.retrieve('attached')
					if(old) old.detach(element);

					element.store('attached', this);

					this.attached.push(element);

					rules.each(function(rule, property) {
						this.sync(property, this.get(property));
					}, this);

					this.isEmpty = false;

					if(Function.type(this['on attach']))
						this['on attach'](element);

					return this;
				},

				detach: function(element) {
					if($defined(element)) {
						element = $(element);
						element.store('attached', undefined);

						this.attached.erase(element);
					}
					else {
						this.attached.each(function(el) {
							el.store('attached', undefined);
						});

						this.attached.empty();
					}

					return this;
				},

				sync: function(property, value) {
					var just_import = !$defined(value) &&
						this.isEmpty && this.isAttached();

					var rule = rules.get(property);

					this.attached.each(function(element) {
						if(rule.selector)
							element = element.getElement(rule.selector);

						if(just_import) this.set(
							property,
							element.get(rule.property),
							just_import
						);

						else {
							if(MooJoe.Class.type(rule.type))
								value.attach(element);
							else
								element.set(rule.property, value);
						}

						if(Function.type(this['on sync']))
							this['on sync'](element);
					}, this);
				},

				get: function(property) {
					if(Function.type(this['get ' + property]))
						return this['get ' + property]();

					return this.properties.get(property);
				},

				set: function(property, value, just_import) {
					if(Function.type(this['set ' + property]))
						return this['set ' + property](value);

					else if(rules.has(property) && !just_import)
						this.sync(property, value);

					this.properties.set(property, value);
					return this;
				},

				isAttached:	function(element) {
					if($defined(element))
						return this.attached.contains($(element))
					else
						return !! this.attached.length;
				}
			});

			var extension = { $family: mjclass };
			properties.each(function(value, name) {
				if(Function.type(value)) this[name] = value;
			}, extension);

			mjclass.implement(extension);

			mjclass.$isMooJoeClass = true;
			mjclass.type = function(item) {
				return this === item.$family;
			}

			mjclass.rules = rules;
			mjclass.properties = properties;

			return mjclass;
		}
	})
};

MooJoe.Class.type = function(item) {
	return !!item.$isMooJoeClass;
}

Element.implement({
	toObject: function(mjclass) {
		var o = new mjclass();
		o.attach(this);
		return o;
	}
});

Elements.implement({
	toObject: function(mjclass) {
		return this.map(function(element) {
			return element.toObject(mjclass);
		});
	}
});
