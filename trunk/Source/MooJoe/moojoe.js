MooJoe = {
	Array: new Class({
		initialize: function(array, attached) {
			array.attached = attached || [];
			array.get = function(index) {
				return this[index];
			}
			array.set = function(index, value) {
				this[index].attached.each(function(attached) {
					value.attach(attached);
				});
				this[index] = value;
				return this;
			}
			array.inject = function(value, index) {
				index = index || this.length;

				if(this.length && index <= this.length) {
					var src = this.attached[index - 1];
					var attached = src.clone();
					var args = [src, 'after'];
				}
/*				else if(Element.type(value.$family.template)) {
					var attached = $(value.$family.template).clone();
					var args = [attached];
				}
*/				else
					return false;

				if(index < this.length) {
					for(var i = this.length; i > index; -- i) {
						this[i] = this[i - 1];
						this.attached[i] = this.attached[i - 1];
					}
				}

				value.attach(attached);
				attached.inject.run(args, attached);

				this[index] = value;
				this.attached[index] = attached;
			}

			return array;
		}
	}),

	Class: new Class({

		initialize: function(rules, properties) {
			var template = null;

			properties = $H(properties).filter(function(item, key) {
				var matched = key.match(/^\$(.+)/);

				if(!matched)
					return true;

				else switch(matched[1]) {
					case 'template':
						template = $(item);
						break;
				}
				return false;

			});

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

					this[this.isEmpty ? 'pull' : 'push'](undefined, element);

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

				push: function(property, element) {
					if(!$defined(property)) rules.each(function(_, property) {
						this.push(property, element);
					}, this);

					else {
						var rule = rules.get(property);
						var value = this.get(property);

						var push = function(element) {
							if(rule.selector)
								element = element.getElement(rule.selector);

							if(element) {
								if(MooJoe.Class.type(rule.type))
									value.attach(element);
								else
									element.set(rule.property, value);

								if(Function.type(this['on push']))
									this['on push'](element);
							}
						}

						if(element) push.run(element, this);
						else this.attached.each(push, this);
					}
				},

				pull: function(property, element) {
					if(!$defined(property)) rules.each(function(_, property) {
						this.pull(property, element);
					}, this);

					else {
						var rule = rules.get(property);
						element = element || this.attached.getLast();

						var casted = function(element, value) {
							if(Native.type(rule.type))
								return new rule.type(value);
							else if(Function.type(rule.type))
								return rule.type(value);
							else if(MooJoe.Class.type(rule.type))
								return element.toObject(rule.type);
							else
								return value;
						}

						if(rule.plural) {
							if(rule.selector) var elements =
								element.getElements(rule.selector);

							if(elements)
								this.set(property, new MooJoe.Array(
									elements.map(function(el) {
										return casted(el,
											el.get(rule.property)
										);
									}), elements
								));
							else
								this.set(property, new MooJoe.Array([]));
						}
						else {
							if(rule.selector)
								element = element.getElement(rule.selector);

							if(element) var value = casted(element,
								element.get(rule.property)
							);
							else var value = null;

							this.set(property, value);
						}
					}
				},

				get: function(property) {
					if(Function.type(this['get ' + property]))
						return this['get ' + property]();

					return this.properties.get(property);
				},

				set: function(property, value) {
					if(Function.type(this['set ' + property]))
						return this['set ' + property](value);

					this.properties.set(property, value);

					if(!this.isEmpty) {
						if(rules.has(property)) this.push(property);

						if(Function.type(this['on set ' + property]))
							this['on set ' + property](value);
					}

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

			mjclass.template = template;

			mjclass.isMooJoeClass = true;
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
	return !! item.isMooJoeClass;
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
