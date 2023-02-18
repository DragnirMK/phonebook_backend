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

app.get('/api/persons', (request, response) => {
  Person.find({}).then(p => {
    if (p) {
      response.json(p)
    } else {
      response.status(404).end()
    }
  })
  .catch(error => {
    response.status(500).end()
  })
})

app.get('/api/persons/:id', (request, response) => {
  Person.findById(request.params.id).then(person => {
    response.json(person)
  })
})

app.post('/api/persons', (request, response) => {
  const person = request.body
  if (person.name === '' || person.number === '') {
    response.status(400).json({ 'error': 'name or number cannot be empty' }).end()
  }

  Person.find({name: person.name}).then(p => {
    if (p.length > 0) {
      response.status(400).json({ 'error': 'name already in phonebook' }).end()
    }
  })

  let newPerson = new Person({
    name: person.name,
    number: person.number
  })

  newPerson.save().then(savedPerson => {
    response.json(newPerson)
  })
})

app.delete('/api/persons/:id', (request, response) => {
  Person.findByIdAndRemove(request.params.id).then(person => {
    response.status(204).end()
  })
})

app.get('/info', (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/plain' })
  response.write("Phonebook has info for " + Person.length + " people. \n")
  response.end(Date())
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
