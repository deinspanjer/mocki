const { expect } = require('chai');
const configParser = require('../src/config-parser');
const logger = require("../src/logger");

describe('config parser unit tests', () => {
  it('should parse simple configuration', () => {
    const simpleConfig = `
    name: mocki
    port: 3000
    endpoints:
        - path: /
          method: get
          responses:
            - statusCode: 200
              headers:
                - name: content-type
                  value: application/json
              body:
                message: Hello World!`;
    const result = configParser.parse(simpleConfig);
    expect(result).to.be.an('object');
    expect(result.name).to.equal('mocki');
    expect(result.port).to.equal(3000);
    expect(result.endpoints).to.be.an('array');
  });

  it('should parse configuration with fakes', () => {
    const fakeConfig = `
    name: mocki
    port: 3000
    endpoints:
        - path: /
          method: get
          responses:
            - statusCode: 200
              headers:
                - name: content-type
                  value: application/json
              body:
                company: !Fake companyName
                firstName: !Fake firstName
                lastName: !Fake lastName
                fullName: !Fake fullName
                companyName: !Fake companyName
                email: !Fake email
                domainName: !Fake domainName
                userName: !Fake userName
                sentence: !Fake sentence
                paragraph: !Fake paragraph
                pastDate: !Fake pastDate
                futureDate: !Fake futureDate
                streetAddress: !Fake streetAddress
                zipCode: !Fake zipCode
                phoneNumber: !Fake phoneNumber`;
    const result = configParser.parse(fakeConfig);
    expect(result).to.be.an('object');
    expect(result.name).to.equal('mocki');
    expect(result.port).to.equal(3000);
    expect(result.endpoints).to.be.an('array');
    expect(result.endpoints[0].responses[0].body.company).to.be.a('string');
    expect(result.endpoints[0].responses[0].body.company).to.not.contain(
      '!Fake'
    );
  });

  it('should parse configuration with files', () => {
    const fileConfig = `
    name: mocki
    port: 3000
    endpoints:
        - path: /
          method: get
          responses:
            - statusCode: 200
              headers:
                - name: content-type
                  value: application/json
              body: !File ${__dirname}/json/body.json`;
    const result = configParser.parse(fileConfig);
    expect(result).to.be.an('object');
    expect(result.name).to.equal('mocki');
    expect(result.port).to.equal(3000);
    expect(result.endpoints).to.be.an('array');
    expect(result.endpoints[0].responses[0].body.company).to.be.a('string').equal('Acme Company');
    expect(result.endpoints[0].responses[0].body).not.to.be.a('string');
    expect(result.endpoints[0].responses[0].body).to.be.an('object');
    expect(result.endpoints[0].responses[0].body).to.have.property('company');
    expect(result.endpoints[0].responses[0].body).to.not.have.property('middleName');
  });

  it('should fail to parse configuration with files that don\'t exist', () => {
    const fileConfig = `
    name: mocki
    port: 3000
    endpoints:
        - path: /
          method: get
          responses:
            - statusCode: 200
              headers:
                - name: content-type
                  value: application/json
              body: !File ${__dirname}/json/body-bad-json-non-existent.json`;

    expect(function() {
      configParser.parse(fileConfig);
    }).to.throw(`ENOENT: no such file or directory, open '${__dirname}/json/body-bad-json-non-existent.json'`);
  });

  it('should parse configuration with files even if that file only contains {}', () => {
    const fileConfig = `
    name: mocki
    port: 3000
    endpoints:
        - path: /
          method: get
          responses:
            - statusCode: 200
              headers:
                - name: content-type
                  value: application/json
              body: !File ${__dirname}/json/body-empty-object.json`;
    const result = configParser.parse(fileConfig);
    expect(result).to.be.an('object');
    expect(result.name).to.equal('mocki');
    expect(result.port).to.equal(3000);
    expect(result.endpoints).to.be.an('array');
    expect(result.endpoints[0].responses[0].body).to.not.have.property('company');
    expect(result.endpoints[0].responses[0].body).to.be.a('object').and.to.not.have.any.members;
  });

  it('should fail to parse configuration with files if a file contains invalid json', () => {
    const fileConfig = `
    name: mocki
    port: 3000
    endpoints:
        - path: /
          method: get
          responses:
            - statusCode: 200
              headers:
                - name: content-type
                  value: application/json
              body: !File ${__dirname}/json/body-bad-json.json`;

    expect(function(){
      configParser.parse(fileConfig);
    }).to.throw(SyntaxError)
  });
});
