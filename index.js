const express = require('express')
var morgan = require('morgan')
var cors = require('cors')

const app = express()

app.use(express.static('build'))

app.use(express.json())

morgan.token('body', req => JSON.stringify(req.body || {}))

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

app.use(cors())

var persons = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get('/api/persons', (request, response) => {
    response.send(persons)
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)

    if (person) {
        response.send(person)
    } else {
        response.status(404).end()
    }
})

app.post('/api/persons', (request, response) => {
  const person = request.body
  if (person.name === '' || person.number === '') {
    response.status(400).json({ 'error': 'name or number cannot be empty' }).end()
  }

  if (persons.find(p => p.name === person.name)) {
    response.status(400).json({ 'error': 'name already in phonebook' }).end()
  }

  const maxId = persons.length === 0 ? 0 : Math.max(...persons.map(p => p.id))

  person.id = maxId + 1

  persons = persons.concat(person)

  response.json(person)
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)

    if (person) {
        persons = persons.filter(person => person.id !== id)
        response.status(204).end()
    } else {
        response.status(404).end()
    }
    
})

app.get('/info', (request, response) => {
    response.writeHead(200, { 'Content-Type': 'text/plain' })
    response.write("Phonebook has info for " + persons.length + " people. \n")
    response.end(Date())
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
