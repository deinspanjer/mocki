const faker = require('faker');
const yaml = require('js-yaml');
const fs = require('fs');
const logger = require("./logger");

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
    construct: function (type, kind) {
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
      }
    }
  });

const FileYamlType = new yaml.Type('!File', {
  kind: 'scalar',
  multi: true,
  representName: function (object) {
    return 'File Contents';
  },
  represent: function (object) {
    return object;
  },
  instanceOf: String,
  construct: function (filepath, kind) {
    try {
      let importFile = fs.readFileSync(filepath, 'utf8');
      return JSON.parse(importFile);
    } catch (err) {
      if (err.code === 'ENOENT') {
        console.log('File not found!');
        logger.error(`Error: Failed to read file ${filepath}`);
      } else if (err instanceof SyntaxError) {
        logger.error(`Error: Unable to parse json in ${filepath}`);
      } else if (err instanceof yaml.YAMLException) {
        logger.error(`Error: Unable to parse json in ${filepath} to yaml`);
      } else {
        logger.error(`Error: Some other error occurred.`);
      }
      throw err;
    }
  }
});

const FILE_FAKE_SCHEMA = yaml.DEFAULT_SCHEMA.extend([FakeYamlType, FileYamlType]);
const parse = config => {
  return yaml.load(config, { schema: FILE_FAKE_SCHEMA });
};

module.exports.parse = parse;
