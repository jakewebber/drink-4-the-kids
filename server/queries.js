const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

const getOrders = (request, response) => {
    pool.query('SELECT * FROM drink_orders ORDER BY date', (error, result) => {
        if (error) {
            console.error(error);
            throw error
        }
        response.status(200).json(result.rows)
        const results = { 'results': (result) ? result.rows : null};
        res.render('pages/db', results );
        })
  }

const createOrder = (request, response) => {
    let text = 'INSERT INTO drink_orders(name, drink_order, date, status, comments) VALUES ($1, $2, NOW(), \'waiting\', $3) RETURNING id';
    
    pool.query(text, [request.body.name, request.body.drink, request.body.comments], (error, result) => {
      if (error) {
        throw error;
      }
      var id = result.rows[0].id;
      var url = result && result.rows.length > 0 ? '/db#order-' + id : '/db';
      response.redirect(url);
    })
  }

const updateOrderStatus = (request, response) => {
    const { id, status } = request.body

    pool.query(
        'UPDATE drink_orders SET status = $1, WHERE id = $2',
        [name, email, id],
        (error, results) => {
        if (error) {
            throw error;
        }
        response.status(200).send(`User modified with ID: ${id}`);
        }
    )
}

  module.exports = {
      getOrders,
      createOrder,
      updateOrderStatus
  }