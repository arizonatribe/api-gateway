const uuid = require('uuid/v4');
const faker = require('faker');
const mongoose = require('mongoose');

const { connectionString } = require('./config');
const schema = require('./schema');

async function createStudents() {
  try {
    const db = mongoose.connection;
    const Student = mongoose.model('Student', schema.Student);

    mongoose.connect(connectionString, { useNewUrlParser: true });

    db.on('error', console.error.bind(console, 'Database-seeding connection error!'));
    await db.once('open', () => console.log('ready to seed the database'));

    const LIMIT = +process.env.LIMIT || 500;
    const students = [];

    for (let i = 0; i < LIMIT; i++) {
      const student = new Student({
        _id: uuid(),
        name: faker.name.findName(),
        email: faker.internet.email()
      });
      students.push(student);
    }

    for (const student of students) {
      console.log('Creating:', student);
      await student.save(student);
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

createStudents();
