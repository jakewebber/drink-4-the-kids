const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

const getOrders = (request, response) => {
    pool.query('SELECT * FROM drink_orders WHERE is_done != true ORDER BY date DESC', (error) => {
        if (error) {
            console.error(error);
            res.send("Error " + err)
        }
        response.status(200).json(result.rows)
        const results = { 'results': (result) ? result.rows : null};
        res.render('pages/db', results );
    })
  }

const createOrder = (request, response) => {
    let text = 'INSERT INTO drink_orders(name, drink_order, date, comments, is_paid, is_done) VALUES ($1, $2, NOW(), $3, false, false) RETURNING id';
    
    pool.query(text, [request.body.name, request.body.drink, request.body.comments], (error, result) => {
      if (error) {
        console.log('error')
        throw error;
      }
      var id = result.rows[0].id;
      var url = result && result.rows.length > 0 ? '/db#order-' + id : '/db';
      response.redirect(url);
    })
  }

const updatePaid = (request, response) => {
    const { orderId, paidStatus } = request.body
    var isPaid = paidStatus ? 1 : 0;
    pool.query(
        'UPDATE drink_orders SET is_paid = $1 WHERE id = $2',
        [isPaid, orderId],
        (error, results) => {
        if (error) {
            throw error;
        }
        var msg = `updated order ID: ${orderId} to ${isPaid}`;
        console.log(msg)
        response.status(200).send(msg);
        }
    )
}

const updateDone = (request, response) => {
  const { orderId, doneStatus } = request.body
  var isDone = doneStatus ? 1 : 0;
  pool.query(
      'UPDATE drink_orders SET is_done = $1 WHERE id = $2',
      [isDone, orderId],
      (error, results) => {
      if (error) {
          throw error;
      }
      var msg = `updated order ID: ${orderId} to ${isDone}`;
      console.log(msg)
      response.status(200).send(msg);
      }
  )
}


const getOrdersAdmin = async (request, response) => {
  pool.query('SELECT * FROM drink_orders ORDER BY date DESC', (error, result) => {
      if (error) {
          console.error(error);
          res.send("Error " + err)
      }
      const results = { 'results': (result) ? result.rows : null};
      response.render('pages/admin', results );
  })
}

  module.exports = {
      getOrders,
      createOrder,
      updatePaid,
      updateDone,
      getOrdersAdmin
  }