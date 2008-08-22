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
			'on push': function(element) {
				element.tween('background-color', ['#cfe773', '#f3f1f1']);
			}
		});

		value_of(Class.type(Name)).should_be_true();
		value_of(MooJoe.Class.type(Name)).should_be_true();
	},

	'Complex Mapping Class': function() {
		Person = new MooJoe.Class({
			name: ['.name', Name],
/*			gender: ['', 'class', function(classes) {
				classes = classes.split(' ');
				return classes.link({ gender: function(text) {
					return ['male', 'female'].contains(text);
				}}).gender;
			}],
*/			age: ['.age', Number],
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
			},
			'on set birthday': function(birthday) {
				birthday = new Date(birthday);

				var now = new Date('Sep 1, 2008');
				var age = now.getYear() - birthday.getYear();

				if(now.getMonth() < birthday.getMonth() || (
					now.getMonth() == birthday.getMonth() &&
					now.getDate() < birthday.getDate()
				)) age --;

				this.set('age', age);
			},
			'on attach': function(element) {
				element.tween('background-color', ['#d2e0e6', '#f3f1f1']);
			},
			'on push': function(element) {
				element.tween('background-color', ['#cfe773', '#f3f1f1']);
			}
		});

		Family = new MooJoe.Class({
			head: ['.head .person', Person],
			members: ['.members .person', [Person]],
			'members.joined': ['.members', 'title', Date]
		}, {
			'on attach': function(element) {
				element.tween('background-color', ['#d2e0e6', '#f3f1f1']);
			},
			'on push': function(element) {
				element.tween('background-color', ['#cfe773', '#f3f1f1']);
			}
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
/*			gender: {
				selector: '', property: 'class',
				type: function() {}, plural: false
			},
*/			age: {
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
			'on attach': function() {}, 'on push': function() {}
		}));

		value_of(Person.properties).should_be($H({
			older: function() {}, younger: function() {},
			'on set birthday': function() {},
			'on attach': function() {}, 'on push': function() {}
		}));
	}
});

describe('Detached Object', {

	'Create new Object': function() {
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

	'Generate Object': function() {
		attached_name = $$('#names .name')[2].toObject(Name);

		value_of(Name.type(attached_name)).should_be_true();
		value_of(attached_name.isAttached()).should_be_true();
		value_of(attached_name.isEmpty).should_be_false();
	},

	'Mapping Properties': function() {
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

describe('Complex Mapping', {

	'Generate Object': function() {
		person = $('person').toObject(Person);
		value_of(Person.type(person)).should_be_true();
	},

	'Mapping Native type Properties': function() {
		value_of($type(person.get('picture'))).should_be('string');
//		value_of($type(person.get('gender'))).should_be('string');
		value_of($type(person.get('age'))).should_be('number');
		value_of($type(person.get('birthday'))).should_be('date');
	},

	'Mapping Properties instance of MooJoe Class': function() {
		value_of(Name.type(person.get('name'))).should_be_true();
	},

	'Change Property and Synchronize': function() {
		person.set('picture', 'http://me2day.net/images/user/sub/' +
			'profile_20080808154048.png');

		value_of($$('#person img')[0].get('src')).should_be(
			'http://me2day.net/images/user/sub/profile_20080808154048.png'
		);
	},

	'Custom Method': function() {
		person.older();
		value_of(person.get('age')).should_be(19);
		value_of($$('#person .age')[0].get('html')).should_be(19);
	},

	'On Setter Event': function() {
		person.set('birthday', new Date('Dec 30, 1976'));

		value_of(person.get('birthday')).should_be(new Date('Dec 30, 1976'));
		value_of(person.get('age')).should_be(31);
	},

	'Change Property of Object Property': function() {
		person.get('name').set('last', 'Yi');

		value_of(person.get('name').get('last')).should_be('Yi');
		value_of($$('#person .name .last')[0].get('html')).should_be('Yi');
	},

	'Change Object Property': function() {
		person.set('name', new_name);
		value_of(person.get('name')).should_be(new_name);

		new_name.set('first', 'Churchill');
		value_of($$('#person .name .first')[0].get('html'))
			.should_be('Churchill');
	}
});

describe('Array Mapping', {

	'Generate Object': function() {
		family = $('family').toObject(Family);
		value_of(Family.type(family)).should_be_true();
	},

	'Array Property': function() {
		value_of($type(family.get('members'))).should_be('array');
		value_of(Person.type(family.get('members')[0])).should_be_true();
		value_of(family.get('members').get(0))
			.should_be(family.get('members')[0]);
	},


	'Set to Item of Array': function() {
		family.get('members').set(1, new Person(
			new Name('Uma Karuna', 'Thurman'),
			38, new Date(1970, 4, 29),
			'http://tbn0.google.com/images?q=tbn:Oy_wn6aZPnxSVM:' +
			'http://www.hotterbabes.com/celebrities/pictures/UmaThurman/' +
			'nude/uma_thurman_003.jpg'
		));

		value_of(family.get('members')[1].get('name').get('last'))
			.should_be('Thurman');
	},

	'Swap Object Property': function() {
		var head = family.get('head');

		family.set('head', family.get('members')[0]);
		family.get('members').set(0, head);

		value_of(family.get('members')[0].get('name').get('first'))
			.should_be('Johnny');

//		value_of($$('#family .head .first')[0]).should_be('Vanessa');
//		value_of($$('#family .members .first')[0]).should_be('Johnny');
	}
});
