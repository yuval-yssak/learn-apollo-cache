import apolloServer from 'apollo-server'
const { ApolloServer, gql } = apolloServer

const typeDefs = gql`
  type Query {
    todos: [Todo]
  }

  type Todo {
    id: String!
    title: String!
    description: String
  }

  type Mutation {
    addTodo(title: String!, description: String): Todo
    updateTodo(id: String!, title: String, description: String): Todo
  }
`

const todos = []

const resolvers = {
  Query: { todos: () => todos },
  Mutation: {
    addTodo: (_, { title, description }) => {
      const id = todos
        .map(todo => todo.id)
        .reduce(
          (max, id) => 1 + +(max > id ? max : id),
          (todos.length && todos[0].id) || 0
        )

      todos.push({ id, title, description })
      return todos[todos.length - 1]
    },
    updateTodo: (_, { id, title, description }) => {
      const todo = todos.find(todo => todo.id == id)
      if (!todo) throw new Error(`cannot find todo with ID ${id}`)

      todo.title = title
      todo.description = description
      return todo
    }
  }
}

const server = new ApolloServer({ typeDefs, resolvers })
server.listen().then(({ url }) => console.log(`server ready at ${url}`))
