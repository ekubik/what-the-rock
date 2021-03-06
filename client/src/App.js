import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import "./index.css";
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  createHttpLink,
} from "@apollo/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { setContext } from "@apollo/client/link/context";

import Footer from "./components/Footer";
import Header from "./components/Header";
import Home from "./pages/Home";
import SignUp from "./pages/Signup";
import Login from "./pages/Login";
import SingleRock from "./pages/SingleRock";
import Profile from "./pages/UserProfile";
import NewRockForm from "./pages/NewRock";


const httpLink = createHttpLink({
  uri: "/graphql",
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem("id_token");
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});
const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

function App() {
  return (
    <ApolloProvider client={client}>
      <Router>
        <div className="container-fluid">
          <div>
            <Header />
          </div>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/rocks/:rockId"
              element={<SingleRock />}
            />
            <Route path="/myprofile" element={<Profile />} />
            <Route path="users/:username" element={<Profile />} />
            <Route path="/addRock" element={<NewRockForm />} />
            <Route path="*" element={<Home />} />
          </Routes>
          <div> </div>
          <Footer />{" "}
        </div>
      </Router>
    </ApolloProvider>
  );
}

export default App;
