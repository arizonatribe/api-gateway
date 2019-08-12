const uuid = require('uuid/v4');
const express = require('express');
const mongoose = require('mongoose');
const schema = require('./schema');

const DB_CONNECTION_STATES = [
  'disconnected',
  'connected',
  'connecting',
  'disconnecting'
];

function createRoutes(connectionString) {
  const db = mongoose.connection;
  const Student = mongoose.model('Student', schema.Student);

  if (!connectionString) {
    throw new Error('The MongoDB connection string must be provided');
  }

  mongoose.connect(connectionString, { useNewUrlParser: true });

  db.on('error', console.error.bind(console, 'Database connection error!'));
  db.once('open', () => console.log('successfully connected to the database'));

  return express.Router()
    .get('/healthcheck', (req, res, next) => {
      res.status(200).send({
        success: true,
        message: `API is up and database is ${
          DB_CONNECTION_STATES[mongoose.connection.readyState]
        }`
      });
    })
    .get('/students', (req, res, next) => {
      Student.find((err, students) => {
        if (err) {
          res.status(500).send({
            success: false,
            message: err
          });
        } else {
          res.status(200).send({
            success: true,
            students
          });
        }
      });
    })
    .get('/students/:id', (req, res, next) => {
      const id = req.params.id;

      if (!id) {
        res.status(401).send({
          success: false,
          message: 'The student id is required!'
        });
      } else {
        Student.findById(id, (err, student) => {
          if (err) {
            res.status(500).send({
              success: false,
              message: err
            });
          } else {
            res.status(200).send({
              success: true,
              student
            });
          }
        });
      }
    })
    .post('/students/:id', (req, res, next) => {
      const id = req.params.id;

      if (!id) {
        res.status(401).send({
          success: false,
          message: 'The student id is required!'
        });
      } else {
        const { name, email } = req.body;

        const student = {
          name: name,
          email: email
        };

        Student.findByIdAndUpdate(id, student, { new: true }, (err, data) => {
          if (err) {
            res.status(500).send({
              success: false,
              message: err
            });
          } else {
            res.status(200).send({
              success: true,
              student: data,
              message: `Successfully updated the record for student ${id}`
            });
          }
        });
      }
    })
    .post('/students', async (req, res, next) => {
      const { name, email } = req.body;

      if (!name) {
        res.status(401).send({
          success: false,
          message: 'The student\'s name is required'
        });
      } else if (!email) {
        res.status(401).send({
          success: false,
          message: 'The student\'s email address is required'
        });
      } else {
        const student = new Student();

        student.name = name;
        student.email = email;

        try {
          const result = await student.save();
          res.status(200).send({
            success: true,
            message: `New student "${name}" created successfully`,
            student: result
          });
        } catch (err) {
          res.status(500).send({
            success: false,
            message: err
          });
        }
      }
    })
    .delete('/students/:id', (req, res, next) => {
      const id = req.params.id;

      if (!id) {
        res.status(401).send({
          success: false,
          message: 'The student id is required!'
        });
      } else {
        Student.findByIdAndRemove(id, err => {
          if (err) {
            res.status(500).send({
              success: false,
              message: err
            });
          } else {
            res.status(200).send({
              success: true,
              message: `The record for student ${id} was successfully removed`
            });
          }
        });
      }
    });
}

module.exports = createRoutes;
