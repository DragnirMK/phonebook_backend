const mongoose = require('mongoose')

if (process.argv.length<3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]

const url =
  `mongodb+srv://pierre:${password}@cluster0.cjx9xig.mongodb.net/?retryWrites=true&w=majority`

mongoose.set('strictQuery',false)
mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

if (process.argv.length === 3) {
  // Show all entries
  var str = 'phonebook: \n'
  Person.find({}).then(result => {
    result.forEach(p => {
      str += p.name + ' ' + p.number + '\n'
    })
    console.log(str)
    mongoose.connection.close()
  })
} else {
  const name = process.argv[3]
  const number = process.argv[4]

  if (name && number) {
    const person = new Person({
      name: process.argv[3],
      number: process.argv[4],
    })

    person.save().then(() => {
      console.log('Added ' + person.name + ' number ' + person.number + ' to notebook.')
      mongoose.connection.close()
    })
  } else {
    console.log('name or number undefined')
    mongoose.connection.close()
  }
}

