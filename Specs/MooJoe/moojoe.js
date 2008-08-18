var Name, names, Person, person;

describe('SimpleMapping', {

	'should define new class': function() {
		Name = new MooJoe.Class({
			first: '.first',
			last: '.last'
		});

		value_of($type(Name)).should_be('class');
	},

	'should return mapped object': function() {
		names = $$('#names p.name').toObject(Name);

		value_of(names.length).should_be($('names').getChildren().length);
	},

	'should return property': function() {
		value_of(names[0].first).should_be('Heungsub');
		value_of(names[0].get('first')).should_be(names[0].first);

		value_of(names[0].get('first')).should_be('Heungsub');
		value_of(names[0].get('last')).should_be('Lee');

		value_of(names[1].get('first')).should_be('Chaeyeong');
		value_of(names[1].get('last')).should_be('Han');
	},

	'should change property': function() {
		names[0].set('first', 'Jocker');
		value_of(names[0].get('first')).should_be('Jocker');
	},

	'should change dom at called setter': function() {
		value_of(names[0].element.getElement('.last').get('html'))
			.should_be('Lee');

		names[0].set('last', 'Hamster');

		value_of(names[0].element.getElement('.last').get('html'))
			.should_be('Hamster');
	}
});

describe('ComplexMapping', {

	'before all': function() {
		Person = new MooJoe.Class({
			name: ['.name', Name],
			age: ['.age', Number, 'html'],
			birthday: ['.age', 'title', Date],
			picture: ['.picture', String, 'src']
		});

		person = $('person').toObject(Person);
	},

	'should return property': function() {
		value_of(person.get('age')).should_be(18);
		value_of($type(person.get('age'))).should_be('number');

		value_of(person.get('picture')).should_be('heungsub.png');
		value_of(person.get('picture')).should_not_be('');
	},

	'should return property as object': function() {
		value_of($type(person.get('birthday'))).should_be('date');

		x = person.get('birthday');

		value_of(person.get('birthday').getYear()).should_be(89);
		value_of(person.get('birthday').getMonth()).should_be(12 - 1);
		value_of(person.get('birthday').getDate()).should_be(12);

		value_of(person.get('name').constructor).should_be(Name);
		value_of(person.get('name').get('first')).should_be('Heungsub');
		value_of(person.get('name').get('last')).should_be('Lee');

		person.get('name').set('last', 'Kim');

		value_of(person.get('name').get('last')).should_be('Kim');
	}
});
