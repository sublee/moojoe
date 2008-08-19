//var Name, names, Person, person;

describe('DefineClass', {

	'should define simple mapping class': function() {
		var mooclass = new Class();

		Name = new MooJoe.Class({
			first: '.first',
			last: '.last'
		}, {
			'get korean name': function() {
				return '{last}, {first}'.substitute(this.properties);
			},
			'get english name': function() {
				return '{first} {last}'.substitute(this.properties);
			}
		});

		value_of(Class.type(Name)).should_be_true();
		value_of(MooJoe.Class.type(Name)).should_be_true();

		value_of(Class.type(mooclass)).should_be_true();
		value_of(MooJoe.Class.type(mooclass)).should_be_false();
	},

	'should define complex mapping class': function() {
		Person = new MooJoe.Class({
			name: ['.name', Name],
			gender: ['', 'class', function(classes) {
				classes = classes.split(' ');
				return classes.link({ gender: function(text) {
					return ['male', 'female'].contains(text);
				}}).gender;
			}],
			age: ['.age', Number],
			birthday: ['.age', 'title', Date],
			picture: ['.picture', String, 'src']
		}, {
			older: function() {
				this.set('age', this.get('age') + 1);
				return this;
			},
			younger: function() {
				this.set('age', this.get('age') - 1);
				return this;
			}
		});

		Family = new MooJoe.Class({
			head: ['.head .person', Person],
			members: ['.members .person', [Person]]
		});

		value_of(MooJoe.Class.type(Person)).should_be_true();
		value_of(MooJoe.Class.type(Family)).should_be_true();
	}
});

describe('DetachedObject', {

	'should return detached object': function() {
		new_name = new Name('Dachimawa', 'Lee');

		value_of(Name.type(new_name)).should_be_true();
		value_of(new_name.isAttached()).should_be_false();

		value_of(new_name.get('first')).should_be('Dachimawa');
		value_of(new_name.get('last')).should_be('Lee');
	},

	'should call getter': function() {
		value_of(new_name.get('korean name')).should_be('Lee, Dachimawa');
		value_of(new_name.get('english name')).should_be('Dachimawa Lee');
	}
});

describe('SimpleMapping', {

	'should be empty': function() {
		empty_name = new Name();
		value_of(empty_name.isEmpty).should_be_true();
	},

	'should attach to element': function() {
		value_of($$('#names .name')[1].getFirst().get('html')
		).should_be('Chaeyeong');

		new_name.attach($$('#names .name')[1]);

		value_of($$('#names .name .first')[1].get('html')).should_be(
			new_name.get('first')
		);
	},

	'should be attached': function() {
		dom_name = $$('#names .name')[0].toObject(Name);
		empty_name.attach($$('#names .name')[2]);

		value_of(new_name.isAttached()).should_be_true();
		value_of(dom_name.isAttached()).should_be_true();
		value_of(empty_name.isAttached()).should_be_true();

		value_of(dom_name.isEmpty).should_be_false();
		value_of(empty_name.isEmpty).should_be_false();
	},

	'should return mapped element': function() {
		value_of(dom_name.getMapped('first')).should_be(
			$$('#names .name .first')[0]
		);
	},

	'should return same property with DOM': function() {
		value_of(dom_name.get('first')).should_be('Heungsub');
	},

	'should change property DOM also': function() {
		dom_name.set('first', 'Haesam');

		value_of(dom_name.get('first')).should_be('Haesam');
		value_of($$('#names .name .first')[0].get('html')).should_be(
			dom_name.get('first')
		);

		var names = [
			'apple', 'banana', 'lemon', 'tomato', 'grapes', 'paprika'
		];
		for(var i = 0, n = 'start!'; i < 100; ++i, n = names.getRandom()) {
			empty_name.set('last', n);
			value_of(empty_name.get('last')).should_be(n);
			value_of($$('#names .name .last')[2].get('html')).should_be(n);
		}
	}
});

describe('ComplexMapping', {

	'before all': function() {
		person = $('person').toObject(Person);
	},

	'should map native type': function() {
		value_of(Number.type(person.get('age'))).should_be_true();
		value_of(Date.type(person.get('birthday'))).should_be_true();
		value_of(String.type(person.get('picture'))).should_be_true();
	},

	'should map moojoe class': function() {
		value_of(Name.type(person.get('name'))).should_be_true();
		value_of(person.get('name').get('first')).should_be('Heungsub');

		person.get('name').set('last', 'Kim');
		value_of(person.get('name').get('last')).should_be('Kim');
	},

	'should run custom function': function() {
		value_of(person.get('gender')).should_be('male');
	},

	'should change property DOM also': function() {
		var new_src
			= 'http://farm1.static.flickr.com/100/304279073_59eaccb6e5_s.jpg';

		person.set('picture', new_src);

		value_of(person.get('picture')).should_be(new_src);
		value_of($('person').getElement('img').get('src')).should_be(new_src);
	},

	'should call method': function() {
		person.older();
		value_of(person.get('age')).should_be(19);
	}
});
