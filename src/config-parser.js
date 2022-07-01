const faker = require('faker');
const yaml = require('js-yaml');

const FakeYamlType = new yaml.Type('!Fake', {
    kind: 'scalar',
    multi: true,
    representName: function (object) {
      return 'Fake';
    },
    represent: function (object) {
      return object;
    },
    instanceOf: String,
    construct: function (data, type) {
      switch (type) {
        case 'firstName':
          return faker.name.firstName();
          break;
        case 'lastName':
          return faker.name.lastName();
          break;
        case 'fullName':
          return faker.name.findName();
          break;
        case 'companyName':
          return faker.company.companyName();
          break;
        case 'email':
          return faker.internet.email();
          break;
        case 'domainName':
          return faker.internet.domainName();
          break;
        case 'userName':
          return faker.internet.userName();
          break;
        case 'sentence':
          return faker.lorem.sentence();
          break;
        case 'paragraph':
          return faker.lorem.paragraph();
          break;
        case 'pastDate':
          return faker.date.past();
          break;
        case 'futureDate':
          return faker.date.future();
          break;
        case 'streetAddress':
          return faker.address.streetAddress();
          break;
        case 'zipCode':
          return faker.address.zipCode();
          break;
        case 'phoneNumber':
          return faker.phone.phoneNumber();
          break;
        default:
          return faker.company.catchPhrase()
          break;
      };
    }
  });

const FAKE_SCHEMA = yaml.DEFAULT_SCHEMA.extend([FakeYamlType]);
const parse = config => {
  return yaml.load(config, { schema: FAKE_SCHEMA });
};

module.exports.parse = parse;
