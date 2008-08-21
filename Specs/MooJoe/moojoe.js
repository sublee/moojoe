window.addEvent('load', function() {
	var list = $('list-wrapper');
	$(document.body).setStyle('padding-top',
		list.getPosition().y + list.getSize().y + 10
	);
});

describe('Class Definition', {

	'Simple Mapping Class': function() {
		Name = new MooJoe.Class({
			first: '.first',
			last: '.last'
		}, {
			'get korean name': function() {
				return '{last}, {first}'.substitute(this.properties);
			},
			'get english name': function() {
				return '{first} {last}'.substitute(this.properties);
			},
			'set korean name': function(name) {
				name = name.split(', ');
				return this.set('first', name[1]).set('last', name[0]);
			},
			'set english name': function(name) {
				name = name.split(' ');
				return this.set('first', name[0]).set('last', name[1]);
			},
			'on attach': function(element) {
				element.tween('background-color', ['#d2e0e6', '#f3f1f1']);
			},
			'on sync': function(element) {
				element.tween('background-color', ['#cfe773', '#f3f1f1']);
			}
		});

		value_of(Class.type(Name)).should_be_true();
		value_of(MooJoe.Class.type(Name)).should_be_true();
	},

	'Complex Mapping Class': function() {
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
			members: ['.members .person', [Person]],
			'members.joined': ['.members', 'title', Date]
		});

		value_of(MooJoe.Class.type(Person)).should_be_true();
		value_of(MooJoe.Class.type(Family)).should_be_true();
	},

	'Contain Mapping Rules': function() {
		value_of(Name.rules).should_be($H({
			first: {
				selector: '.first', property: 'html',
				type: String, plural: false
			},
			last: {
				selector: '.last', property: 'html',
				type: String, plural: false
			}
		}));

		value_of(Person.rules).should_be($H({
			name: {
				selector: '.name', property: 'html',
				type: Name, plural: false
			},
			gender: {
				selector: '', property: 'class',
				type: function() {}, plural: false
			},
			age: {
				selector: '.age', property: 'html',
				type: Number, plural: false
			},
			birthday: {
				selector: '.age', property: 'title',
				type: Date, 	plural: false
			},
			picture: {
				selector: '.picture', property: 'src',
				type: String, plural: false
			}
		}));

		value_of(Family.rules).should_be($H({
			head: {
				selector: '.head .person', property: 'html',
				type: Person, plural: false
			},
			members: {
				selector: '.members .person', property: 'html',
				type: Person, plural: true
			},
			'members.joined': {
				selector: '.members', property: 'title',
				type: Date, plural: false
			}
		}));
	},

	'Contain Properties': function() {
		value_of(Name.properties).should_be($H({
			'get korean name': function() {}, 'get english name': function() {},
			'set korean name': function() {}, 'set english name': function() {},
			'on attach': function() {}, 'on sync': function() {}
		}));

		value_of(Person.properties).should_be($H({
			older: function() {}, younger: function() {}
		}));
	}
});

describe('Detached Object', {

	'Create': function() {
		new_name = new Name('Dachimawa', 'Lee');

		value_of(Name.type(new_name)).should_be_true();
		value_of(new_name.isAttached()).should_be_false();
		value_of(new_name.isEmpty).should_be_false();
	},

	'Getter': function() {
		value_of(new_name.get('first')).should_be('Dachimawa');
		value_of(new_name.get('last')).should_be('Lee');
	},

	'Setter': function() {
		new_name.set('first', 'Wonhee').set('last', 'Lim');

		value_of(new_name.get('first')).should_be('Wonhee');
		value_of(new_name.get('last')).should_be('Lim');
	},

	'Custom Getter': function() {
		value_of(new_name.get('korean name')).should_be('Lim, Wonhee');
		value_of(new_name.get('english name')).should_be('Wonhee Lim');
	},

	'Custom Setter': function() {
		var korean_name = 'Kim, Wangjang';
		var english_name = 'Heavy Potter';

		new_name.set('korean name', korean_name);
		value_of(new_name.get('korean name')).should_be(korean_name);
		value_of(new_name.get('first')).should_be('Wangjang');

		new_name.set('english name', english_name);
		value_of(new_name.get('english name')).should_be(english_name);
		value_of(new_name.get('first')).should_be('Heavy');
	},

	'Attach to Element': function() {
		new_name.attach($$('#names .name')[0]);

		value_of(new_name.isAttached()).should_be_true();
		value_of(new_name.isAttached($$('#names .name')[0])).should_be_true();
		value_of(new_name.isAttached($$('#names .name')[1])).should_be_false();
	},

	'Multiple Attachment': function() {
		new_name.attach($$('#names .name')[1]);

		value_of(new_name.isAttached()).should_be_true();
		value_of(new_name.isAttached($$('#names .name')[0])).should_be_true();
		value_of(new_name.isAttached($$('#names .name')[1])).should_be_true();
		value_of(new_name.isAttached($$('#names .name')[2])).should_be_false();
	},

	'Synchronize with Attached Elements': function() {
		value_of($$('#names .name .first')[0].get('html')).should_be('Heavy');
		value_of($$('#names .name .first')[1].get('html')).should_be('Heavy');
	},

	'Change Property and Synchronize': function() {
		new_name.set('first', 'Hairy');

		value_of(new_name.get('first')).should_be('Hairy');

		value_of($$('#names .name .first')[0].get('html')).should_be('Hairy');
		value_of($$('#names .name .first')[1].get('html')).should_be('Hairy');
	},

	'Detach from a Element': function() {
		new_name.detach($$('#names .name')[1]);

		value_of(new_name.isAttached()).should_be_true();
		value_of(new_name.isAttached($$('#names .name')[0])).should_be_true();
		value_of(new_name.isAttached($$('#names .name')[1])).should_be_false()

		new_name.set('first', 'Harry');

		value_of($$('#names .name .first')[0].get('html')).should_be('Harry');
		value_of($$('#names .name .first')[1].get('html')).should_be('Hairy');
	}
});

