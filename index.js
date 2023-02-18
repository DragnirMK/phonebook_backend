const express = require('express')
var morgan = require('morgan')
var cors = require('cors')
const Person = require('./models/person')

const app = express()

app.use(express.static('build'))
app.use(express.json())

morgan.token('body', req => JSON.stringify(req.body || {}))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

app.use(cors())

app.get('/api/persons', (request, response, next) => {
  Person
    .find({}).then(persons => {
      response.json(persons)
    })
    .catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
  const person = request.body
  if (person.name === '' || person.number === '') {
    response.status(400).json({ 'error': 'name or number cannot be empty' }).end()
  }

  Person.find({ name: person.name })
    .then(p => {
      if (p.length > 0) {
        response.status(400).json({ 'error': 'name already in phonebook' }).end()
      }
    })
    .catch(error => next(error))

  const newPerson = new Person({
    name: person.name,
    number: person.number
  })

  newPerson.save()
    .then(() => {
      response.json(newPerson)
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(person => {
      if (person) {
        response.status(204).end()
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const person = request.body

  const newPerson = {
    name: person.name,
    number: person.number
  }

  Person.findByIdAndUpdate(request.params.id, newPerson, { new: true, runValidators: true, context: 'query' })
    .then(updatedNote => {
      response.json(updatedNote)
    })
    .catch(error => next(error))
})

app.get('/info', (request, response, next) => {
  Person
    .find({})
    .then(result => {
      let date = new Date()
      response.send(`<p>Phonebook has info for ${result.length} people</p> <p>${date}</p>`)
    })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

// handler of requests with unknown endpoint
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }

  if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error.response.data.erro)
}

// this has to be the last loaded middleware.
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
