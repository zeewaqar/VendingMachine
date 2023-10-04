const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../src/index'); // Your Express app's entry point
const expect = chai.expect;

chai.use(chaiHttp);
chai.should();

let token; // to store the token after login
let sellerToken;
let productId;

describe('API Tests', function () {

    // Before running the tests, simulate a login to get the token
    before((done) => {
        chai.request(server)
            .post('/user/login') // Assuming this is your login endpoint
            .send({ username: 'test', password: '123456' }) // Replace with your test user's credentials
            .end((err, res) => {
                token = res.body.token; // Store the token for later use
                done();
            });
    });
    describe('/POST login', () => {
        it('it should login a seller and get token', (done) => {
            chai.request(server)
                .post('/user/login')
                .send({
                    username: 'testSeller', // replace with a valid seller username
                    password: '123456'  // replace with a valid seller password
                })
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an('object');
                    expect(res.body).to.have.property('token');
                    sellerToken = res.body.token; // Store the token for future tests
                    done();
                });
        });
    });

    // Test for /deposit
    // Test for /deposit
    describe('/POST deposit', () => {

        // Test for depositing a valid amount
        it('it should deposit amount for buyer', (done) => {
            console.log("Inside /deposit route");
            console.log(token)
            chai.request(server)
                .post('/deposit')
                .set('Authorization', `Bearer ${token}`) // Assuming token is for a buyer
                .send({ amount: 50 }) // Valid deposit amount
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an('object');
                    expect(res.body).to.have.property('deposit').eql(50);
                    done();
                });
        });

        // Test for depositing an invalid coin denomination
        it('it should not deposit an invalid coin denomination', (done) => {
            chai.request(server)
                .post('/deposit')
                .set('Authorization', `Bearer ${token}`) // Assuming token is for a buyer
                .send({ amount: 15 }) // Invalid deposit amount
                .end((err, res) => {
                    expect(res).to.have.status(400);
                    expect(res.body).to.be.an('object');
                    expect(res.body).to.have.property('error').eql('Invalid coin denomination.');
                    done();
                });
        });

        // Test for a user role that isn't a buyer trying to deposit
        it('it should not allow non-buyers to deposit', (done) => {
            chai.request(server)
                .post('/deposit')
                .set('Authorization', `Bearer ${sellerToken}`) // Assuming nonBuyerToken is for a non-buyer
                .send({ amount: 50 }) // Example deposit amount
                .end((err, res) => {
                    expect(res).to.have.status(403);
                    expect(res.body).to.be.an('object');
                    expect(res.body).to.have.property('error').eql('Only buyers can deposit coins.');
                    done();
                });
        });

    });

    // Test for /buy
    describe('/POST buy', () => {
        it('it should allow buyer to buy a product and return correct change', (done) => {
            // Assuming you have a product ID for testing
            const productId = '651c223d52479d4532b2d44e'; // Replace with an actual product ID from your database
            chai.request(server)
                .post('/buy')
                .set('Authorization', `Bearer ${token}`) // Use the token obtained from the login simulation
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
                    // Add more assertions based on expected change and other response properties
                    done();
                });
        });
    });


    // Test for /reset
    describe('/POST reset', () => {
        it('it should reset the deposit for buyer', (done) => {
            chai.request(server)
                .post('/reset')
                .set('Authorization', `Bearer ${token}`) // Assuming token is for a buyer
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
                .set('Authorization', `Bearer ${sellerToken}`) // Assuming token is for a non-buyer
                .end((err, res) => {
                    expect(res).to.have.status(403);
                    expect(res.body).to.be.an('object');
                    expect(res.body).to.have.property('error').eql('Only buyers can reset their deposit.');
                    done();
                });
        });
    });

    // CREATE: POST /product
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
                    productId = res.body._id; // Store the product ID for future tests
                    done();
                });
        });
    });

    // READ: GET /product/:id
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

    // UPDATE: PUT /product/:id
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

    // DELETE: DELETE /product/:id
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
