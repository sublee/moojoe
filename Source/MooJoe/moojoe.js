MooJoe = {
	Class: new Class({
		initialize: function(rules, properties) {
			rules = $H(rules);
			var reflections = {};

			rules.each(function(rule, property) {
				var element, p = 'html', t = String;

				if($type(rule) == 'string')
					element = rule;

				else if($type(rule) == 'array') {
					element = rule.shift();

					rule = rule.link({
						type: function(i) {
							return Native.type(i) || Class.type(i);
						},
						property: String.type
					});

					if(rule.property) p = rule.property;
					if(rule.type) t = rule.type;
				}

				var ref = reflections[property] = {
					element: element, property: p, type: t
				};

				properties['get ' + property] = function() {
					if(this.properties[property])
						return this.properties[property];

					else if(this.isAttached()) {
						var value = this.getMapped(property).get(ref.property);
						if(this.isEmpty) this.set(property, value);
						return value;
					}
				}

				properties['set ' + property] = function(value) {
					if(this.isAttached())
						this.getMapped(property).set(ref.property, value);

					return this.properties[property] = value;
				}
			}, this);

			var moojoe_class = new Class({

				initialize: function() {
					this.properties = {};
					this.isEmpty = !arguments.length;

					if(Function.type(properties.initialize))
						properties.initialize.run(arguments, this);

					else {
						var rule_names = rules.getKeys();
						$A(arguments).each(function(arg, i) {
							this.properties[rule_names[i]] = arg;
						}, this);
					}
				},

				get: function(property) {
					if(Function.type(properties['get ' + property]))
						return properties['get ' + property].bind(this)();
					else
						return this.properties[property];
				},

				set: function(property, value) {
					if(Function.type(properties['set ' + property]))
						return properties['set ' + property].run(value, this);
					else
						return this.properties[property] = value;
				},

				attach: function(element) { // Thanks to xymfonii
					this.element = $(element);

					rules.each(function(rule, property) {
						if(this.isEmpty) this.get(property);
						else this.set(property, this.get(property));
					}, this);

					this.isEmpty = true;

					return this.element;
				},

				detach: function() {
					var el = this.element;
					this.element = false;
					return el;
				},

				isAttached: function() {
					return Element.type(this.element);
				}
			});

			moojoe_class.rules = rules;
			moojoe_class.properties = properties;

			moojoe_class.implement({
				getMapped: function(property) {
					return this.element.getElement(
						reflections[property].element
					);
				}
			});

			return moojoe_class;
		}
	})
};

Element.implement({
	toObject: function(moojoe_class) {
		var o = new moojoe_class();
		o.attach(this);

		return o;
	}
});

Elements.implement({
	toObject: function(moojoe_class) {
		return this.map(function(element) {
			return element.toObject(moojoe_class);
		});
	}
});


/*					this.element = $(element);
					this.reflections = {};

					$H(definitions).each((function(rule, property) {
						var element, p = 'html', t = String;

						if($type(rule) == 'string')
							element = rule;

						else if($type(rule) == 'array') {
							element = rule.shift();

							rule = rule.link({
								type: function(i) {
									return Native.type(i) || Class.type(i);
								},
								property: String.type
							});

							if(rule.type) t = rule.type;
							if(rule.property) p = rule.property;
						}

						var ref = this.reflections[property] = {
							element: this.element.getElement(element),
							property: p, type: t
						};

						if(Native.type(ref.type))
							this[property] = new ref.type(
								ref.element.get(ref.property)
							);
						else if(Class.type(ref.type))
							this[property] = new ref.type(ref.element);
						else if(Function.type(ref.type))
							this[property] = ref.type(
								ref.element.get(ref.property), ref.element
							);

					}).bind(this));
				},*/
