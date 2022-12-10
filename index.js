const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000
const db = require('./server/queries')
const bodyParser = require('body-parser');


const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

express()
  .use(bodyParser.urlencoded({extended: false}))
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/about'))
  .get('/menu', (req, res) => res.render('pages/menu'))
  .get('/order', (req, res) => res.render('pages/order'))
  .get('/charity', (req, res) => res.render('pages/charity'))
  .get('/faq', (req, res) => res.render('pages/faq'))
  .get('/admin', (req, res) => db.getOrdersAdmin(req, res))
  .get('/admintab', (req, res) => db.getGroupedOrders(req, res, 'admintab'))
  .get('/jumbotron', (req, res) => db.getGroupedOrdersByDonated(req, res, 'jumbotron'))
  .get('/getNames', (req, res) => db.getNames(req, res))
  .get('/getUserBarTab', (req, res) => db.getUserBarTab(req, res))
  .get('/db', async (req, res) => {
    try {
      const client = await pool.connect();
      const result = await client.query('SELECT * FROM drink_orders2 WHERE is_done != true ORDER BY date DESC');
      const results = { 'results': (result) ? result.rows : null};
      res.render('pages/db', results );
      client.release();
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  })
  .post('/send', (req, res) => {
    db.createOrder(req, res);
    console.log(req);
    console.log(db);
  })
  .post('/updatePaid', (req, res) => db.updatePaid(req, res))
  .post('/updateDone', (req, res) => db.updateDone(req, res))
  .post('/closeBarTab', (req, res) => db.closeBarTab(req, res))
  .post('/addExtraDonation', (req, res) => db.addExtraDonation(req, res))


  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
