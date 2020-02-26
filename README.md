# infobubble-modern

Infobubble component module for Google Maps replacement without building proccess, es2015 compliant. It export the native class instead a built component oriented to be included in a widget.

## Getting Started

### Configuration

| Variable | Type | Default |
|--|--|--|
| closeSrc | string | 'https://maps.gstatic.com/intl/en_us/mapfiles/iw_close.gif' |
| arrowSize | number | 15 |
| arrowStyle | number | 0 |
| shadowStyle | number | 1  
| minWidth | number | 50 |
| arrowPosition | number | 50 |
| padding | number | 10 |
| borderWidth | number | 1 |
| borderColor | string | '#ccc' |
| borderRadius | number | 10 |
| backgroundColor | string | '#fff' |
| disableAutoPan | boolean | false |
| disableAnimation | boolean | false, |

## Running the tests

`npm test`

### Code quality, linters and styling

Controlled by **Eslint**, based in the `eslint:recommended` preset and including the `babel-eslint` parser. Also we control the code quality via **SonarQube**, included in the CI workflow.

SonarQube reports could be found [here](https://sonarqube.ed-integrations.com/dashboard?id=uefa:mobile-backend).

## Deployment

The preferred deployment are **Google Cloud**, so we have prepared all for this deployment system through **App Engine**. Our **Jenkins** is the main actor in the deployment system, that includes de deployment, tests and code quality.

## Use

The endpoints and use is detailed at the [API Docs (Swagger style)](http://mobile-services-dot-uefa-mobility-companion.appspot.com/api-docs/). 

## Built With

* [Express](https://expressjs.com/) - The web framework used
* [Jenkins](https://jenkins.io/) - CI system
* [@google/maps](https://www.npmjs.com/package/@google/maps) - Google Maps Client 
* [Sequelize](https://sequelize.org/) - Agnostic SQL Database ORM

## Contributing

Please read CONTRIBUTING.md for details on our responsabilities, and the process for submitting pull requests.

## Versioning

We use a kind of [SemVer](http://semver.org/) for versioning. 
The major corresponds for the version of the product, the minor gives your the sprint number of that version, the patch is the number of the corrections given to the client over that dist version. Imagine that you are in the first phase of a product, second sprint and three delivered versions: 

 - if you are in the first phase, the number will be 0, because in a first phase there aren't any final product version.
 - if you are in the second sprint, the number will be 2.
 - if you delivered three versions, the number will be 3.

So the tag of that version will  0.2.3.

For the versions available, see the [tags on this repository](https://github.com/Emergya/uefa-mobility-cms-src/tags). 

## Team

The contributions at the project could be seen [here](https://github.com/Emergya/uefa-mobility-cms-src/graphs/contributors).

- **Product Owner**: Mercedes Jiménez (mjimenez@emergya.com)
- **Software Architect**: Jesús R Peinado (jpeinado@emergya.com) [jesusr](https://github.com/jesusr)
- **QA**: Alberto Garrido (agarrido@emergya.com) [agarpac](https://github.com/agarpac)
