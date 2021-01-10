const supertest = require("supertest");
const should = require("should");

const server = supertest.agent("http://34.123.190.106");

describe("Auth unit test",function(){
    it("Auth",function(done){
      server
      .post('/auth-service/auth')
      .send({userId : 'admin2', password : ''})
      .expect(403)
      .end(function(err,res){
        res.status.should.equal(403);
        done();
      });
    });
  
  });