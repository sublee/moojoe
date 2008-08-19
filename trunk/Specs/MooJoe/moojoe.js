//var Name, names, Person, person;

describe('DefineClass', {

	'should define new class': function() {
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
	}
});

describe('DetachedObject', {

	'should return detached object': function() {
		new_name = new Name('Dachimawa', 'Lee');
		value_of(new_name.isAttached()).should_be_false();

		value_of(new_name.get('first')).should_be('Dachimawa');
		value_of(new_name.get('last')).should_be('Lee');
	},

	'should call getter': function() {
		value_of(new_name.get('korean name')).should_be('Lee, Dachimawa');
		value_of(new_name.get('english name')).should_be('Dachimawa Lee');
	}
});

describe('AttachedObject', {

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
	}
});
