
const db = require('./config/connection');
const Questions = require('./Models/Questions');

db.connect(err => {
  if (err) throw err;
  console.log('Database connected.');

  const PromtUser = new Questions;

  PromtUser.promtQuestions();

});


