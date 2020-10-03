import React, { useState } from 'react'
import './App.css'
import { useApolloClient, gql, useQuery, useMutation } from '@apollo/client'
import styled from 'styled-components'

const TodoDiv = styled.div`
  display: flex;
  width: 100%;

  input:nth-of-type(1) {
    flex: 1;
  }
  input:nth-of-type(2) {
    flex: 3;
  }
`

const WrapperDiv = styled.div`
  margin: 10px auto;
  min-width: 400px;
  width: 40%;
`

function App() {
  const client = useApolloClient()
  return (
    <WrapperDiv>
      <Todos />
      <div>
        <button
          onClick={() => {
            const query = gql`
              query CacheQueryTodos {
                todos {
                  id
                  title
                  description
                }
              }
            `
            const data = client.readQuery({ query })
            client.writeQuery({
              query,
              data: {
                todos: [
                  ...data.todos,
                  {
                    id: 100,
                    title: 'om',
                    description: 'shalom',
                    __typename: 'Todo'
                  }
                ]
              }
            })
          }}
        >
          Add arbitrary data only to cache
        </button>
      </div>
    </WrapperDiv>
  )
}

function Todos() {
  const GET_TODOS = gql`
    query {
      todos {
        id
        title
        description
      }
    }
  `

  const ADD_TODO = gql`
    mutation AddTodo($title: String!, $description: String) {
      addTodo(title: $title, description: $description) {
        id
        title
        description
      }
    }
  `

  const { loading, error, data } = useQuery(GET_TODOS)
  const [addTodo] = useMutation(ADD_TODO, {
    refetchQueries: [{ query: GET_TODOS }]
  })
  const [newTitle, setNewTitle] = useState()
  const [newDescription, setNewDescription] = useState()
  return (
    <div className="App">
      {loading && <p>loading...</p>}
      {error && <p>error {error.description}</p>}
      {data && (
        <>
          {data.todos.map(props => (
            <Todo key={props.id} {...props} />
          ))}
          <form
            onSubmit={e => {
              e.preventDefault()
              addTodo({
                variables: { title: newTitle, description: newDescription }
              })
            }}
          >
            <input
              placeholder="title"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
            ></input>
            <input
              placeholder="description"
              value={newDescription}
              onChange={e => setNewDescription(e.target.value)}
            ></input>
            <button type="submit">Add Todo</button>
          </form>
        </>
      )}
    </div>
  )
}

function Todo({ id, title, description }) {
  const UPDATE_TODO = gql`
    mutation UpdateTodo($id: String!, $title: String, $description: String) {
      updateTodo(id: $id, title: $title, description: $description) {
        id
        title
        description
      }
    }
  `
  const [updateTodo, { data }] = useMutation(UPDATE_TODO)
  const [viewedTitle, setViewedTitle] = useState(title)
  const [viewedDescription, setViewedDescription] = useState(description)
  return (
    <>
      <TodoDiv key={id}>
        <input
          value={viewedTitle}
          onChange={e => setViewedTitle(e.target.value)}
        />
        <input
          value={viewedDescription}
          onChange={e => setViewedDescription(e.target.value)}
        />
        <button
          onClick={e => {
            updateTodo({
              variables: {
                id,
                title: viewedTitle,
                description: viewedDescription
              }
            })
          }}
        >
          +
        </button>
      </TodoDiv>
    </>
  )
}

export default App
