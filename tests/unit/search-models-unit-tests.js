const Clarifai = require('./../../src');
const {BASE_URL, SAMPLE_API_KEY} = require('./helpers');
const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');
const {errorHandler} = require('../integration/helpers');

let app;

let mock;

describe('Unit Tests - Model Search', () => {
  beforeAll(() => {
    app = new Clarifai.App({
      apiKey: SAMPLE_API_KEY,
      apiEndpoint: BASE_URL
    });
  });

  beforeEach(() => {
    mock = new MockAdapter(axios);
  });

  it('Search models by name', done => {
    mock.onPost(BASE_URL + '/v2/models/searches').reply(200, JSON.parse(`
{
    "status": {
        "code": 10000,
        "description": "Ok",
        "req_id": "08e649a6116f4f56992e1676b25dcde6"
    },
    "models": [
        {
            "id": "@modelID",
            "name": "moderation",
            "created_at": "2017-05-12T21:28:00.471607Z",
            "app_id": "main",
            "output_info": {
                "message": "Show output_info with: GET /models/{model_id}/output_info",
                "type": "concept",
                "type_ext": "concept"
            },
            "model_version": {
                "id": "@modelVersionID",
                "created_at": "2017-10-26T20:29:09.263232Z",
                "status": {
                    "code": 21100,
                    "description": "Model is trained and ready"
                },
                "active_concept_count": 5,
                "worker_id": "8b7c05a25ce04d0490367390665f1526"
            },
            "display_name": "Moderation"
        }
    ]
}
    `));


    app.models.search("moderation*")
      .then(models => {
        expect(mock.history.post.length).toBe(1);
        expect(JSON.parse(mock.history.post[0].data)).toEqual(JSON.parse(`
{
  "model_query": {
    "name": "moderation*",
    "type": null
  }
}
        `));

        expect(models[0].id).toEqual('@modelID');
        expect(models[0].modelVersion.id).toEqual('@modelVersionID');

        done();
      })
      .catch(errorHandler.bind(done));
  });

  it('Search models by name and type', done => {
    mock.onPost(BASE_URL + '/v2/models/searches').reply(200, JSON.parse(`
{
  "status": {
    "code": 10000,
    "description": "Ok",
    "req_id": "300ceac8704748a592da50d77ad44253"
  },

  "models": [{
    "id": "@modelID",
    "name": "color",
    "created_at": "2017-03-06T22:57:00.660603Z",
    "app_id": "main",
    "output_info": {
      "message": "Show output_info with: GET /models/{model_id}/output_info",
      "type": "blur",
      "type_ext": "color"
    },
    "model_version": {
      "id": "@modelVersionID",
      "created_at": "2017-03-06T22:57:00.684652Z",
      "status": {
        "code": 21100,
        "description": "Model trained successfully"
      }
    },
    "display_name": "Color"
  }]
}
    `));


    app.models.search("*", "color")
      .then(models => {
        expect(mock.history.post.length).toBe(1);
        expect(JSON.parse(mock.history.post[0].data)).toEqual(JSON.parse(`
{
  "model_query": {
    "name": "*",
    "type": "color"
  }
}
        `));

        expect(models[0].id).toEqual('@modelID');
        expect(models[0].modelVersion.id).toEqual('@modelVersionID');

        done();
      })
      .catch(errorHandler.bind(done));
  });

});
