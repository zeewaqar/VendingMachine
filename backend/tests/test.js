const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../src/index'); 
const expect = chai.expect;

chai.use(chaiHttp);
chai.should();

let token; 
let sellerToken;
let productId;

describe('API Tests', function () {

    before((done) => {
        chai.request(server)
            .post('/user/login') 
            .send({ username: 'test', password: '123456' }) 
            .end((err, res) => {
                token = res.body.token; 
                done();
            });
    });
    describe('/POST login', () => {
        it('it should login a seller and get token', (done) => {
            chai.request(server)
                .post('/user/login')
                .send({
                    username: 'testSeller',
                    password: '123456'  
                })
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an('object');
                    expect(res.body).to.have.property('token');
                    sellerToken = res.body.token; 
                    done();
                });
        });
    });


    describe('/POST deposit', () => {

        it('it should deposit amount for buyer', (done) => {
            console.log("Inside /deposit route");
            console.log(token)
            chai.request(server)
                .post('/deposit')
                .set('Authorization', `Bearer ${token}`) 
                .send({ amount: 50 }) 
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an('object');
                    expect(res.body).to.have.property('deposit').eql(50);
                    done();
                });
        });

        it('it should not deposit an invalid coin denomination', (done) => {
            chai.request(server)
                .post('/deposit')
                .set('Authorization', `Bearer ${token}`) 
                .send({ amount: 15 }) 
                .end((err, res) => {
                    expect(res).to.have.status(400);
                    expect(res.body).to.be.an('object');
                    expect(res.body).to.have.property('error').eql('Invalid coin denomination.');
                    done();
                });
        });

        it('it should not allow non-buyers to deposit', (done) => {
            chai.request(server)
                .post('/deposit')
                .set('Authorization', `Bearer ${sellerToken}`) 
                .send({ amount: 50 })
                .end((err, res) => {
                    expect(res).to.have.status(403);
                    expect(res.body).to.be.an('object');
                    expect(res.body).to.have.property('error').eql('Only buyers can deposit coins.');
                    done();
                });
        });

    });

    describe('/POST buy', () => {
        it('it should allow buyer to buy a product and return correct change', (done) => {

            const productId = '651c223d52479d4532b2d44e'; 
            chai.request(server)
                .post('/buy')
                .set('Authorization', `Bearer ${token}`) 
                .send({ productId: productId, quantity: 1 })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('message').eql('Purchase successful');
                    res.body.should.have.property('spent').which.is.a('number');
                    res.body.should.have.property('productsPurchased').which.is.a('object');
                    res.body.productsPurchased.should.have.property('productName');
                    res.body.productsPurchased.should.have.property('amountPurchased').eql(1);
                    res.body.should.have.property('change').be.a('array');
                    res.body.should.have.property('remainingDeposit').which.is.a('number');
                    done();
                });
        });
    });


    describe('/POST reset', () => {
        it('it should reset the deposit for buyer', (done) => {
            chai.request(server)
                .post('/reset')
                .set('Authorization', `Bearer ${token}`) 
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an('object');
                    expect(res.body).to.have.property('deposit').eql(0);
                    done();
                });
        });

        it('it should not allow non-buyers to reset deposit', (done) => {
            chai.request(server)
                .post('/reset')
                .set('Authorization', `Bearer ${sellerToken}`) 
                .end((err, res) => {
                    expect(res).to.have.status(403);
                    expect(res.body).to.be.an('object');
                    expect(res.body).to.have.property('error').eql('Only buyers can reset their deposit.');
                    done();
                });
        });
    });

    describe('/POST product', () => {
        it('it should create a new product', (done) => {
            const product = {
                productName: 'Test Product',
                cost: 100,
                amountAvailable: 10
            };
            chai.request(server)
                .post('/product')
                .set('Authorization', `Bearer ${sellerToken}`)
                .send(product)
                .end((err, res) => {
                    expect(res).to.have.status(201);
                    expect(res.body).to.be.an('object');
                    expect(res.body).to.have.property('productName').eql('Test Product');
                    productId = res.body._id; 
                    done();
                });
        });
    });

    describe('/GET product/:id', () => {
        it('it should GET a product by the given id', (done) => {
            chai.request(server)
                .get('/product/' + productId)
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an('object');
                    expect(res.body).to.have.property('productName').eql('Test Product');
                    done();
                });
        });
    });

    describe('/PUT product/:id', () => {
        it('it should update the product details', (done) => {
            const updatedProduct = {
                productName: 'Updated Product Name'
            };
            chai.request(server)
                .put('/product/' + productId)
                .set('Authorization', `Bearer ${sellerToken}`)
                .send(updatedProduct)
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an('object');
                    expect(res.body).to.have.property('productName').eql('Updated Product Name');
                    done();
                });
        });
    });

    describe('/DELETE product/:id', () => {
        it('it should DELETE the product', (done) => {
            chai.request(server)
                .delete('/product/' + productId)
                .set('Authorization', `Bearer ${sellerToken}`)
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an('object');
                    expect(res.body).to.have.property('productName').eql('Updated Product Name');
                    done();
                });
        });
    });

});
