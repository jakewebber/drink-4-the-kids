const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    },
    multipleStatements: true
  });

const getOrders = (request, response) => {
    pool.query('SELECT * FROM drink_orders2 WHERE is_done = false ORDER BY date DESC', (error, result) => {
        if (error) {
            console.error(error);
            result.send("Error " + err)
        }
        //response.status(200).json(result.rows)
        const results = { 'results': (result) ? result.rows : null};
        response.render('pages/db', results );
    })
  }

  const getOrder = (request, response) => {
    const { id } = request.query
    pool.query('SELECT * FROM drink_orders2 WHERE id = $1 LIMIT 1', [id], (error, result) => {
        if (error) {
            console.error(error);
            result.send("Error " + err)
        }
        //response.status(200).json(result.rows)
        const results = (result && result.rows.length > 0) ? result.rows[0] : null;
        response.status(200).json(results);
    })
  }

  /** Create a drink order.
   * params: name, amount, cost, drinkTitle, comments */
const createOrder = (request, response) => {
  // field from form bots - do nothing
  if(request.body.email || request.body.comments.length > 500) return;

  const { name, amount, drinkCost, drinkTitle, customDrinkTitle, comments} = request.body
  let text = `INSERT INTO drink_orders2(name, amount, cost, drink_title, date, comments, is_paid, is_done) 
              VALUES ($1, $2, $3, $4, NOW(), $5, false, false) 
              RETURNING id`;

  pool.query(text, [name.trim(), parseInt(amount), parseInt(amount * drinkCost), drinkTitle || customDrinkTitle.trim(), comments.trim()], (error, result) => {
    if (error) {
      console.log('error')
      throw error;
    }
    
    // append result ID to url for searching on order page
    var id = result.rows[0].id;
    var url = result && result.rows.length > 0 ? '/db#order-' + id : '/db';
    response.redirect(url);
  })
}

const updatePaid = (request, response) => {
    const { orderId, paidStatus } = request.body
    var isPaid = paidStatus ? 1 : 0;
    pool.query(
        'UPDATE drink_orders2 SET is_paid = $1 WHERE id = $2',
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
      'UPDATE drink_orders2 SET is_done = $1 WHERE id = $2',
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

const closeBarTab = (request, response) => {
  const { barTabName } = request.body

  pool.query(
      `UPDATE drink_orders2 SET is_paid = true WHERE UPPER(name) = UPPER($1) and is_paid = false`,
      [barTabName],
      (error, results) => {
      if (error) {
          throw error;
      }
      var msg = `paid bar tab for ${barTabName}}`;
      console.log(msg)
      response.status(200).send(msg);
      }
  )
}

const addExtraDonation = (request, response) => {
  const { name, amount } = request.body
  pool.query(
      `INSERT INTO extra_donations (name, amount, date)
      SELECT $1, $2, NOW()`,
      [name, amount],
      (error, results) => {
      if (error) {
          throw error;
      }
      var msg = `added donation amount ${amount} to ${name}`;
      console.log(msg)
      response.status(200).send(msg);
      }
  )
}



const getNames = (request, response) => {
  pool.query(
      `SELECT name FROM orders_by_name`,
      (error, result) => {
        if (error) {
            throw error;
        }
        response.status(200).json(result.rows);
      }
  )
}


const getOrdersAdmin = async (request, response) => {
  pool.query('SELECT * FROM drink_orders2 WHERE is_paid = false or is_done = false ORDER BY date DESC', (error, result) => {
      if (error) {
          console.error(error);
          result.send("Error " + err)
      }
      const results = { 'results': (result) ? result.rows : null};
      response.render('pages/admin', results );
  })
}

const getGroupedOrders = async (request, response, page) => {
  pool.query('SELECT * FROM totals_by_name ORDER BY unpaid_cost DESC', (error, result) => {
      if (error) {
          console.error(error);
          res.send("Error " + err)
      }
      const results = { 'results': (result) ? result.rows : null};
      response.render(`pages/${page}`, results );
  })
}

const getUserBarTab = async (request, response, page) => {
  const { name } = request.query
  pool.query(`SELECT SUM(amount) AS total_amount, SUM(cost) as total_cost, name 
              FROM drink_orders2 WHERE is_paid = false AND name = $1 
              GROUP BY name`, [name], (error, result) => {
      if (error) {
          console.error(error);
          res.send("Error " + err)
      }
      response.status(200).json(result.rows[0]);
  })
}

const getGroupedOrdersByDonated = async (request, response, page) => {
  pool.query('SELECT * FROM totals_by_name ORDER BY total_donated DESC', (error, result) => {
      if (error) {
          console.error(error);
          res.send("Error " + err)
      }
      const results = { 'results': (result) ? result.rows : null};
      response.render(`pages/${page}`, results );
  })
}

  module.exports = {
      getOrders,
      getOrder,
      getNames,
      createOrder,
      updatePaid,
      updateDone,
      addExtraDonation,
      closeBarTab,
      getUserBarTab,
      getOrdersAdmin,
      getGroupedOrders,
      getGroupedOrdersByDonated
  }