describe('Element to Object', {

	'Create': function() {
		attached_name = $$('#names .name')[2].toObject(Name);

		value_of(Name.type(attached_name)).should_be_true();
		value_of(attached_name.isAttached()).should_be_true();
		value_of(attached_name.isEmpty).should_be_false();
	},

	'Contain Properties of Element': function() {
		value_of(attached_name.get('english name')).should_be('Johnny Depp');
	},

	'Change Property and Synchronize': function() {
		attached_name.set('last', 'Deep');

		value_of(attached_name.get('last')).should_be('Deep');
		value_of($$('#names .name .last')[2].get('html')).should_be('Deep');
	},

	'Detach from a Element': function() {
		attached_name.detach();

		value_of(attached_name.isAttached()).should_be_false();
		value_of(attached_name.isAttached($$('#names .name')[2]))
			.should_be_false();

		attached_name.set('last', 'Dab');

		value_of(attached_name.get('last')).should_be('Dab');
		value_of($$('#names .name .last')[2].get('html')).should_be('Deep');
	},

	'Attach to Element already attached': function() {
		attached_name.attach($$('#names .name')[0]);

		value_of(attached_name.isAttached()).should_be_true();
		value_of(attached_name.isAttached($$('#names .name')[0]))
			.should_be_true();

		value_of(new_name.isAttached($$('#names .name')[0])).should_be_false();

		value_of($$('#names .name .first')[0].get('html')).should_be('Johnny');
		value_of($$('#names .name .last')[0].get('html')).should_be('Dab');

		new_name.set('last', 'Winston');
		value_of($$('#names .name .last')[0].get('html'))
			.should_not_be('Winston');
	}
});

/*
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
		value_of(dom_name.getMapped('first').getLast()).should_be(
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
	},

	'should detach from element': function() {
		dom_name.detach();
		value_of(dom_name.isAttached()).should_be_false();

		dom_name.set('first', 'Gatomon');

		value_of(dom_name.get('first')).should_be('Gatomon');
		value_of($$('#names .name .first')[0].get('html')).should_be('Haesam');
	},

	'should reattach to element': function() {
		dom_name.attach($$('#names .name')[0]);
		value_of(dom_name.isAttached()).should_be_true();

		value_of($$('#names .name .first')[0].get('html')).should_be('Gatomon');
	},

	'should be multiple mapping': function() {
		var some_name = new Name('Test', 'Done');

		some_name.attach($$('#names .name'));

		value_of($$('#names .name .first')[0].get('html')).should_be('Test');
		value_of($$('#names .name .last')[2].get('html')).should_be('Done');

		some_name.set('first', 'Well');
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

	'should change object property DOM also': function() {
		var new_new_name = new Name('Hngsub', 'Yi');

		person.set('name', new_new_name);

		value_of(person.get('name').get('first'))
			.should_be(new_new_name.get('first'));

		value_of(person.get('name')).should_be(new_new_name);

		value_of($('person').getElement('.name .first').get('html'))
			.should_be(new_new_name.get('first'));
	},

	'should call method': function() {
		person.older();
		value_of(person.get('age')).should_be(19);
	},

	'should pass property': function() {
		var hamster = $('family').getElement('.head .person').toObject(Person);

		value_of(hamster.get('age')).should_be_undefined();
		value_of(hamster.get('birthday')).should_be_undefined();
	}
});

describe('ArrayMapping', {

	'before all': function() {
		family = {get:$empty, set:$empty};//$('family').toObject(Family);
	},

	'should map moojoe class': function() {
		value_of(Person.type(family.get('head'))).should_be_true();
		value_of(family.get('head').get('name').get('first'))
			.should_be('Mungham');

		family.get('head').get('name').set('last', 'Kim');
		value_of(family.get('head').get('name').get('last')).should_be('Kim');
	},

	'should map array contains object': function() {
		value_of(Array.type(family.get('members'))).should_be_true();
		value_of(Person.type(family.get('members')[0])).should_be_true();

		value_of(family.get('members')[0].get('name').get('first'))
			.should_be('Koko');

		family.get('members')[0].get('name').set('last', 'Kim');
		value_of(family.get('members')[0].get('name').get('last'))
			.should_be('Kim');
	}
});
*/
