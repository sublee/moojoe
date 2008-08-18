MooJoe = {
	Class: new Class({
		initialize: function(definitions) {
			return new Class({
				initialize: function(element) {
					this.element = $(element);
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
				},

				get: function(property) {
					return this[property];
				},

				set: function(property, value) {
					this[property] = value;

					var ref = this.reflections[property];
					ref.element.set(ref.property, value);

					return value;
				}
			});
		}
	})
};

Element.implement({
	toObject: function(moojoe_class) {
		return new moojoe_class(this);
	}
});

Elements.implement({
	toObject: function(moojoe_class) {
		return this.map(function(element) {
			return element.toObject(moojoe_class);
		});
	}
});
