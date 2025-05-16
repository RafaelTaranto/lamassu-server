import {
  ApolloClient,
  ApolloProvider,
  InMemoryCache,
  ApolloLink,
} from '@apollo/client'
import { onError } from '@apollo/client/link/error'
import createUploadLink from 'apollo-upload-client/createUploadLink.mjs'
import React, { useContext } from 'react'
import { useLocation } from 'wouter'

import AppContext from '../AppContext'

const uploadLink = createUploadLink({
  credentials: 'include',
  uri: `/graphql`,
})

const getClient = (navigate, location, getUserData, setUserData, setRole) =>
  new ApolloClient({
    link: ApolloLink.from([
      onError(({ graphQLErrors, networkError }) => {
        if (graphQLErrors)
          graphQLErrors.forEach(({ message, locations, path, extensions }) => {
            if (extensions?.code === 'UNAUTHENTICATED') {
              setUserData(null)
              if (location !== '/login') navigate('/login')
            }
            console.log(
              `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
            )
          })
        if (networkError) console.log(`[Network error]: ${networkError}`)
      }),
      new ApolloLink((operation, forward) => {
        return forward(operation).map(response => {
          const context = operation.getContext()
          const {
            response: { headers },
          } = context

          if (headers) {
            const role = headers.get('lamassu_role')
            setRole(role)
          }

          return response
        })
      }),
      uploadLink,
    ]),
    cache: new InMemoryCache(),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'no-cache',
        errorPolicy: 'ignore',
      },
      query: {
        fetchPolicy: 'no-cache',
        errorPolicy: 'all',
      },
      mutate: {
        errorPolicy: 'all',
      },
    },
  })

const Provider = ({ children }) => {
  const [location, navigate] = useLocation()
  const { userData, setUserData, setRole } = useContext(AppContext)
  const client = getClient(
    navigate,
    location,
    () => userData,
    setUserData,
    setRole,
  )

  return <ApolloProvider client={client}>{children}</ApolloProvider>
}

export default Provider
